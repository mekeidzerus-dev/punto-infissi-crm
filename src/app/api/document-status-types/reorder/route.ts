import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// POST - массовое обновление порядка статусов
export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const { items, documentTypeId } = body // [{ id, order }, ...]

		if (!items || !Array.isArray(items) || items.length === 0) {
			return NextResponse.json(
				{ error: 'Items array is required and must not be empty' },
				{ status: 400 }
			)
		}

		// Валидация данных
		for (const item of items) {
			if (!item.id || typeof item.id !== 'number' || item.id <= 0) {
				return NextResponse.json(
					{ error: 'Invalid item ID' },
					{ status: 400 }
				)
			}
			if (typeof item.order !== 'number' || item.order < 0) {
				return NextResponse.json(
					{ error: 'Invalid order value' },
					{ status: 400 }
				)
			}
		}

		// Проверка что все id существуют и относятся к одному типу документа
		const statusTypes = await prisma.documentStatusType.findMany({
			where: { id: { in: items.map((i: { id: number }) => i.id) } },
		})

		if (statusTypes.length !== items.length) {
			return NextResponse.json(
				{ error: 'Some status types not found' },
				{ status: 404 }
			)
		}

		// Если передан documentTypeId, проверяем что все статусы относятся к нему
		if (documentTypeId) {
			const allSameType = statusTypes.every(
				st => st.documentTypeId === documentTypeId
			)
			if (!allSameType) {
				return NextResponse.json(
					{ error: 'All status types must belong to the same document type' },
					{ status: 400 }
				)
			}
		}

		// Проверка что order последовательный (0, 1, 2, ...)
		const orders = items.map((i: { order: number }) => i.order).sort((a, b) => a - b)
		const expectedOrders = Array.from({ length: items.length }, (_, i) => i)
		if (JSON.stringify(orders) !== JSON.stringify(expectedOrders)) {
			return NextResponse.json(
				{ error: 'Order values must be sequential starting from 0' },
				{ status: 400 }
			)
		}

		// Обновляем все элементы в транзакции
		await prisma.$transaction(
			items.map((item: { id: number; order: number }) =>
				prisma.documentStatusType.update({
					where: { id: item.id },
					data: { order: item.order },
				})
			)
		)

		logger.info(`✅ Reordered ${items.length} status items`)
		return NextResponse.json({ success: true })
	} catch (error) {
		logger.error('Error reordering statuses:', error || undefined)
		return NextResponse.json(
			{ error: 'Failed to reorder statuses' },
			{ status: 500 }
		)
	}
}

