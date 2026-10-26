import { cookies } from 'next/headers'
import { IJwtClaims } from '@/lib/types/auth/IJwtClaims'

/**
 * Gerenciador responsável pelo ciclo de vida dos cookies de sessão OAuth 2.0 no lado do servidor (BFF).
 *
 * @class SessionCookieManager
 */
export class SessionCookieManager {
  /**
   * Nome da chave do cookie que armazena o Access Token.
   *
   * @type {string}
   * @static
   * @readonly
   */
  public static readonly ACCESS_TOKEN_KEY = 'saas_access_token'

  /**
   * Nome da chave do cookie que armazena o Refresh Token.
   *
   * @type {string}
   * @static
   * @readonly
   */
  public static readonly REFRESH_TOKEN_KEY = 'saas_refresh_token'

  /**
   * Tempo de vida padrão (TTL) do Access Token em segundos (15 minutos).
   *
   * @type {number}
   * @private
   * @readonly
   */
  private readonly defaultAccessMaxAge = 900

  /**
   * Tempo de vida padrão (TTL) do Refresh Token em segundos (7 dias).
   *
   * @type {number}
   * @private
   * @readonly
   */
  private readonly defaultRefreshMaxAge = 60 * 60 * 24 * 7

  /**
   * Armazena o `access_token` e, opcionalmente, o `refresh_token` em cookies `httpOnly` seguros.
   *
   * @public
   * @async
   * @param {string} accessToken - O token JWT de acesso emitido pelo Auth Server.
   * @param {number} [expiresIn] - Tempo de expiração do token de acesso em segundos.
   * @param {string} [refreshToken] - O token de atualização para renovação futura da sessão.
   * @returns {Promise<void>}
   */
  public async setSession(
    accessToken: string,
    expiresIn?: number,
    refreshToken?: string,
  ): Promise<void> {
    const cookieStore = await cookies()

    cookieStore.set(SessionCookieManager.ACCESS_TOKEN_KEY, accessToken, {
      httpOnly: true,
      path: '/',
      maxAge: expiresIn || this.defaultAccessMaxAge,
      sameSite: 'lax',
    })

    if (refreshToken) {
      cookieStore.set(SessionCookieManager.REFRESH_TOKEN_KEY, refreshToken, {
        httpOnly: true,
        path: '/',
        maxAge: this.defaultRefreshMaxAge,
        sameSite: 'lax',
      })
    }
  }

  /**
   * Recupera o `access_token` armazenado no cookie `httpOnly` da requisição atual.
   *
   * @public
   * @async
   * @returns {Promise<string | undefined>}
   */
  public async getAccessToken(): Promise<string | undefined> {
    const cookieStore = await cookies()
    return cookieStore.get(SessionCookieManager.ACCESS_TOKEN_KEY)?.value
  }

  /**
   * Recupera o `refresh_token` armazenado no cookie `httpOnly` da requisição atual.
   *
   * @public
   * @async
   * @returns {Promise<string | undefined>}
   */
  public async getRefreshToken(): Promise<string | undefined> {
    const cookieStore = await cookies()
    return cookieStore.get(SessionCookieManager.REFRESH_TOKEN_KEY)?.value
  }

  /**
   * Remove os cookies de sessão (`access_token` e `refresh_token`) do navegador.
   *
   * @public
   * @async
   * @returns {Promise<void>}
   */
  public async clearSession(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete(SessionCookieManager.ACCESS_TOKEN_KEY)
    cookieStore.delete(SessionCookieManager.REFRESH_TOKEN_KEY)
  }

  /**
   * Decodifica a seção de payload (Base64URL) de um token JWT para leitura de claims na interface.
   *
   * @public
   * @param {string} token - A string completa do token JWT (`header.payload.signature`).
   * @returns {IJwtClaims | null}
   */
  public decodeJwtPayload(token: string): IJwtClaims | null {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) return null

      const payload = Buffer.from(parts[1], 'base64url').toString('utf-8')
      return JSON.parse(payload) as IJwtClaims
    } catch {
      return null
    }
  }
}

/**
 * Instância singleton de {@link SessionCookieManager}.
 *
 * @constant {SessionCookieManager}
 */
export const sessionManager = new SessionCookieManager()
