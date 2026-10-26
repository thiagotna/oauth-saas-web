'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { bffApiClient } from '@/lib/services/BffApiClientService'

/**
 * Componente de página responsável pela interface de autenticação do portal SaaS.
 * Aciona o {@link BffApiClientService} para negociar o fluxo OAuth 2.0 + PKCE S256 via BFF.
 *
 * @returns {React.JSX.Element} Formulário de login renderizado.
 */
export default function LoginPage(): React.JSX.Element {
  const router = useRouter()
  const [email, setEmail] = useState<string>('eng@architecture.dev')
  const [password, setPassword] = useState<string>('StrongPass!2026')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  /**
   * Manipula a submissão do formulário delegando a chamada para o serviço cliente do BFF.
   *
   * @param {React.FormEvent<HTMLFormElement>} event - Evento de submissão do formulário.
   * @returns {Promise<void>}
   */
  async function handleLoginSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault()
    setIsLoading(true)
    setErrorMessage('')

    try {
      await bffApiClient.login({ email, password })
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro inesperado ao autenticar.'
      setErrorMessage(message)
    } finally {
      // Garante que o botão será reabilitado tanto no sucesso quanto no erro
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
        <div className="mb-6">
          <span className="text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            OAuth 2.0 + PKCE S256
          </span>
          <h1 className="text-2xl font-bold mt-3 text-white">
            Vault SaaS Portal
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Autenticação protegida via BFF e Introspecção RFC 7662.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-slate-300 mb-1"
            >
              E-mail Corporativo
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-slate-300 mb-1"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-sm rounded-lg transition-colors cursor-pointer"
          >
            {isLoading
              ? 'Negociando PKCE + Emitindo JWT...'
              : 'Entrar no Portal'}
          </button>
        </form>
      </div>
    </main>
  )
}
