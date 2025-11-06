import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// GET - получить все типы документов
export async function GET() {
	try {
		const types = await prisma.documentType.findMany({
			where: { isActive: true },
			include: {
				statuses: {
					include: {
						status: true,
					},
					orderBy: {
						order: 'asc',
					},
				},
			},
			orderBy: { name: 'asc' },
		})

		return NextResponse.json(types)
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		const errorStack = error instanceof Error ? error.stack : undefined
		logger.error('❌ Error fetching document types:', error || undefined)
		logger.error('Error details:', { errorMessage, errorStack })
		
		// Безопасный ответ без stack trace в production
		const isDev =
			typeof process !== 'undefined' &&
			process.env?.NODE_ENV === 'development'
		return NextResponse.json(
			{
				error: 'Failed to fetch document types',
				details: isDev ? errorMessage : 'Internal server error',
			},
			{ status: 500 }
		)
	}
}

