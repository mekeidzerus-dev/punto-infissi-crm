import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

/**
 * POST /api/document-statuses/[id]/set-default
 * Установить или снять пометку "основной" для статуса в конкретном типе документа
 */
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params
		const body = await request.json()
		const { documentTypeId, isDefault } = body

		if (!documentTypeId) {
			return NextResponse.json(
				{ error: 'documentTypeId is required' },
				{ status: 400 }
			)
		}

		const statusId = parseInt(id)
		const docTypeId = parseInt(documentTypeId)

		// Проверяем существование связи
		const statusType = await prisma.documentStatusType.findUnique({
			where: {
				documentTypeId_statusId: {
					documentTypeId: docTypeId,
					statusId: statusId,
				},
			},
			include: {
				status: true,
				documentType: true,
			},
		})

		if (!statusType) {
			return NextResponse.json(
				{ error: 'Status not found for this document type' },
				{ status: 404 }
			)
		}

		// Если устанавливаем как основной - снимаем пометку с других статусов этого типа
		if (isDefault) {
			await prisma.documentStatusType.updateMany({
				where: {
					documentTypeId: docTypeId,
					isDefault: true,
				},
				data: {
					isDefault: false,
				},
			})

			logger.info(
				`✅ Removed default flag from other statuses for document type ${statusType.documentType.name}`
			)
		}

		// Обновляем статус
		const updated = await prisma.documentStatusType.update({
			where: {
				documentTypeId_statusId: {
					documentTypeId: docTypeId,
					statusId: statusId,
				},
			},
			data: {
				isDefault: Boolean(isDefault),
			},
			include: {
				status: true,
				documentType: true,
			},
		})

		logger.info(
			`✅ ${isDefault ? 'Set' : 'Removed'} default status: ${updated.status.name} for ${updated.documentType.name}`
		)

		return NextResponse.json({
			success: true,
			statusType: {
				...updated,
				status: updated.status,
				documentType: updated.documentType,
			},
		})
	} catch (error) {
		logger.error('❌ Error setting default status:', error || undefined)
		return NextResponse.json(
			{
				error: 'Failed to set default status',
				details: String(error),
			},
			{ status: 500 }
		)
	}
}

