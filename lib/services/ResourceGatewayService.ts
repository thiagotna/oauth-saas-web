import { GatewayRequestError } from '@/lib/errors/GatewayRequestError'
import { ICreateResourceDto } from '@/lib/types/resources/ICreateResourceDto'
import { IResourceItem } from '@/lib/types/resources/IResourceItem'
import { IResourceListResponse } from '@/lib/types/resources/IResourceListResponse'

/**
 * Serviço responsável por intermediar as requisições do BFF ao `api-gateway` (porta 8000).
 *
 * @class ResourceGatewayService
 */
export class ResourceGatewayService {
  private readonly gatewayBaseUrl: string

  /**
   * Cria uma instância de {@link ResourceGatewayService}.
   *
   * @constructor
   * @param {string} [gatewayBaseUrl] - URL base do API Gateway (padrão: `process.env.API_GATEWAY_URL`).
   */
  constructor(gatewayBaseUrl?: string) {
    this.gatewayBaseUrl =
      gatewayBaseUrl || process.env.API_GATEWAY_URL || 'http://localhost:8000'
  }

  /**
   * Lista todos os recursos protegidos disponíveis no `resource-db` para o portador do token.
   *
   * @public
   * @async
   * @param {string} accessToken - Token JWT válido obtido via sessão `httpOnly`.
   * @returns {Promise<IResourceListResponse>}
   * @throws {GatewayRequestError} Caso o token seja inválido/revogado (401) ou sem permissão (403).
   */
  public async listResources(
    accessToken: string,
  ): Promise<IResourceListResponse> {
    const response = await fetch(`${this.gatewayBaseUrl}/api/v1/resources`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}))
      throw new GatewayRequestError(
        errorBody.detail ||
          `Erro ${response.status} ao consultar recursos no API Gateway.`,
        response.status,
      )
    }

    return (await response.json()) as IResourceListResponse
  }

  /**
   * Cria um novo recurso protegido no banco `resource-db` através do API Gateway.
   *
   * @public
   * @async
   * @param {string} accessToken - Token JWT válido obtido via sessão `httpOnly`.
   * @param {ICreateResourceDto} payload - Dados do recurso a ser persistido.
   * @returns {Promise<IResourceItem>}
   * @throws {GatewayRequestError} Caso o token não possua escopo de escrita ou seja inválido.
   */
  public async createResource(
    accessToken: string,
    payload: ICreateResourceDto,
  ): Promise<IResourceItem> {
    const response = await fetch(`${this.gatewayBaseUrl}/api/v1/resources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new GatewayRequestError(
        data.detail ||
          `Erro ${response.status} ao gravar recurso no API Gateway.`,
        response.status,
      )
    }

    return data as IResourceItem
  }
}

/**
 * Instância singleton de {@link ResourceGatewayService}.
 *
 * @constant {ResourceGatewayService}
 */
export const resourceGatewayService = new ResourceGatewayService()
