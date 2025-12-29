import { getStore } from '@netlify/blobs'

export default async () => {
  const store = getStore('orders')
  const isOpen = (await store.get('isOpen')) === 'true'

  return new Response(JSON.stringify({ isOpen }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60',
    },
  })
}
