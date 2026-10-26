import { NextRequest, NextResponse } from 'next/server'
import {
  ResourceGatewayService,
  resourceGatewayService,
} from '@/lib/services/ResourceGatewayService'
import {
  SessionCookieManager,
  sessionManager,
} from '@/lib/SessionCookieManager'
import { GatewayRequestError } from '@/lib/errors/GatewayRequestError'
import { ICreateResourceDto } from '@/lib/types/resources/ICreateResourceDto'

/**
 * Controller responsável por intermediar as operações de leitura e escrita de recursos
 * entre o cliente web e o microsserviço `api-gateway` (porta 8000).
 *
 * @class ResourceController
 */
export class ResourceController {
  private readonly gatewayService: ResourceGatewayService
  private readonly session: SessionCookieManager

  /**
   * Cria uma instância de {@link ResourceController}.
   *
   * @constructor
   * @param {ResourceGatewayService} [gatewayService=resourceGatewayService] - Serviço de comunicação com o API Gateway.
   * @param {SessionCookieManager} [session=sessionManager] - Gerenciador de cookies `httpOnly`.
   */
  constructor(
    gatewayService: ResourceGatewayService = resourceGatewayService,
    session: SessionCookieManager = sessionManager,
  ) {
    this.gatewayService = gatewayService
    this.session = session
  }

  /**
   * Processa a requisição `GET /api/resources`, listando os recursos do usuário autenticado.
   *
   * @public
   * @async
   * @returns {Promise<NextResponse>} Lista de recursos ou erro de autorização.
   */
  public async list(): Promise<NextResponse> {
    try {
      const accessToken = await this.session.getAccessToken()

      if (!accessToken) {
        return NextResponse.json(
          { error: 'Sessão não encontrada. Faça login.' },
          { status: 401 },
        )
      }

      const resources = await this.gatewayService.listResources(accessToken)
      return NextResponse.json(resources, { status: 200 })
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Processa a requisição `POST /api/resources`, gravando um novo recurso no `resource-db`
   * através do API Gateway.
   *
   * @public
   * @async
   * @param {NextRequest} req - Requisição HTTP contendo o payload {@link ICreateResourceDto}.
   * @returns {Promise<NextResponse>} O recurso recém-criado com status 201.
   */
  public async create(req: NextRequest): Promise<NextResponse> {
    try {
      const accessToken = await this.session.getAccessToken()

      if (!accessToken) {
        return NextResponse.json(
          { error: 'Sessão não encontrada. Faça login.' },
          { status: 401 },
        )
      }

      const payload = (await req.json()) as ICreateResourceDto

      if (!payload.title || !payload.content || !payload.classification) {
        return NextResponse.json(
          { error: 'Título, conteúdo e classificação são obrigatórios.' },
          { status: 400 },
        )
      }

      const createdItem = await this.gatewayService.createResource(
        accessToken,
        payload,
      )

      return NextResponse.json(createdItem, { status: 201 })
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Traduz exceções do Gateway em respostas HTTP padronizadas para o front-end.
   *
   * @private
   * @param {unknown} error - Exceção capturada.
   * @returns {NextResponse} Resposta JSON de erro.
   */
  private handleError(error: unknown): NextResponse {
    if (error instanceof GatewayRequestError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      )
    }

    return NextResponse.json(
      { error: 'Falha de comunicação com o API Gateway (porta 8000).' },
      { status: 502 },
    )
  }
}

/**
 * Instância singleton de {@link ResourceController}.
 *
 * @constant {ResourceController}
 */
export const resourceController = new ResourceController()
