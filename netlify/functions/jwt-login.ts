import { getStore } from '@netlify/blobs'
import jwt from 'jsonwebtoken'
import {
  getRateLimitAttempts,
  incrementRateLimitAttempts,
} from './jwt-utils.ts'

export default async (req: Request) => {
  const { password } = await req.json()
  const clientIP = req.headers.get('x-forwarded-for') || 'unknown'

  // Rate limiting
  const rateLimitStore = getStore('rate-limit')
  const attempts = await getRateLimitAttempts(rateLimitStore, clientIP)

  if (attempts >= 5) {
    return new Response(
      JSON.stringify({
        error: 'Trop de tentatives. Réessayez dans 15 minutes.',
      }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  // Vérification du mot de passe
  if (password !== process.env.ADMIN_PASSWORD) {
    await incrementRateLimitAttempts(rateLimitStore, clientIP)
    return new Response(JSON.stringify({ error: 'Mot de passe incorrect' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Génération du JWT
  const token = jwt.sign(
    {
      admin: true,
      ip: clientIP,
      iat: Math.floor(Date.now() / 1000),
    },
    process.env.JWT_SECRET as string,
    { expiresIn: '1h' }
  )

  // Réinitialiser le compteur en cas de succès
  await rateLimitStore.delete(clientIP)

  return new Response(
    JSON.stringify({
      success: true,
      token,
      expiresIn: 3600, // 1 heure en secondes
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
