import { getStore } from '@netlify/blobs'
import { verifyToken } from './jwt-utils.js'

export default async (req: Request) => {
  const { isOpen } = await req.json()
  const authHeader = req.headers.get('Authorization')

  const { valid, error } = verifyToken(authHeader)

  if (!valid) {
    return new Response(JSON.stringify({ error: error || 'Non autorisé' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const store = getStore('orders')
  await store.set('isOpen', String(isOpen))

  return new Response(JSON.stringify({ success: true, isOpen }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
