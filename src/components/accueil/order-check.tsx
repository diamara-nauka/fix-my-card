import { createSignal, onMount, Show } from 'solid-js'
import {
  getCachedOrderStatus,
  setCachedOrderStatus,
  fetchOrderStatus,
} from '../../utils/order-status-cache'

type LoadingState = 'loading' | 'open' | 'closed' | 'error'

export default function OrderCheck() {
  const [status, setStatus] = createSignal<LoadingState>('loading')

  const checkOrderStatus = async () => {
    // Vérifier le cache
    const cached = getCachedOrderStatus()
    if (cached) {
      setStatus(cached.ordersOpen ? 'open' : 'closed')
      return
    }

    // Sinon faire l'appel API
    try {
      const data = await fetchOrderStatus()
      setCachedOrderStatus(data)
      setStatus(data.ordersOpen ? 'open' : 'closed')
    } catch (error) {
      console.error('Error checking order status:', error)
      setStatus('error')
    }
  }

  onMount(() => {
    checkOrderStatus()
  })

  return (
    <>
      <Show when={status() === 'loading'}>
        <button
          disabled
          class="text-white inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none h-10 rounded-md px-6 bg-gradient-to-r from-gray-400 to-gray-500 shadow-lg cursor-not-allowed"
        >
          <span class="animate-pulse">Chargement...</span>
        </button>
      </Show>

      <Show when={status() === 'error'}>
        <button
          disabled
          class="text-white inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none h-10 rounded-md px-6 bg-gradient-to-r from-gray-400 to-gray-500 shadow-lg cursor-not-allowed"
        >
          ⚠️ Erreur
        </button>
      </Show>

      <Show when={status() === 'open'}>
        <button
          onClick={() => (window.location.href = '/devis')}
          class="text-white inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all outline-none focus-visible:ring-2 h-10 rounded-md px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg cursor-pointer active:scale-95"
        >
          <span class="relative flex size-3">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span class="relative inline-flex size-3 rounded-full bg-green-500"></span>
          </span>
          &nbsp;Commandes ouvertes
        </button>
      </Show>

      <Show when={status() === 'closed'}>
        <button
          disabled
          class="text-white inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none h-10 rounded-md px-6 bg-gradient-to-r from-gray-400 to-gray-500 shadow-lg cursor-not-allowed"
        >
          <span class="relative flex size-3">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            <span class="relative inline-flex size-3 rounded-full bg-red-500"></span>
          </span>
          &nbsp;Commandes fermées
        </button>
      </Show>
    </>
  )
}