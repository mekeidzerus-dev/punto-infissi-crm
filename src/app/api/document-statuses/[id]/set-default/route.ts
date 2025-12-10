import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiError, parseJson, success, withApiHandler } from '@/lib/api-handler'
import {
	documentStatusSetDefaultBodySchema,
	ensureStatusIdFromParams,
} from '../../helpers'

export const POST = withApiHandler(async (request: NextRequest, { params }) => {
	const id = ensureStatusIdFromParams(params)
	const payload = await parseJson(request, documentStatusSetDefaultBodySchema)

	// Проверяем, существует ли статус
	const status = await prisma.documentStatus.findUnique({
		where: { id },
		include: {
			documentTypes: {
				include: { documentType: true },
			},
		},
	})

	if (!status) {
		throw new ApiError(404, 'Status not found')
	}

	// Получаем все типы документов, к которым привязан этот статус
	const attachedDocumentTypeIds = status.documentTypes.map(dt => dt.documentTypeId)

	if (attachedDocumentTypeIds.length === 0) {
		throw new ApiError(400, 'Status is not attached to any document types')
	}

	// Используем транзакцию для атомарности
	await prisma.$transaction(async (tx) => {
		if (payload.isDefault) {
			// Устанавливаем статус как главный для всех типов документов, к которым он привязан
			// ВАЖНО: Снимаем флаг isDefault со ВСЕХ статусов во ВСЕХ типах документов
			// чтобы гарантировать, что только один статус будет главным
			await tx.documentStatusType.updateMany({
				where: {
					isDefault: true,
				},
				data: { isDefault: false },
			})

			// Затем устанавливаем isDefault для этого статуса во всех типах документов, к которым он привязан
			await tx.documentStatusType.updateMany({
				where: {
					statusId: id,
					documentTypeId: { in: attachedDocumentTypeIds },
				},
				data: { isDefault: true },
			})
		} else {
			// Снимаем флаг isDefault для этого статуса во всех типах документов
			await tx.documentStatusType.updateMany({
				where: {
					statusId: id,
					documentTypeId: { in: attachedDocumentTypeIds },
				},
				data: { isDefault: false },
			})
		}
	})

	// Возвращаем обновленные данные
	const updatedStatus = await prisma.documentStatus.findUnique({
		where: { id },
		include: {
			documentTypes: {
				include: { documentType: true },
			},
		},
	})

	return success({
		success: true,
		status: updatedStatus,
	})
})
