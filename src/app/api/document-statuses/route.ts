import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiError, parseJson, success, withApiHandler } from '@/lib/api-handler'
import {
	buildDocumentStatusCreateData,
	buildDocumentStatusUpdateData,
	documentStatusCreateBodySchema,
	documentStatusUpdateBodySchema,
	ensureStatusId,
	ensureDocumentTypeName,
	mapStatusWithCounts,
	buildStatusTypeUpserts,
} from './helpers'

async function fetchStatusesByType(documentType: string) {
	const type = await prisma.documentType.findUnique({
		where: { name: documentType },
		include: {
			statuses: {
				include: { status: true },
				orderBy: { order: 'asc' },
			},
		},
	})

	if (!type) {
		throw new ApiError(404, 'Document type not found')
	}

	return type.statuses
		.map(st => ({
			...st.status,
			order: st.order,
			isDefault: st.isDefault,
		}))
		.sort((a, b) => {
			// Сортируем по глобальному порядку, если он есть
			const aOrder = (a as any).globalOrder ?? a.order ?? 0
			const bOrder = (b as any).globalOrder ?? b.order ?? 0
			return aOrder - bOrder
		})
}

async function fetchAllStatuses() {
	const statuses = await prisma.documentStatus.findMany({
		where: { isActive: true },
		include: {
			documentTypes: {
				include: { documentType: true },
				orderBy: { order: 'asc' },
			},
		},
		orderBy: { globalOrder: 'asc' }, // Сортируем по глобальному порядку
	})

	// Преобразуем данные, чтобы включить id из DocumentStatusType
	const statusesWithId = statuses.map(status => ({
		...status,
		documentTypes: status.documentTypes.map((dt: any) => ({
			...dt,
			id: dt.id, // ID из DocumentStatusType уже должен быть в результате Prisma
		})),
	}))

	return mapStatusWithCounts(statusesWithId as any)
}

export const GET = withApiHandler(async (request: NextRequest) => {
	const documentType = ensureDocumentTypeName(
		request.nextUrl.searchParams.get('documentType')
	)

	if (documentType) {
		return success(await fetchStatusesByType(documentType))
	}

	return success(await fetchAllStatuses())
})

export const POST = withApiHandler(async (request: NextRequest) => {
	const payload = await parseJson(request, documentStatusCreateBodySchema)

	// Получаем максимальный globalOrder и добавляем 1 для нового статуса
	const maxOrder = await prisma.documentStatus.aggregate({
		_max: { globalOrder: true },
	})
	const newGlobalOrder = (maxOrder._max.globalOrder ?? -1) + 1

	const status = await prisma.documentStatus.create({
		data: {
			...buildDocumentStatusCreateData(payload),
			globalOrder: newGlobalOrder,
		},
	})

	if (payload.documentTypeIds?.length) {
		await prisma.documentStatusType.createMany({
			data: buildStatusTypeUpserts(status.id, payload.documentTypeIds),
		})
	}

	return success(status, 201)
})

export const PUT = withApiHandler(async (request: NextRequest) => {
	const payload = await parseJson(request, documentStatusUpdateBodySchema)

	const status = await prisma.documentStatus.update({
		where: { id: payload.id },
		data: buildDocumentStatusUpdateData(payload),
	})

	if (payload.documentTypeIds) {
		await prisma.$transaction(async tx => {
			await tx.documentStatusType.deleteMany({ where: { statusId: status.id } })
			if (payload.documentTypeIds?.length) {
				await tx.documentStatusType.createMany({
					data: buildStatusTypeUpserts(status.id, payload.documentTypeIds),
				})
			}
		})
	}

	return success(status)
})

export const DELETE = withApiHandler(async (request: NextRequest) => {
	const id = ensureStatusId(request.nextUrl.searchParams.get('id'))

	const usageCount = await prisma.proposalDocument.count({
		where: { statusId: id },
	})

	if (usageCount > 0) {
		throw new ApiError(
			400,
			`Cannot delete status: used in ${usageCount} document(s)`
		)
	}

	await prisma.$transaction(async tx => {
		await tx.documentStatusType.deleteMany({ where: { statusId: id } })
		await tx.documentStatus.delete({ where: { id } })
	})

	return success({ success: true })
})
