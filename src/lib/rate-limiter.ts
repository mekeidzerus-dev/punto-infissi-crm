/**
 * Simple in-memory rate limiter
 * Для production рекомендуется использовать Redis
 */

interface RateLimitRecord {
	count: number
	resetAt: number
}

class RateLimiter {
	private requests: Map<string, RateLimitRecord> = new Map()
	private cleanupInterval: NodeJS.Timeout | null = null

	constructor() {
		// Очистка старых записей каждую минуту
		this.cleanupInterval = setInterval(() => {
			this.cleanup()
		}, 60 * 1000)
	}

	/**
	 * Проверяет, не превышен ли лимит запросов
	 */
	check(
		identifier: string,
		maxRequests: number,
		windowMs: number
	): {
		allowed: boolean
		remaining: number
		resetAt: number
		retryAfter?: number
	} {
		const now = Date.now()
		const record = this.requests.get(identifier)

		if (!record || now > record.resetAt) {
			// Новое окно или окно истекло
			this.requests.set(identifier, {
				count: 1,
				resetAt: now + windowMs,
			})

			return {
				allowed: true,
				remaining: maxRequests - 1,
				resetAt: now + windowMs,
			}
		}

		if (record.count >= maxRequests) {
			// Лимит превышен
			return {
				allowed: false,
				remaining: 0,
				resetAt: record.resetAt,
				retryAfter: Math.ceil((record.resetAt - now) / 1000),
			}
		}

		// Увеличиваем счетчик
		record.count++
		this.requests.set(identifier, record)

		return {
			allowed: true,
			remaining: maxRequests - record.count,
			resetAt: record.resetAt,
		}
	}

	/**
	 * Сбрасывает лимит для идентификатора
	 */
	reset(identifier: string): void {
		this.requests.delete(identifier)
	}

	/**
	 * Очищает истекшие записи
	 */
	private cleanup(): void {
		const now = Date.now()
		for (const [key, record] of this.requests.entries()) {
			if (now > record.resetAt) {
				this.requests.delete(key)
			}
		}
	}

	/**
	 * Останавливает очистку (для тестов)
	 */
	destroy(): void {
		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval)
			this.cleanupInterval = null
		}
	}
}

// Singleton instance
const rateLimiter = new RateLimiter()

export { rateLimiter }

/**
 * Rate limiting config для разных endpoints
 */
export const RATE_LIMITS = {
	// Загрузка фавикона: 5 запросов в 15 минут
	FAVICON_UPLOAD: {
		maxRequests: 5,
		windowMs: 15 * 60 * 1000, // 15 минут
	},
	// Удаление фавикона: 10 запросов в 15 минут
	FAVICON_DELETE: {
		maxRequests: 10,
		windowMs: 15 * 60 * 1000,
	},
	// Загрузка логотипа: 3 запроса в 10 минут (более строгий лимит)
	LOGO_UPLOAD: {
		maxRequests: 3,
		windowMs: 10 * 60 * 1000, // 10 минут
	},
	// Удаление логотипа: 5 запросов в 10 минут
	LOGO_DELETE: {
		maxRequests: 5,
		windowMs: 10 * 60 * 1000,
	},
	// Общий API: 100 запросов в минуту
	API_GENERAL: {
		maxRequests: 100,
		windowMs: 60 * 1000, // 1 минута
	},
} as const

/**
 * Получает идентификатор клиента из request
 */
export function getClientIdentifier(request: Request): string {
	// Пробуем получить IP из заголовков
	const forwardedFor = request.headers.get('x-forwarded-for')
	const realIp = request.headers.get('x-real-ip')
	const cfConnectingIp = request.headers.get('cf-connecting-ip')

	const ip =
		cfConnectingIp || realIp || forwardedFor?.split(',')[0].trim() || 'unknown'

	// Можно добавить user-agent для более точной идентификации
	const userAgent = request.headers.get('user-agent') || 'unknown'

	return `${ip}:${userAgent.slice(0, 50)}`
}

/**
 * Middleware для rate limiting
 */
export function createRateLimitMiddleware(config: {
	maxRequests: number
	windowMs: number
}) {
	return (request: Request) => {
		const identifier = getClientIdentifier(request)
		const result = rateLimiter.check(
			identifier,
			config.maxRequests,
			config.windowMs
		)

		return result
	}
}
