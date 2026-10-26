import { IResourceItem } from '@/lib/types/resources/IResourceItem'

/**
 * Envelope de resposta retornado pelo endpoint `GET /api/v1/resources` do API Gateway.
 *
 * @interface IResourceListResponse
 * @property {string} owner_id - Identificador do usuário ou cliente autenticado.
 * @property {string[]} scopes_granted - Lista de escopos validados via introspecção (RFC 7662).
 * @property {ResourceItem[]} items - Coleção de recursos pertencentes ao usuário/cliente.
 */
export interface IResourceListResponse {
  readonly owner_id: string
  readonly scopes_granted: string[]
  readonly items: IResourceItem[]
}
