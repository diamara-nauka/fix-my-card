// netlify/functions/toggle-status.js
import { getStore } from '@netlify/blobs'

export default async (req) => {
  const { password, isOpen } = await req.json()

  if (password !== process.env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Non autorisé' }), {
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
