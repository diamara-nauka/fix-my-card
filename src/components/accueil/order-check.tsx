import { onMount, Show } from 'solid-js'
import { orderStatusStore } from '../../stores/order-status.store.ts'

export default function OrderCheck() {
  onMount(() => {
    orderStatusStore.load()
  })

  return (
    <>
      <Show when={orderStatusStore.isLoading()}>
        <button
          disabled
          class="text-white inline-flex items-center justify-center gap-2
          whitespace-nowrap text-sm font-medium transition-all
          disabled:pointer-events-none disabled:opacity-50 outline-none h-10
          rounded-md px-6 bg-gradient-to-r from-gray-400 to-gray-500
          shadow-lg cursor-not-allowed"
        >
          <span class="animate-pulse">Chargement...</span>
        </button>
      </Show>

      <Show when={orderStatusStore.isError()}>
        <button
          disabled
          class="text-white inline-flex items-center justify-center gap-2
          whitespace-nowrap text-sm font-medium transition-all
          disabled:pointer-events-none disabled:opacity-50 outline-none h-10
          rounded-md px-6 bg-gradient-to-r from-gray-400 to-gray-500
          shadow-lg cursor-not-allowed"
        >
          ⚠️ Erreur
        </button>
      </Show>

      <Show when={orderStatusStore.isOpen()}>
        <button
          onClick={() => (window.location.href = '/devis')}
          class="text-white inline-flex items-center justify-center gap-2
          whitespace-nowrap text-sm font-medium transition-all outline-none
          focus-visible:ring-2 h-10 rounded-md px-6 bg-gradient-to-r
          from-blue-600 to-purple-600 hover:from-blue-700
          hover:to-purple-700 shadow-lg cursor-pointer active:scale-95"
        >
          <span class="relative flex size-3">
            <span
              class="absolute inline-flex h-full w-full animate-ping
              rounded-full bg-green-400 opacity-75"
            ></span>
            <span
              class="relative inline-flex size-3 rounded-full
              bg-green-500"
            ></span>
          </span>
          &nbsp;Commandes ouvertes
        </button>
      </Show>

      <Show when={orderStatusStore.isClosed()}>
        <button
          disabled
          class="text-white inline-flex items-center justify-center gap-2
          whitespace-nowrap text-sm font-medium transition-all
          disabled:pointer-events-none disabled:opacity-50 outline-none h-10
          rounded-md px-6 bg-gradient-to-r from-gray-400 to-gray-500
          shadow-lg cursor-not-allowed"
        >
          <span class="relative flex size-3">
            <span
              class="absolute inline-flex h-full w-full animate-ping
              rounded-full bg-red-400 opacity-75"
            ></span>
            <span
              class="relative inline-flex size-3 rounded-full
              bg-red-500"
            ></span>
          </span>
          &nbsp;Commandes fermées
        </button>
      </Show>
    </>
  )
}
