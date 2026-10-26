import React from 'react'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { sessionManager } from '@/lib/SessionCookieManager'
import { resourceGatewayService } from '@/lib/services/ResourceGatewayService'
import { GatewayRequestError } from '@/lib/errors/GatewayRequestError'
import { IResourceItem } from '@/lib/types/resources/IResourceItem'
import DashboardClientView from '@/app/dashboard/DashboardClientView'

export const instant = false

/**
 * Server Component da rota `/dashboard`.
 * Utiliza `await connection()` para declarar explicitamente que a página é dinâmica,
 * mantendo total compatibilidade com a flag `cacheComponents`.
 *
 * @async
 * @returns {Promise<React.JSX.Element>} Página renderizada no servidor.
 */
export default async function DashboardPage(): Promise<React.JSX.Element> {
  // Força o comportamento dinâmico no Next.js 15 sem usar route segment config
  await connection()

  const accessToken = await sessionManager.getAccessToken()

  if (!accessToken) {
    redirect('/login')
  }

  const jwtClaims = sessionManager.decodeJwtPayload(accessToken)

  let items: IResourceItem[] = []
  let ownerId = ''
  let scopes: string[] = []
  let fetchError: string | undefined

  try {
    const response = await resourceGatewayService.listResources(accessToken)
    items = response.items
    ownerId = response.owner_id
    scopes = response.scopes_granted
  } catch (error) {
    if (error instanceof GatewayRequestError && error.statusCode === 401) {
      redirect('/login')
    }

    fetchError =
      error instanceof Error
        ? error.message
        : 'Falha ao consultar recursos no API Gateway (porta 8000).'
  }

  return (
    <DashboardClientView
      jwtClaims={jwtClaims}
      initialResources={items}
      ownerId={ownerId}
      scopes={scopes}
      fetchError={fetchError}
    />
  )
}
