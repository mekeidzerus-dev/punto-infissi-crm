import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiError, parseJson, success, withApiHandler } from '@/lib/api-handler'
import {
	categoryParameterUnlinkBodySchema,
	ensureCategoryId,
	ensureParameterId,
} from '../helpers'

export const POST = withApiHandler(async (request: NextRequest) => {
	const payload = await parseJson(request, categoryParameterUnlinkBodySchema)

	const categoryId = ensureCategoryId(payload.categoryId)
	const parameterId = ensureParameterId(payload.parameterId)

	const categoryParameter = await prisma.categoryParameter.findFirst({
		where: {
			categoryId,
			parameterId,
		},
	})

	if (!categoryParameter) {
		throw new ApiError(404, 'Category parameter link not found')
	}

	await prisma.categoryParameter.delete({
		where: { id: categoryParameter.id },
	})

	return success({ success: true, deletedLinkId: categoryParameter.id })
})
