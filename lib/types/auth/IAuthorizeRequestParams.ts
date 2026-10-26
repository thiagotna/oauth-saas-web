/**
 * Parâmetros necessários para solicitar um Authorization Code no Auth Server.
 *
 * @interface IAuthorizeRequestParams
 * @property {string} email - E-mail corporativo do usuário (Resource Owner).
 * @property {string} password - Senha do usuário para autenticação primária.
 * @property {string} codeChallenge - Desafio PKCE calculado em SHA-256 + Base64URL.
 * @property {'S256'} codeChallengeMethod - Algoritmo de hash PKCE utilizado.
 * @property {string} state - Valor opaco para verificação anti-CSRF.
 */
export interface IAuthorizeRequestParams {
  readonly email: string
  readonly password: string
  readonly codeChallenge: string
  readonly codeChallengeMethod: 'S256'
  readonly state: string
}
