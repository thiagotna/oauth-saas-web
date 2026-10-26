import { TResourceClassification } from '@/lib/types/resources/TResourceClassification'

/**
 * DTO (Data Transfer Object) para criação de um novo recurso protegido.
 *
 * @interface ICreateResourceDto
 * @property {string} title - Título do novo recurso.
 * @property {string} content - Conteúdo ou segredo a ser armazenado.
 * @property {ResourceClassification} classification - Classificação de segurança.
 */
export interface ICreateResourceDto {
  readonly title: string
  readonly content: string
  readonly classification: TResourceClassification
}
