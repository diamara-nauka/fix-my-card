import jwt from 'jsonwebtoken'

/**
 * Vérifie la validité d'un token JWT
 * @param {string} authHeader - L'en-tête Authorization (format: "Bearer <token>")
 * @returns {{valid: boolean, error?: string, payload?: object}}
 */
export function verifyToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { valid: false, error: 'Token manquant' }
    }

    const token = authHeader.substring(7)

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        return { valid: true, payload: decoded }
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return { valid: false, error: 'Token expiré' }
        }
        return { valid: false, error: 'Token invalide' }
    }
}

/**
 * Récupère le nombre de tentatives de connexion pour une IP
 * @param {object} store - Le store Netlify Blobs
 * @param {string} clientIP - L'adresse IP du client
 * @returns {Promise<number>}
 */
export async function getRateLimitAttempts(store, clientIP) {
    const data = await store.get(clientIP)
    if (!data) return 0

    const { attempts, timestamp } = JSON.parse(data)
    const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000

    // Si les tentatives datent de plus de 15 minutes, on les efface
    if (timestamp < fifteenMinutesAgo) {
        await store.delete(clientIP)
        return 0
    }

    return attempts
}

/**
 * Incrémente le compteur de tentatives de connexion pour une IP
 * @param {object} store - Le store Netlify Blobs
 * @param {string} clientIP - L'adresse IP du client
 * @returns {Promise<void>}
 */
export async function incrementRateLimitAttempts(store, clientIP) {
    const current = await getRateLimitAttempts(store, clientIP)
    await store.set(
        clientIP,
        JSON.stringify({
            attempts: current + 1,
            timestamp: Date.now(),
        })
    )
}
