import { TResourceClassification } from '@/lib/types/resources/TResourceClassification'

/**
 * Entidade que representa um registro armazenado no banco isolado `resource-db`.
 *
 * @interface IResourceItem
 * @property {string} id - UUID único do recurso.
 * @property {string} owner_id - Identificador do proprietário do recurso (`sub` do token).
 * @property {string} title - Título descritivo do recurso.
 * @property {string} content - Conteúdo protegido do recurso.
 * @property {ResourceClassification} classification - Grau de sigilo da informação.
 */
export interface IResourceItem {
  readonly id: string
  readonly owner_id: string
  readonly title: string
  readonly content: string
  readonly classification: TResourceClassification
}
