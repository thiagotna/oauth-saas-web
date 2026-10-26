/**
 * Erro customizado para falhas de comunicação ou autorização junto ao API Gateway.
 *
 * @class GatewayRequestError
 * @extends {Error}
 */
export class GatewayRequestError extends Error {
  /**
   * Código de status HTTP retornado pelo API Gateway (ex: 401, 403, 502).
   *
   * @type {number}
   * @readonly
   */
  public readonly statusCode: number

  /**
   * Cria uma instância de {@link GatewayRequestError}.
   *
   * @constructor
   * @param {string} message - Mensagem detalhando a falha no Gateway.
   * @param {number} [statusCode=500] - Status HTTP associado.
   */
  constructor(message: string, statusCode = 500) {
    super(message)
    this.name = 'GatewayRequestError'
    this.statusCode = statusCode
  }
}
