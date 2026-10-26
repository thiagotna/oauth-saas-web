import { IJwtClaims } from '@/lib/types/auth/IJwtClaims'
import { IResourceItem } from '@/lib/types/resources/IResourceItem'

/**
 * Propriedades injetadas pelo Server Component da página de Dashboard
 * para renderização hidratada no Client Component {@link DashboardClientView}.
 *
 * @interface IDashboardViewProps
 * @property {IJwtClaims | null} jwtClaims - Claims decodificadas do payload do Access Token ativo.
 * @property {IResourceItem[]} initialResources - Lista inicial de recursos carregada via Server-Side Rendering (SSR).
 * @property {string} ownerId - Identificador do proprietário retornado pelo API Gateway (`sub`).
 * @property {string[]} scopes - Lista de escopos validados pela introspecção OAuth 2.0 (RFC 7662).
 * @property {string} [fetchError] - Mensagem de erro caso a comunicação inicial com o API Gateway falhe.
 */
export interface IDashboardViewProps {
  readonly jwtClaims: IJwtClaims | null
  readonly initialResources: IResourceItem[]
  readonly ownerId: string
  readonly scopes: string[]
  readonly fetchError?: string
}
