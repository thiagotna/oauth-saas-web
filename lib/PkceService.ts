import crypto from 'crypto'
import { IPkceChallenge } from '@/lib/types/auth/IPkceChallenge'

/**
 * Serviço responsável pela geração dinâmica dos parâmetros criptográficos do protocolo
 * Proof Key for Code Exchange (PKCE - RFC 7636) e proteção de estado anti-CSRF.
 *
 * @class PkceService
 */
export class PkceService {
  /**
   * Quantidade de bytes aleatórios utilizados para gerar o `code_verifier`.
   *
   * @type {number}
   * @private
   * @readonly
   */
  private readonly verifierBytesLength: number

  /**
   * Quantidade de bytes aleatórios utilizados para gerar o parâmetro `state`.
   *
   * @type {number}
   * @private
   * @readonly
   */
  private readonly stateBytesLength: number

  /**
   * Cria uma instância de {@link PkceService}.
   *
   * @constructor
   * @param {number} [verifierBytesLength=48] - Tamanho em bytes para entropia do `code_verifier`.
   * @param {number} [stateBytesLength=16] - Tamanho em bytes para entropia do `state`.
   */
  constructor(verifierBytesLength = 48, stateBytesLength = 16) {
    this.verifierBytesLength = verifierBytesLength
    this.stateBytesLength = stateBytesLength
  }

  /**
   * Gera um novo par criptográfico PKCE (`code_verifier` e `code_challenge` via SHA-256)
   * acompanhado de um identificador `state` inédito para a requisição de login.
   *
   * @public
   * @returns {PkceChallenge} Objeto imutável contendo os artefatos PKCE da transação.
   */
  public generateChallenge(): IPkceChallenge {
    const codeVerifier = crypto
      .randomBytes(this.verifierBytesLength)
      .toString('base64url')

    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier, 'ascii')
      .digest('base64url')

    const state = crypto
      .randomBytes(this.stateBytesLength)
      .toString('base64url')

    return {
      codeVerifier,
      codeChallenge,
      codeChallengeMethod: 'S256',
      state,
    }
  }
}

/**
 * Instância singleton de {@link PkceService}.
 *
 * @constant {PkceService}
 */
export const pkceService = new PkceService()
