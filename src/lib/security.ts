// Безопасность для продакшена
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'

export const security = {
	// Rate limiting
	rateLimiter: rateLimit({
		windowMs: 15 * 60 * 1000, // 15 минут
		max: 100, // максимум 100 запросов с одного IP
		message: 'Слишком много запросов, попробуйте позже',
		standardHeaders: true,
		legacyHeaders: false,
	}),

	// API rate limiting (более строгий)
	apiRateLimiter: rateLimit({
		windowMs: 15 * 60 * 1000,
		max: 50,
		message: 'Превышен лимит API запросов',
	}),

	// Helmet для безопасности заголовков
	helmetConfig: helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				styleSrc: ["'self'", "'unsafe-inline'"],
				scriptSrc: ["'self'"],
				imgSrc: ["'self'", 'data:', 'https:'],
			},
		},
		hsts: {
			maxAge: 31536000,
			includeSubDomains: true,
			preload: true,
		},
	}),

	// Валидация входных данных
	validateInput: (data: any, schema: any) => {
		// Простая валидация (можно заменить на Joi или Yup)
		for (const [key, rules] of Object.entries(schema)) {
			if (rules.required && !data[key]) {
				throw new Error(`Поле ${key} обязательно`)
			}
			if (rules.type && typeof data[key] !== rules.type) {
				throw new Error(`Поле ${key} должно быть типа ${rules.type}`)
			}
		}
		return true
	},

	// Санитизация данных
	sanitize: (input: string) => {
		return input
			.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
			.replace(/<[^>]*>/g, '')
			.trim()
	},
}
