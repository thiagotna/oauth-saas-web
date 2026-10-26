/**
 * Representa as reivindicações (claims) padrão e customizadas contidas no payload de um token JWT.
 *
 * @interface IJwtClaims
 * @property {string} [sub] - Identificador único do sujeito/proprietário do token (Subject).
 * @property {string} [scope] - Lista de escopos de permissão separados por espaço concedidos ao token.
 * @property {number} [exp] - Timestamp Unix (em segundos) indicando o momento de expiração do token.
 * @property {number} [iat] - Timestamp Unix (em segundos) indicando quando o token foi emitido (Issued At).
 * @property {string} [jti] - Identificador único do token (JWT ID), utilizado para controle de revogação no Redis.
 */
export interface IJwtClaims {
  readonly sub?: string
  readonly scope?: string
  readonly exp?: number
  readonly iat?: number
  readonly jti?: string
  readonly [key: string]: unknown
}
