import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// GET - получить все статусы с типами документов
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const documentType = searchParams.get('documentType') // proposal, order, invoice

		if (documentType) {
			// Получить статусы для конкретного типа документа
			const type = await prisma.documentType.findUnique({
				where: { name: documentType },
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
			})

			if (!type) {
				return NextResponse.json(
					{ error: 'Document type not found' },
					{ status: 404 }
				)
			}

			const statuses = type.statuses.map(st => ({
				...st.status,
				order: st.order,
				isDefault: st.isDefault,
			}))

			// Сортируем только по order, без перемещения основного статуса
			statuses.sort((a, b) => a.order - b.order)

			return NextResponse.json(statuses)
		}

		// Получить все статусы
		const statuses = await prisma.documentStatus.findMany({
			where: { isActive: true },
			include: {
				documentTypes: {
					include: {
						documentType: true,
					},
					orderBy: {
						order: 'asc',
					},
				},
			},
			orderBy: { name: 'asc' },
		})

		return NextResponse.json(statuses)
	} catch (error) {
		logger.error('Error fetching document statuses:', error || undefined)
		return NextResponse.json(
			{ error: 'Failed to fetch document statuses' },
			{ status: 500 }
		)
	}
}

// POST - создать новый статус
export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const { name, nameRu, nameIt, color, documentTypeIds } = body

		// Создаем статус
		const status = await prisma.documentStatus.create({
			data: {
				name,
				nameRu,
				nameIt,
				color: color || '#gray',
			},
		})

		// Связываем с типами документов
		if (documentTypeIds && Array.isArray(documentTypeIds)) {
			for (let i = 0; i < documentTypeIds.length; i++) {
				await prisma.documentStatusType.create({
					data: {
						documentTypeId: documentTypeIds[i],
						statusId: status.id,
						order: i,
					},
				})
			}
		}

		logger.info(`✅ Created document status: ${status.name}`)
		return NextResponse.json(status, { status: 201 })
	} catch (error) {
		logger.error('Error creating document status:', error || undefined)
		return NextResponse.json(
			{ error: 'Failed to create document status' },
			{ status: 500 }
		)
	}
}

// PUT - обновить статус
export async function PUT(request: NextRequest) {
	try {
		const body = await request.json()
		const { id, name, nameRu, nameIt, color, documentTypeIds } = body

		// Обновляем статус
		const status = await prisma.documentStatus.update({
			where: { id: parseInt(id) },
			data: {
				...(name && { name }),
				...(nameRu && { nameRu }),
				...(nameIt && { nameIt }),
				...(color && { color }),
			},
		})

		// Обновляем связи с типами документов
		if (documentTypeIds && Array.isArray(documentTypeIds)) {
			// Удаляем старые связи
			await prisma.documentStatusType.deleteMany({
				where: { statusId: status.id },
			})

			// Создаем новые связи
			for (let i = 0; i < documentTypeIds.length; i++) {
				await prisma.documentStatusType.create({
					data: {
						documentTypeId: documentTypeIds[i],
						statusId: status.id,
						order: i,
					},
				})
			}
		}

		logger.info(`✅ Updated document status: ${status.name}`)
		return NextResponse.json(status)
	} catch (error) {
		logger.error('Error updating document status:', error || undefined)
		return NextResponse.json(
			{ error: 'Failed to update document status' },
			{ status: 500 }
		)
	}
}

// DELETE - удалить статус
export async function DELETE(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const id = searchParams.get('id')

		if (!id) {
			return NextResponse.json({ error: 'ID is required' }, { status: 400 })
		}

		// Проверяем, используется ли статус в документах
		const usageCount = await prisma.proposalDocument.count({
			where: { statusId: parseInt(id) },
		})

		if (usageCount > 0) {
			return NextResponse.json(
				{
					error: `Cannot delete status: used in ${usageCount} document(s)`,
				},
				{ status: 400 }
			)
		}

		// Удаляем связи
		await prisma.documentStatusType.deleteMany({
			where: { statusId: parseInt(id) },
		})

		// Удаляем статус
		await prisma.documentStatus.delete({
			where: { id: parseInt(id) },
		})

		logger.info(`✅ Deleted document status: ${id}`)
		return NextResponse.json({ success: true })
	} catch (error) {
		logger.error('Error deleting document status:', error || undefined)
		return NextResponse.json(
			{ error: 'Failed to delete document status' },
			{ status: 500 }
		)
	}
}
