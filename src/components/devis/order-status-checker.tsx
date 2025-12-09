import { type JSX, onMount, Show } from 'solid-js'
import { orderStatusStore } from '../../stores/order-status.store.ts'

type Props = {
  children: JSX.Element
}

const OrderStatusChecker = (props: Props) => {
  onMount(() => {
    orderStatusStore.load()
  })

  return (
    <>
      <Show when={orderStatusStore.isLoading()}>
        <div class="flex items-center gap-3 text-gray-600">
          <svg
            class="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p>Vérification de la disponibilité...</p>
        </div>
      </Show>

      <Show when={orderStatusStore.isClosed() || orderStatusStore.isError()}>
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p class="text-lg text-yellow-800">
            {orderStatusStore.isError()
              ? 'Une erreur est survenue. Veuillez réessayer plus tard.'
              : 'Les commandes sont actuellement fermées. Veuillez revenir plus tard.'}
          </p>
        </div>
      </Show>

      <Show when={orderStatusStore.isOpen()}>{props.children}</Show>
    </>
  )
}

export default OrderStatusChecker
