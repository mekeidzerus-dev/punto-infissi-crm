import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
	try {
		logger.info('🔗 Unlinking parameter from category...')

		const body = await request.json()
		const { categoryId, parameterId } = body

		logger.info('📝 Request body:', { categoryId, parameterId })

		if (!categoryId || !parameterId) {
			logger.error('❌ Missing required parameters:', {
				categoryId,
				parameterId,
			})
			return NextResponse.json(
				{ error: 'Category ID and Parameter ID are required' },
				{ status: 400 }
			)
		}

		// Находим связь CategoryParameter для этой категории и параметра
		logger.info(
			`🔍 Searching for CategoryParameter with categoryId: ${categoryId}, parameterId: ${parameterId}`
		)

		const categoryParameter = await prisma.categoryParameter.findFirst({
			where: {
				categoryId,
				parameterId,
			},
		})

		if (!categoryParameter) {
			logger.warn('⚠️ Category parameter link not found')
			return NextResponse.json(
				{ error: 'Category parameter link not found', categoryId, parameterId },
				{ status: 404 }
			)
		}

		// Удаляем связь
		await prisma.categoryParameter.delete({
			where: {
				id: categoryParameter.id,
			},
		})

		logger.info(
			`✅ Unlinked parameter ${parameterId} from category ${categoryId}`
		)
		return NextResponse.json({
			success: true,
			deletedLinkId: categoryParameter.id,
		})
	} catch (error) {
		logger.error('❌ Error unlinking parameter:', error)
		return NextResponse.json(
			{ error: 'Failed to unlink parameter', details: String(error) },
			{ status: 500 }
		)
	}
}
