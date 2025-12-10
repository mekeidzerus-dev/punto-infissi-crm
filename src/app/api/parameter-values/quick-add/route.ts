import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiError, parseJson, success, withApiHandler } from '@/lib/api-handler'
import {
	buildQuickAddValueData,
	parameterValueQuickAddBodySchema,
} from '../helpers'

export const POST = withApiHandler(async (request: NextRequest) => {
	const payload = await parseJson(request, parameterValueQuickAddBodySchema)

	const parameter = await prisma.parameterTemplate.findUnique({
		where: { id: payload.parameterId },
		include: {
			values: {
				where: { isActive: true },
				orderBy: { order: 'desc' },
			},
		},
	})

	if (!parameter) {
		throw new ApiError(404, 'Parameter not found')
	}

	const trimmedValue = payload.value.trim()
	const existing = await prisma.parameterValue.findFirst({
		where: {
			parameterId: payload.parameterId,
			value: trimmedValue,
			isActive: true,
		},
	})

	if (existing) {
		throw new ApiError(400, 'Value already exists')
	}

	const maxOrder = parameter.values[0]?.order ?? -1

	const newValue = await prisma.parameterValue.create({
		data: buildQuickAddValueData(payload, maxOrder + 1),
	})

	return success({
		value: newValue.value,
		valueIt: newValue.valueIt,
		displayName: newValue.displayName,
		hexColor: newValue.hexColor,
		id: newValue.id,
	})
})
