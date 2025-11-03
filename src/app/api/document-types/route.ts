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
		logger.error('Error fetching document types:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch document types' },
			{ status: 500 }
		)
	}
}

