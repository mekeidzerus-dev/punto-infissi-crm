import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// PUT - изменить порядок статуса (↑↓)
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params
		const body = await request.json()
		const { direction, order } = body

		// Если передан order, просто обновляем его
		if (typeof order === 'number') {
			const updated = await prisma.documentStatusType.update({
				where: { id: parseInt(id) },
				data: { order },
			})
			logger.info(`✅ Updated status order: ${id} → ${order}`)
			return NextResponse.json({ success: true })
		}

		// Обработка direction (старый способ через ↑↓)
		if (!direction || !['up', 'down'].includes(direction)) {
			return NextResponse.json(
				{ error: 'Direction must be "up" or "down"' },
				{ status: 400 }
			)
		}

		// Получаем текущую связь
		const currentLink = await prisma.documentStatusType.findUnique({
			where: { id: parseInt(id) },
		})

		if (!currentLink) {
			return NextResponse.json(
				{ error: 'DocumentStatusType not found' },
				{ status: 404 }
			)
		}

		// Получаем все связи для этого типа документа, отсортированные по order
		const allLinks = await prisma.documentStatusType.findMany({
			where: { documentTypeId: currentLink.documentTypeId },
			orderBy: { order: 'asc' },
		})

		// Находим индекс текущей связи
		const currentIndex = allLinks.findIndex(link => link.id === currentLink.id)

		if (currentIndex === -1) {
			return NextResponse.json(
				{ error: 'Current link not found in sorted list' },
				{ status: 500 }
			)
		}

		// Определяем индекс соседней связи
		let targetIndex: number
		if (direction === 'up') {
			targetIndex = currentIndex - 1
			if (targetIndex < 0) {
				return NextResponse.json(
					{ error: 'Cannot move up: already first' },
					{ status: 400 }
				)
			}
		} else {
			targetIndex = currentIndex + 1
			if (targetIndex >= allLinks.length) {
				return NextResponse.json(
					{ error: 'Cannot move down: already last' },
					{ status: 400 }
				)
			}
		}

		const targetLink = allLinks[targetIndex]

		// Меняем order местами
		await prisma.$transaction([
			prisma.documentStatusType.update({
				where: { id: currentLink.id },
				data: { order: targetLink.order },
			}),
			prisma.documentStatusType.update({
				where: { id: targetLink.id },
				data: { order: currentLink.order },
			}),
		])

		logger.info(
			`✅ Moved status ${direction}: ${currentLink.id} ↔ ${targetLink.id}`
		)
		return NextResponse.json({ success: true })
	} catch (error) {
		logger.error('Error updating status order:', error || undefined)
		return NextResponse.json(
			{ error: 'Failed to update status order' },
			{ status: 500 }
		)
	}
}

