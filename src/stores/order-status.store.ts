import { createSignal } from 'solid-js'
import { fetchOrderStatus } from '../utils/order-status-api'
import {
  getCachedOrderStatus,
  setCachedOrderStatus,
} from '../utils/order-status-cache'

export type OrderStatus = 'loading' | 'open' | 'closed' | 'error'

const [orderStatus, setOrderStatus] = createSignal<OrderStatus>('loading')
const [isInitialized, setIsInitialized] = createSignal(false)

const loadOrderStatus = async (): Promise<void> => {
  if (isInitialized()) {
    return
  }

  const cached = getCachedOrderStatus()
  if (cached) {
    setOrderStatus(cached.ordersOpen ? 'open' : 'closed')
    setIsInitialized(true)
    return
  }

  try {
    const data = await fetchOrderStatus()
    setCachedOrderStatus(data)
    setOrderStatus(data.ordersOpen ? 'open' : 'closed')
    setIsInitialized(true)
  } catch (error) {
    console.error('Error loading order status:', error)
    setOrderStatus('error')
    setIsInitialized(true)
  }
}

const refreshOrderStatus = async (): Promise<void> => {
  setOrderStatus('loading')
  setIsInitialized(false)
  await loadOrderStatus()
}

export const orderStatusStore = {
  get status() {
    return orderStatus()
  },
  get isLoading() {
    return orderStatus() === 'loading'
  },
  get isOpen() {
    return orderStatus() === 'open'
  },
  get isClosed() {
    return orderStatus() === 'closed'
  },
  get isError() {
    return orderStatus() === 'error'
  },
  get initialized() {
    return isInitialized()
  },

  statusSignal: orderStatus,

  load: loadOrderStatus,
  refresh: refreshOrderStatus,
}
