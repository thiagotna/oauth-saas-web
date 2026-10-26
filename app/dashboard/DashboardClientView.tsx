'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { bffApiClient } from '@/lib/services/BffApiClientService'
import { IDashboardViewProps } from '@/lib/types/resources/IDashboardViewProps'
import { TResourceClassification } from '@/lib/types/resources/TResourceClassification'

/**
 * Componente Client-Side responsável pela interatividade do Dashboard:
 * criação de novos recursos protegidos, rotação manual de Refresh Token e revogação de sessão (Logout).
 *
 * @param {IDashboardViewProps} props - Dados pré-carregados no servidor via SSR.
 * @returns {React.JSX.Element} Interface completa do Dashboard SaaS.
 */
export default function DashboardClientView({
  jwtClaims,
  initialResources,
  ownerId,
  scopes,
  fetchError,
}: IDashboardViewProps): React.JSX.Element {
  const router = useRouter()
  const [title, setTitle] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const [classification, setClassification] =
    useState<TResourceClassification>('CONFIDENTIAL')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [statusFeedback, setStatusFeedback] = useState<string>('')
  const [actionError, setActionError] = useState<string>('')

  /**
   * Envia o formulário de criação de recurso para o proxy BFF e atualiza a listagem SSR.
   *
   * @param {React.FormEvent<HTMLFormElement>} event - Evento de submissão do formulário.
   * @returns {Promise<void>}
   */
  async function handleCreateResource(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault()
    setIsSubmitting(true)
    setStatusFeedback('')
    setActionError('')

    try {
      await bffApiClient.createResource({ title, content, classification })
      setTitle('')
      setContent('')
      setStatusFeedback('Recurso gravado com sucesso no resource-db!')
      router.refresh()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao criar recurso.'
      setActionError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Aciona a renovação do Access Token via `refresh_token` e atualiza as claims do JWT na tela.
   *
   * @returns {Promise<void>}
   */
  async function handleRefreshSession(): Promise<void> {
    setStatusFeedback('Rotacionando token via refresh_token...')
    setActionError('')

    try {
      await bffApiClient.refreshSession()
      setStatusFeedback('Token renovado com sucesso! (Novo JTI emitido)')
      router.refresh()
    } catch {
      router.push('/login')
      router.refresh()
    }
  }

  /**
   * Revoga o Access Token no Redis do Auth Server e encerra a sessão local.
   *
   * @returns {Promise<void>}
   */
  async function handleLogout(): Promise<void> {
    await bffApiClient.logout()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Cabeçalho */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Vault Resource Manager
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Owner ID autenticado:{' '}
              <code className="text-emerald-400 font-mono">
                {ownerId || jwtClaims?.sub || 'N/A'}
              </code>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRefreshSession}
              className="px-4 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              Renovar Token (Refresh)
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition-colors cursor-pointer"
            >
              Revogar &amp; Sair
            </button>
          </div>
        </header>

        {/* Alertas de Feedback e Erro */}
        {statusFeedback && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">
            {statusFeedback}
          </div>
        )}

        {(fetchError || actionError) && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {fetchError || actionError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Esquerda: Formulário + Inspecionador de Claims JWT */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-base font-semibold text-white mb-4">
                Novo Recurso Protegido
              </h2>

              <form onSubmit={handleCreateResource} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Título
                  </label>
                  <input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Chave Mestra de Produção"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Classificação
                  </label>
                  <select
                    value={classification}
                    onChange={(e) =>
                      setClassification(
                        e.target.value as TResourceClassification,
                      )
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="INTERNAL">INTERNAL</option>
                    <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                    <option value="TOP_SECRET">TOP_SECRET</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Conteúdo
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Dados sensíveis protegidos por escopo..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-sm rounded-lg transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Gravando via Gateway...' : 'Criar Recurso'}
                </button>
              </form>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
                Sessão JWT Ativa (Claims)
              </h2>
              <pre className="text-xs font-mono bg-slate-950 p-3 rounded-lg border border-slate-800 overflow-x-auto text-emerald-400">
                {JSON.stringify(jwtClaims, null, 2)}
              </pre>
            </div>
          </div>

          {/* Coluna Direita (2/3): Lista de Recursos do resource-db */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
              <h2 className="text-base font-semibold text-white">
                Recursos Armazenados ({initialResources.length})
              </h2>

              <div className="flex flex-wrap gap-2">
                {scopes.map((scopeItem) => (
                  <span
                    key={scopeItem}
                    className="text-xs font-mono px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                  >
                    {scopeItem}
                  </span>
                ))}
              </div>
            </div>

            {initialResources.length === 0 ? (
              <p className="text-sm text-slate-400">
                Nenhum recurso encontrado para este proprietário.
              </p>
            ) : (
              <div className="space-y-4">
                {initialResources.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">
                        {item.title}
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {item.classification}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300">{item.content}</p>
                    <div className="text-xs font-mono text-slate-500 pt-2 border-t border-slate-900 flex flex-wrap justify-between gap-2">
                      <span>ID: {item.id}</span>
                      <span>Owner: {item.owner_id}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
