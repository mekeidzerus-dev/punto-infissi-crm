import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiError, parseJson, success, withApiHandler } from '@/lib/api-handler'
import {
	buildParameterValueUpdateData,
	ensureParameterValueIdFromParams,
	parameterValueUpdateBodyWithoutId,
} from '../helpers'

export const PUT = withApiHandler(async (request: NextRequest, { params }) => {
	const id = ensureParameterValueIdFromParams(params)
	const payload = await parseJson(request, parameterValueUpdateBodyWithoutId)

	const existingValue = await prisma.parameterValue.findUnique({
		where: { id },
	})

	if (!existingValue) {
		throw new ApiError(404, 'Parameter value not found')
	}

	if (payload.value) {
		const trimmed = payload.value.trim()
		if (trimmed !== existingValue.value) {
			const duplicate = await prisma.parameterValue.findFirst({
				where: {
					parameterId: existingValue.parameterId,
					value: trimmed,
					isActive: true,
					NOT: { id },
				},
			})

			if (duplicate) {
				throw new ApiError(400, 'Value already exists for this parameter')
			}
		}
	}

	const updatedValue = await prisma.parameterValue.update({
		where: { id },
		data: buildParameterValueUpdateData({ ...payload, id }),
	})

	return success(updatedValue)
})

export const DELETE = withApiHandler(async (_request, { params }) => {
	const id = ensureParameterValueIdFromParams(params)

	const existingValue = await prisma.parameterValue.findUnique({
		where: { id },
	})

	if (!existingValue) {
		throw new ApiError(404, 'Parameter value not found')
	}

	await prisma.parameterValue.update({
		where: { id },
		data: { isActive: false },
	})

	return success({ success: true })
})
