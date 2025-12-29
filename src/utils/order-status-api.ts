export type OrderStatusResponse = {
  isOpen: boolean
}

export const fetchOrderStatus = async (): Promise<OrderStatusResponse> => {
  const isDev = import.meta.env.DEV
  const apiUrl = isDev
    ? 'http://localhost:8888/.netlify/functions/get-status'
    : '/.netlify/functions/get-status'

  const response = await fetch(apiUrl)

  if (!response.ok) {
    throw new Error('Failed to fetch order status')
  }

  return response.json()
}
