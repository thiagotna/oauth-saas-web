/**
 * Resposta de emissão de tokens do endpoint `/api/v1/oauth/token`.
 *
 * @interface ITokenResponse
 * @property {string} access_token - Token JWT assinado com chave privada RS256.
 * @property {string} token_type - Tipo do token (padrão: `'Bearer'`).
 * @property {number} expires_in - Tempo de vida do token em segundos.
 * @property {string} [refresh_token] - Token opaco para rotação de sessão.
 * @property {string} [scope] - Escopos concedidos na sessão.
 */
export interface ITokenResponse {
  readonly access_token: string
  readonly token_type: string
  readonly expires_in: number
  readonly refresh_token?: string
  readonly scope?: string
}
