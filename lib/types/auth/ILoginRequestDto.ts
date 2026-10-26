/**
 * DTO (Data Transfer Object) que representa o corpo da requisição de login enviada pelo cliente ao BFF.
 *
 * @interface ILoginRequestDto
 * @property {string} email - E-mail corporativo do usuário (Resource Owner).
 * @property {string} password - Senha do usuário para validação no Auth Server.
 */
export interface ILoginRequestDto {
  readonly email: string
  readonly password: string
}
