import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function GET() {
	try {
		// Проверяем подключение к базе данных
		// Health check endpoint для мониторинга работоспособности приложения
		await prisma.$queryRaw`SELECT 1`

		// Получаем информацию о памяти
		const memUsage = process.memoryUsage()

		// Проверяем время работы процесса
		const uptime = process.uptime()

		return NextResponse.json(
			{
				status: 'healthy',
				timestamp: new Date().toISOString(),
				version: '1.1.0',
				uptime: Math.round(uptime) + 's',
				memory: {
					used: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
					total: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
					percentage: Math.round(
						(memUsage.heapUsed / memUsage.heapTotal) * 100
					),
				},
				database: 'connected',
				environment: process.env.NODE_ENV || 'development',
			},
			{ status: 200 }
		)
	} catch (error) {
		logger.error('Health check failed:', error)

		return NextResponse.json(
			{
				status: 'unhealthy',
				timestamp: new Date().toISOString(),
				error: error instanceof Error ? error.message : 'Unknown error',
				environment: process.env.NODE_ENV || 'development',
			},
			{ status: 500 }
		)
	}
}
