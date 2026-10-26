/**
 * Resposta de sucesso do endpoint `/api/v1/oauth/authorize`.
 *
 * @interface IAuthorizeResponse
 * @property {string} code - Código de autorização temporário (TTL de 60s e uso único via GETDEL).
 * @property {string} state - Estado retornado pelo servidor para verificação anti-CSRF.
 */
export interface IAuthorizeResponse {
  readonly code: string
  readonly state: string
}
