import jwt from 'jsonwebtoken'
import type { Store } from '@netlify/blobs'

interface TokenPayload {
  admin: boolean
  ip: string
  iat?: number
}

interface VerificationResult {
  valid: boolean
  error?: string
  payload?: TokenPayload
}

/**
 * Vérifie la validité d'un token JWT
 */
export function verifyToken(authHeader: string | null): VerificationResult {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'Token manquant' }
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as TokenPayload
    return { valid: true, payload: decoded }
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return { valid: false, error: 'Token expiré' }
    }
    return { valid: false, error: 'Token invalide' }
  }
}

interface RateLimitData {
  attempts: number
  timestamp: number
}

/**
 * Récupère le nombre de tentatives de connexion pour une IP
 */
export async function getRateLimitAttempts(
  store: Store,
  clientIP: string
): Promise<number> {
  const data = (await store.get(clientIP, {
    type: 'json',
  })) as RateLimitData | null
  if (!data) return 0

  const { attempts, timestamp } = data
  const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000

  if (timestamp < fifteenMinutesAgo) {
    await store.delete(clientIP)
    return 0
  }

  return attempts
}

/**
 * Incrémente le compteur de tentatives de connexion pour une IP
 */
export async function incrementRateLimitAttempts(
  store: Store,
  clientIP: string
): Promise<void> {
  const current = await getRateLimitAttempts(store, clientIP)
  await store.set(
    clientIP,
    JSON.stringify({
      attempts: current + 1,
      timestamp: Date.now(),
    } as RateLimitData)
  )
}
