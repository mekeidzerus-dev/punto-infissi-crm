import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiError, parseJson, success, withApiHandler } from '@/lib/api-handler'
import {
	buildParameterValueCreateData,
	ensureParameterValueId,
	parseParameterValueQuery,
	parameterValueCreateBodySchema,
} from './helpers'

export const GET = withApiHandler(async (request: NextRequest) => {
	const query = parseParameterValueQuery(request.nextUrl.searchParams)

	const values = await prisma.parameterValue.findMany({
		where: {
			parameterId: query.parameterId,
			isActive: true,
		},
		orderBy: { order: 'asc' },
	})

	return success(values)
})

export const POST = withApiHandler(async (request: NextRequest) => {
	const { requireAuth } = await import('@/lib/auth-helpers')
	const { updateUserActivity } = await import('@/lib/activity-tracker')
	const user = await requireAuth()
	await updateUserActivity(user.id)
	const payload = await parseJson(request, parameterValueCreateBodySchema)

	const parameter = await prisma.parameterTemplate.findUnique({
		where: { id: payload.parameterId },
	})

	if (!parameter) {
		throw new ApiError(404, 'Parameter not found')
	}

	const duplicate = await prisma.parameterValue.findFirst({
		where: {
			parameterId: payload.parameterId,
			value: payload.value.trim(),
			isActive: true,
		},
	})

	if (duplicate) {
		throw new ApiError(400, 'Value already exists for this parameter')
	}

	const maxOrder = await prisma.parameterValue.findFirst({
		where: { parameterId: payload.parameterId },
		orderBy: { order: 'desc' },
		select: { order: true },
	})

	const order = payload.order ?? (maxOrder?.order ?? -1) + 1

	const value = await prisma.parameterValue.create({
		data: buildParameterValueCreateData(payload, order),
	})

	return success(value, 201)
})

export const DELETE = withApiHandler(async (request: NextRequest) => {
	const id = ensureParameterValueId(request.nextUrl.searchParams.get('id'))

	await prisma.parameterValue.delete({ where: { id } })

	return success({ success: true })
})
