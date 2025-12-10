import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiError, parseJson, success, withApiHandler } from '@/lib/api-handler'
import {
	documentStatusTypeReorderBodySchema,
} from '../helpers'

export const POST = withApiHandler(async (request: NextRequest) => {
	const payload = await parseJson(request, documentStatusTypeReorderBodySchema)

	const statusTypes = await prisma.documentStatusType.findMany({
		where: { id: { in: payload.items.map(item => item.id) } },
	})

	if (statusTypes.length !== payload.items.length) {
		throw new ApiError(404, 'Some status types not found')
	}

	const documentTypeId = statusTypes[0]?.documentTypeId
	const sameType = statusTypes.every(
		st => st.documentTypeId === documentTypeId
	)
	if (!sameType) {
		throw new ApiError(
			400,
			'All status types must belong to the same document type'
		)
	}

	await prisma.$transaction(
		payload.items.map(item =>
			prisma.documentStatusType.update({
				where: { id: item.id },
				data: { order: item.order },
			})
		)
	)

	return success({ success: true })
})

