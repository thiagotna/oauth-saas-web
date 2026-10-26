/**
 * Erro customizado de domínio para falhas no protocolo OAuth 2.0 (RFC 6749 / RFC 7636).
 *
 * @class OAuthProtocolError
 * @extends {Error}
 */
export class OAuthProtocolError extends Error {
  /**
   * Código de status HTTP retornado pelo Auth Server.
   *
   * @type {number}
   * @readonly
   */
  public readonly statusCode: number

  /**
   * Cria uma instância de {@link OAuthProtocolError}.
   *
   * @constructor
   * @param {string} message - Descrição legível da falha de autenticação/autorização.
   * @param {number} [statusCode=400] - Status HTTP associado ao erro.
   */
  constructor(message: string, statusCode = 400) {
    super(message)
    this.name = 'OAuthProtocolError'
    this.statusCode = statusCode
  }
}
