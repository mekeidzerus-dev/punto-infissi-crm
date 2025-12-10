import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { success, withApiHandler, parseJson } from '@/lib/api-handler'
import { syncParameterGlobalStatus } from '@/lib/parameter-utils'
import {
	buildParameterCreateData,
	parseParameterQuery,
	parameterCreateBodySchema,
} from './helpers'

export const GET = withApiHandler(async (request: NextRequest) => {
	const query = parseParameterQuery(request.nextUrl.searchParams)

	const parameters = await prisma.parameterTemplate.findMany({
		where: {
			...(query.type ? { type: query.type } : {}),
			...(query.isActive !== null && query.isActive !== undefined
				? { isActive: query.isActive }
				: {}),
		},
		include: {
			values: {
				where: { isActive: true },
				orderBy: { order: 'asc' },
			},
			_count: {
				select: {
					categoryParameters: true,
					supplierOverrides: true,
				},
			},
		},
		orderBy: { createdAt: 'desc' },
	})

	return success(parameters)
})

export const POST = withApiHandler(async (request: NextRequest) => {
	const { requireAuth } = await import('@/lib/auth-helpers')
	const { updateUserActivity } = await import('@/lib/activity-tracker')
	const user = await requireAuth()
	await updateUserActivity(user.id)
	const payload = await parseJson(request, parameterCreateBodySchema)

	const parameter = await prisma.parameterTemplate.create({
		data: buildParameterCreateData(payload),
		include: { values: true },
	})

	await syncParameterGlobalStatus(parameter.id)

	const updated = await prisma.parameterTemplate.findUnique({
		where: { id: parameter.id },
		include: { values: true },
	})

	return success(updated, 201)
})
