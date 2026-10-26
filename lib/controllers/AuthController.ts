import { NextRequest, NextResponse } from 'next/server'
import {
  OAuthClientService,
  oauthClientService,
} from '@/lib/services/OAuthClientService'
import {
  SessionCookieManager,
  sessionManager,
} from '@/lib/SessionCookieManager'
import { OAuthProtocolError } from '@/lib/errors/OAuthProtocolError'
import { ILoginRequestDto } from '@/lib/types/auth/ILoginRequestDto'

/**
 * Controller responsável por gerenciar as requisições HTTP de autenticação,
 * rotação de tokens (refresh) e encerramento de sessão (logout/revogação) no BFF.
 *
 * @class AuthController
 */
export class AuthController {
  private readonly oauthService: OAuthClientService
  private readonly session: SessionCookieManager

  /**
   * Cria uma instância de {@link AuthController}.
   *
   * @constructor
   * @param {OAuthClientService} [oauthService=oauthClientService] - Serviço cliente OAuth 2.0.
   * @param {SessionCookieManager} [session=sessionManager] - Gerenciador de cookies `httpOnly`.
   */
  constructor(
    oauthService: OAuthClientService = oauthClientService,
    session: SessionCookieManager = sessionManager,
  ) {
    this.oauthService = oauthService
    this.session = session
  }

  /**
   * Processa a requisição `POST /api/auth/login`, executando o fluxo OAuth 2.0 + PKCE S256
   * e persistindo os tokens resultantes em cookies `httpOnly`.
   *
   * @public
   * @async
   * @param {NextRequest} req - Objeto de requisição do Next.js.
   * @returns {Promise<NextResponse>} Resposta JSON indicando sucesso ou erro formatado.
   */
  public async login(req: NextRequest): Promise<NextResponse> {
    try {
      const body = (await req.json()) as ILoginRequestDto

      if (!body.email || !body.password) {
        return NextResponse.json(
          { error: 'E-mail e senha são obrigatórios.' },
          { status: 400 },
        )
      }

      const tokenData = await this.oauthService.authenticateWithPkce(
        body.email,
        body.password,
      )

      await this.session.setSession(
        tokenData.access_token,
        tokenData.expires_in,
        tokenData.refresh_token,
      )

      return NextResponse.json({
        success: true,
        tokenType: tokenData.token_type,
        expiresIn: tokenData.expires_in,
        scope: tokenData.scope,
      })
    } catch (error) {
      return this.handleError(
        error,
        'Não foi possível concluir a autenticação no Auth Server.',
      )
    }
  }

  /**
   * Processa a requisição `POST /api/auth/refresh`, renovando o `access_token`
   * através do `refresh_token` armazenado no cookie `httpOnly`.
   *
   * @public
   * @async
   * @returns {Promise<NextResponse>} Resposta JSON confirmando a rotação do token.
   */
  public async refresh(): Promise<NextResponse> {
    try {
      const refreshToken = await this.session.getRefreshToken()

      if (!refreshToken) {
        return NextResponse.json(
          { error: 'Refresh token não encontrado na sessão.' },
          { status: 401 },
        )
      }

      const tokenData = await this.oauthService.refreshAccessToken(refreshToken)

      await this.session.setSession(
        tokenData.access_token,
        tokenData.expires_in,
        tokenData.refresh_token,
      )

      return NextResponse.json({
        success: true,
        expiresIn: tokenData.expires_in,
      })
    } catch (error) {
      await this.session.clearSession()
      return this.handleError(error, 'Sessão expirada. Faça login novamente.')
    }
  }

  /**
   * Processa a requisição `POST /api/auth/logout`, revogando o token no Redis do Auth Server (RFC 7009)
   * e removendo os cookies de sessão do navegador.
   *
   * @public
   * @async
   * @returns {Promise<NextResponse>} Resposta JSON confirmando o encerramento da sessão.
   */
  public async logout(): Promise<NextResponse> {
    try {
      const accessToken = await this.session.getAccessToken()

      if (accessToken) {
        await this.oauthService.revokeToken(accessToken).catch(() => {
          // Mesmo que o Auth Server esteja indisponível, garantimos a limpeza local dos cookies
        })
      }
    } finally {
      await this.session.clearSession()
    }

    return NextResponse.json({ success: true })
  }

  /**
   * Padroniza o tratamento de exceções convertendo erros de domínio em respostas HTTP adequadas.
   *
   * @private
   * @param {unknown} error - Exceção capturada no bloco try/catch.
   * @param {string} fallbackMessage - Mensagem padrão para erros inesperados de rede/infraestrutura.
   * @returns {NextResponse} Resposta HTTP formatada com o status correspondente.
   */
  private handleError(error: unknown, fallbackMessage: string): NextResponse {
    if (error instanceof OAuthProtocolError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      )
    }

    return NextResponse.json({ error: fallbackMessage }, { status: 502 })
  }
}

/**
 * Instância singleton de {@link AuthController}.
 *
 * @constant {AuthController}
 */
export const authController = new AuthController()
