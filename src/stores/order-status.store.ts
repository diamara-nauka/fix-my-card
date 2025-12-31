import { createMemo, createRoot, createSignal } from 'solid-js'
import { fetchOrderStatus } from '../utils/order-status-api.ts'

export type OrderStatus = 'loading' | 'open' | 'closed' | 'error'

const [orderStatus, setOrderStatus] = createSignal<OrderStatus>('loading')

const loadOrderStatus = async (): Promise<void> => {
  try {
    const data = await fetchOrderStatus()
    setOrderStatus(data.isOpen ? 'open' : 'closed')
  } catch (error) {
    setOrderStatus('error')
  }
}

const createStore = () =>
  createRoot(() => {
    const isLoading = createMemo(() => orderStatus() === 'loading')
    const isOpen = createMemo(() => orderStatus() === 'open')
    const isClosed = createMemo(() => orderStatus() === 'closed')
    const isError = createMemo(() => orderStatus() === 'error')

    return {
      isLoading,
      isOpen,
      isClosed,
      isError,
      load: loadOrderStatus,
    }
  })

export const orderStatusStore = createStore()
