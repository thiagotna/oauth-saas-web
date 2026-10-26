import { PkceService, pkceService } from '@/lib/PkceService'
import { OAuthProtocolError } from '@/lib/errors/OAuthProtocolError'
import { IAuthorizeRequestParams } from '@/lib/types/auth/IAuthorizeRequestParams'
import { IAuthorizeResponse } from '@/lib/types/auth/IAuthorizeResponse'
import { ITokenResponse } from '@/lib/types/auth/ITokenResponse'

/**
 * Serviço cliente OAuth 2.0 responsável pela comunicação Server-to-Server (BFF)
 * com o microsserviço `auth-server`.
 *
 * @class OAuthClientService
 */
export class OAuthClientService {
  private readonly authServerUrl: string
  private readonly clientId: string
  private readonly clientSecret: string
  private readonly redirectUri: string
  private readonly defaultScopes: string
  private readonly pkce: PkceService

  /**
   * Cria uma instância de {@link OAuthClientService}.
   *
   * @constructor
   * @param {PkceService} [pkce=pkceService] - Instância do gerador criptográfico PKCE (Injeção de Dependência).
   */
  constructor(pkce: PkceService = pkceService) {
    this.authServerUrl = process.env.AUTH_SERVER_URL || 'http://localhost:8001'
    this.clientId = process.env.OAUTH_CLIENT_ID || 'web_app'
    this.clientSecret =
      process.env.OAUTH_CLIENT_SECRET || 'web_app_super_secret'
    this.redirectUri =
      process.env.OAUTH_REDIRECT_URI || 'https://app.local/callback'
    this.defaultScopes = 'read:resources write:resources'
    this.pkce = pkce
  }

  /**
   * Executa o fluxo completo de autenticação OAuth 2.0 + PKCE S256 em duas etapas:
   * 1. Gera um par inédito (`code_verifier` e `code_challenge`) e solicita o `code` em `/authorize`.
   * 2. Consome imediatamente o `code` de uso único em `/token` apresentando o `code_verifier`.
   *
   * @public
   * @async
   * @param {string} email - E-mail corporativo do usuário (Resource Owner).
   * @param {string} password - Senha em texto plano para validação no Auth Server.
   * @returns {Promise<ITokenResponse>} Objeto contendo o `access_token` (JWT), `refresh_token` e metadados de expiração.
   * @throws {OAuthProtocolError} Caso as credenciais sejam inválidas, o state divirja ou a verificação PKCE falhe.
   */
  public async authenticateWithPkce(
    email: string,
    password: string,
  ): Promise<ITokenResponse> {
    const { codeVerifier, codeChallenge, codeChallengeMethod, state } =
      this.pkce.generateChallenge()

    const authResponse = await this.requestAuthorizationCode({
      email,
      password,
      codeChallenge,
      codeChallengeMethod,
      state,
    })

    if (authResponse.state !== state) {
      throw new OAuthProtocolError(
        'Falha de segurança: divergência no parâmetro state (CSRF).',
        400,
      )
    }

    return await this.exchangeCodeForTokens(authResponse.code, codeVerifier)
  }

  /**
   * Renova a sessão do usuário utilizando um `refresh_token` válido (`grant_type=refresh_token`).
   *
   * @public
   * @async
   * @param {string} refreshToken - O Refresh Token armazenado no cookie `httpOnly`.
   * @returns {Promise<ITokenResponse>} Novo par de tokens (`access_token` e `refresh_token` rotacionado).
   * @throws {OAuthProtocolError} Caso o Refresh Token esteja expirado ou revogado.
   */
  public async refreshAccessToken(
    refreshToken: string,
  ): Promise<ITokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: refreshToken,
    })

    const response = await fetch(`${this.authServerUrl}/api/v1/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      cache: 'no-store',
    })

    const data = await response.json()

    if (!response.ok) {
      throw new OAuthProtocolError(
        data.error_description ||
          data.detail ||
          'Sessão expirada. Faça login novamente.',
        response.status,
      )
    }

    return data as ITokenResponse
  }

  /**
   * Solicita a revogação imediata de um token no Redis do Auth Server (RFC 7009).
   *
   * @public
   * @async
   * @param {string} token - O `access_token` ou `refresh_token` a ser invalidado.
   * @returns {Promise<void>}
   */
  public async revokeToken(token: string): Promise<void> {
    const params = new URLSearchParams({
      token,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    })

    await fetch(`${this.authServerUrl}/api/v1/oauth/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      cache: 'no-store',
    })
  }

  /**
   * Método interno que executa o `POST /api/v1/oauth/authorize` no Auth Server headless.
   *
   * @private
   * @async
   * @param {IAuthorizeRequestParams} params - Parâmetros de autorização e desafio PKCE.
   * @returns {Promise<IAuthorizeResponse>}
   * @throws {OAuthProtocolError}
   */
  private async requestAuthorizationCode(
    params: IAuthorizeRequestParams,
  ): Promise<IAuthorizeResponse> {
    const response = await fetch(
      `${this.authServerUrl}/api/v1/oauth/authorize`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: this.clientId,
          redirect_uri: this.redirectUri,
          scope: this.defaultScopes,
          code_challenge: params.codeChallenge,
          code_challenge_method: params.codeChallengeMethod,
          user_email: params.email,
          user_password: params.password,
          state: params.state,
        }),
        cache: 'no-store',
      },
    )

    const data = await response.json()

    if (!response.ok) {
      throw new OAuthProtocolError(
        data.error_description ||
          data.detail ||
          'Credenciais inválidas ou cliente não autorizado.',
        response.status,
      )
    }

    return data as IAuthorizeResponse
  }

  /**
   * Método interno que executa o `POST /api/v1/oauth/token` para consumir o `code` e validar o `code_verifier`.
   *
   * @private
   * @async
   * @param {string} code - O código de autorização de uso único recebido no passo anterior.
   * @param {string} codeVerifier - O segredo PKCE original para comprovação criptográfica S256.
   * @returns {Promise<ITokenResponse>}
   * @throws {OAuthProtocolError}
   */
  private async exchangeCodeForTokens(
    code: string,
    codeVerifier: string,
  ): Promise<ITokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
      code,
      code_verifier: codeVerifier,
    })

    const response = await fetch(`${this.authServerUrl}/api/v1/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      cache: 'no-store',
    })

    const data = await response.json()

    if (!response.ok) {
      throw new OAuthProtocolError(
        data.error_description ||
          data.detail ||
          'Falha na troca do código pelo token (PKCE).',
        response.status,
      )
    }

    return data as ITokenResponse
  }
}

/**
 * Instância singleton de {@link OAuthClientService}.
 *
 * @constant {OAuthClientService}
 */
export const oauthClientService = new OAuthClientService()
