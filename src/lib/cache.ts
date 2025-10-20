// Redis кэширование для продакшена
import Redis from 'ioredis'

const redis = new Redis({
	host: process.env.REDIS_HOST || 'localhost',
	port: parseInt(process.env.REDIS_PORT || '6379'),
	password: process.env.REDIS_PASSWORD,
	retryDelayOnFailover: 100,
	maxRetriesPerRequest: 3,
})

export const cache = {
	// Кэшируем часто запрашиваемые данные
	async get(key: string) {
		try {
			const data = await redis.get(key)
			return data ? JSON.parse(data) : null
		} catch (error) {
			console.error('Cache get error:', error)
			return null
		}
	},

	async set(key: string, value: any, ttl: number = 3600) {
		try {
			await redis.setex(key, ttl, JSON.stringify(value))
		} catch (error) {
			console.error('Cache set error:', error)
		}
	},

	async del(key: string) {
		try {
			await redis.del(key)
		} catch (error) {
			console.error('Cache delete error:', error)
		}
	},
}

// Кэширование продуктов
export const productCache = {
	async getProducts() {
		const cached = await cache.get('products:all')
		if (cached) return cached

		// Если нет в кэше, загружаем из БД
		const products = await prisma.product.findMany({
			include: { categories: true, parameters: true },
		})

		await cache.set('products:all', products, 1800) // 30 минут
		return products
	},

	async invalidateProducts() {
		await cache.del('products:all')
	},
}
