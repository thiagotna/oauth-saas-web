import { ILoginRequestDto } from '@/lib/types/auth/ILoginRequestDto'
import { ICreateResourceDto } from '@/lib/types/resources/ICreateResourceDto'
import { IResourceItem } from '@/lib/types/resources/IResourceItem'

/**
 * Serviço cliente HTTP executado no navegador (Client-Side) para comunicação
 * exclusiva com os endpoints internos do BFF do Next.js (`/api/*`).
 *
 * @class BffApiClientService
 */
export class BffApiClientService {
  /**
   * Envia as credenciais do usuário para a rota `/api/auth/login` do BFF,
   * iniciando o fluxo OAuth 2.0 + PKCE S256 no servidor.
   *
   * @public
   * @async
   * @param {ILoginRequestDto} credentials - E-mail e senha informados no formulário.
   * @returns {Promise<void>} Resolve em caso de sucesso na gravação dos cookies `httpOnly`.
   * @throws {Error} Caso o BFF retorne erro de validação ou falha de credenciais.
   */
  public async login(credentials: ILoginRequestDto): Promise<void> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data.error || 'Falha na autenticação junto ao BFF.')
    }
  }

  /**
   * Solicita a rotação do `access_token` utilizando o `refresh_token` armazenado no cookie `httpOnly`.
   *
   * @public
   * @async
   * @returns {Promise<void>} Resolve quando o novo par de tokens é gravado na sessão.
   * @throws {Error} Caso o `refresh_token` esteja expirado ou inválido.
   */
  public async refreshSession(): Promise<void> {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data.error || 'Sessão expirada. Faça login novamente.')
    }
  }

  /**
   * Aciona a rota `/api/auth/logout` para revogar o token no Redis (RFC 7009)
   * e limpar os cookies de sessão.
   *
   * @public
   * @async
   * @returns {Promise<void>}
   */
  public async logout(): Promise<void> {
    await fetch('/api/auth/logout', {
      method: 'POST',
    })
  }

  /**
   * Envia um novo recurso para ser persistido no `resource-db` via proxy BFF (`/api/resources`).
   *
   * @public
   * @async
   * @param {ICreateResourceDto} payload - Dados do recurso protegido.
   * @returns {Promise<IResourceItem>} O recurso criado pelo Resource Server.
   * @throws {Error} Caso ocorra falha de permissão (escopo) ou erro no Gateway.
   */
  public async createResource(
    payload: ICreateResourceDto,
  ): Promise<IResourceItem> {
    const response = await fetch('/api/resources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao criar recurso protegido.')
    }

    return data as IResourceItem
  }
}

/**
 * Instância singleton de {@link BffApiClientService} para uso nos Client Components.
 *
 * @constant {BffApiClientService}
 */
export const bffApiClient = new BffApiClientService()
