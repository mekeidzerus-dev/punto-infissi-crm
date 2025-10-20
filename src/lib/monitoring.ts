// Мониторинг приложения
const monitoring = {
	// Health Check endpoint
	healthCheck: async (req, res) => {
		try {
			// Проверяем базу данных
			await prisma.$queryRaw`SELECT 1`

			// Проверяем память
			const memUsage = process.memoryUsage()

			res.status(200).json({
				status: 'healthy',
				timestamp: new Date().toISOString(),
				uptime: process.uptime(),
				memory: {
					used: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
					total: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
				},
				version: process.env.npm_package_version || '1.0.0',
			})
		} catch (error) {
			res.status(500).json({
				status: 'unhealthy',
				error: error.message,
				timestamp: new Date().toISOString(),
			})
		}
	},

	// Метрики производительности
	performanceMetrics: {
		responseTime: (req, res, next) => {
			const start = Date.now()
			res.on('finish', () => {
				const duration = Date.now() - start
				console.log(`${req.method} ${req.url} - ${duration}ms`)
			})
			next()
		},
	},
}

export default monitoring
