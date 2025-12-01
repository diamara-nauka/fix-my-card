import type { OrderStatusResponse } from './order-status-api.ts'

type CachedData = {
  data: OrderStatusResponse
  timestamp: number
}

const CACHE_KEY = 'orderStatus'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const getCachedOrderStatus = (): OrderStatusResponse | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null

    const { data, timestamp }: CachedData = JSON.parse(cached)

    if (Date.now() - timestamp < CACHE_DURATION) {
      return data
    }

    localStorage.removeItem(CACHE_KEY)
    return null
  } catch {
    return null
  }
}

export const setCachedOrderStatus = (data: OrderStatusResponse): void => {
  try {
    const cacheData: CachedData = {
      data,
      timestamp: Date.now(),
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
  } catch (error) {
    console.error('Error caching order status:', error)
  }
}

export const clearOrderStatusCache = (): void => {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch (error) {
    console.error('Error clearing cache:', error)
  }
}
