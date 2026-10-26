/**
 * Representa o conjunto de artefatos criptográficos gerados para uma transação OAuth 2.0 com PKCE (RFC 7636).
 *
 * @interface PkceChallenge
 * @property {string} codeVerifier - Segredo criptográfico aleatório de alta entropia enviado apenas na troca do token (`/token`).
 * @property {string} codeChallenge - Hash SHA-256 em Base64URL derivado do `codeVerifier`, enviado na solicitação inicial (`/authorize`).
 * @property {'S256'} codeChallengeMethod - Método de transformação utilizado (fixado em `'S256'` por exigência de segurança).
 * @property {string} state - Token opaco aleatório utilizado para mitigar ataques de Cross-Site Request Forgery (CSRF).
 */
export interface IPkceChallenge {
  readonly codeVerifier: string
  readonly codeChallenge: string
  readonly codeChallengeMethod: 'S256'
  readonly state: string
}
