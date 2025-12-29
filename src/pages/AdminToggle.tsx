import { createSignal, createEffect, Show } from 'solid-js'

const isDev = import.meta.env.DEV
const basePath = isDev ? 'http://localhost:8888/' : '/'

type MessageType = 'success' | 'error' | null

export default function AdminToggle() {
  const [isOpen, setIsOpen] = createSignal<boolean | null>(null)
  const [isAuthenticated, setIsAuthenticated] = createSignal(false)
  const [password, setPassword] = createSignal('')
  const [loading, setLoading] = createSignal(false)
  const [message, setMessage] = createSignal<{
    text: string
    type: MessageType
  }>({
    text: '',
    type: null,
  })

  // Charger l'état au démarrage
  createEffect(() => {
    loadStatus()
  })

  const loadStatus = async () => {
    try {
      const response = await fetch(basePath + '.netlify/functions/get-status')
      const data = await response.json()
      setIsOpen(data.isOpen)
    } catch (error) {
      showMessage('Erreur lors du chargement', 'error')
    }
  }

  const showMessage = (text: string, type: MessageType) => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: null }), 4000)
  }

  const authenticate = async () => {
    if (!password()) {
      showMessage('Veuillez entrer un mot de passe', 'error')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(basePath + '.netlify/functions/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password() }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsAuthenticated(true)
        showMessage('Connecté avec succès', 'success')
      } else {
        showMessage(data.error || 'Mot de passe incorrect', 'error')
      }
    } catch (error) {
      showMessage('Erreur de connexion', 'error')
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async (newStatus: boolean) => {
    if (!isAuthenticated()) {
      showMessage('Non authentifié', 'error')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        basePath + '.netlify/functions/toggle-status',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: password(), isOpen: newStatus }),
        }
      )

      const data = await response.json()

      if (response.ok) {
        setIsOpen(newStatus)
        showMessage(
          `Commandes ${newStatus ? 'ouvertes' : 'fermées'} avec succès`,
          'success'
        )
      } else {
        showMessage(data.error || 'Erreur lors de la modification', 'error')
      }
    } catch (error) {
      showMessage('Erreur lors de la modification', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter') authenticate()
  }

  return (
    <div class="bg-white rounded-2xl shadow-2xl p-10 max-w-lg w-full">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">🔐 Administration</h1>
      <p class="text-gray-600 text-sm mb-8">Gestion de l'état des commandes</p>

      {/* Message */}
      <Show when={message().text}>
        <div
          class={`p-3 rounded-lg mb-5 text-sm ${
            message().type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}
        >
          {message().text}
        </div>
      </Show>

      {/* Statut actuel */}
      <div class="bg-gray-50 rounded-xl p-5 mb-8 border-l-4 border-purple-600">
        <div class="text-xs uppercase tracking-wider text-gray-600 mb-2">
          État actuel
        </div>
        <div
          class={`text-2xl font-bold ${
            isOpen() === null
              ? 'text-gray-400'
              : isOpen()
                ? 'text-green-600'
                : 'text-red-600'
          }`}
        >
          {isOpen() === null
            ? 'Chargement...'
            : isOpen()
              ? '🟢 Ouvert'
              : '🔴 Fermé'}
        </div>
      </div>

      {/* Section d'authentification */}
      <Show when={!isAuthenticated()}>
        <div class="space-y-3">
          <input
            type="password"
            placeholder="Mot de passe admin"
            value={password()}
            onInput={(e) => setPassword(e.currentTarget.value)}
            onKeyPress={handleKeyPress}
            autocomplete="current-password"
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-600 focus:outline-none text-base transition-colors"
          />
          <button
            onClick={authenticate}
            disabled={loading()}
            class="w-full bg-purple-600 text-white py-3.5 rounded-lg font-semibold hover:bg-purple-700 transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {loading() ? (
              <>
                Connexion
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </div>
      </Show>

      {/* Contrôles */}
      <Show when={isAuthenticated()}>
        <div class="space-y-3">
          <button
            onClick={() => toggleStatus(true)}
            disabled={loading()}
            class="w-full bg-green-600 text-white py-3.5 rounded-lg font-semibold hover:bg-green-700 transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {loading() ? (
              <>
                ✅ Ouvrir les commandes
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </>
            ) : (
              '✅ Ouvrir les commandes'
            )}
          </button>
          <button
            onClick={() => toggleStatus(false)}
            disabled={loading()}
            class="w-full bg-red-600 text-white py-3.5 rounded-lg font-semibold hover:bg-red-700 transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {loading() ? (
              <>
                ❌ Fermer les commandes
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </>
            ) : (
              '❌ Fermer les commandes'
            )}
          </button>
        </div>
      </Show>
    </div>
  )
}
