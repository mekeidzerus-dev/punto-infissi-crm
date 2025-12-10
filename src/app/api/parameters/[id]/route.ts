import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiError, parseJson, success, withApiHandler } from '@/lib/api-handler'
import { syncParameterGlobalStatus } from '@/lib/parameter-utils'
import {
	buildParameterUpdateData,
	ensureParameterIdFromParams,
	parameterUpdateBodySchema,
} from '../helpers'

const parameterUpdateBodyWithoutId = parameterUpdateBodySchema.omit({ id: true })

export const GET = withApiHandler(async (_request, { params }) => {
	const id = ensureParameterIdFromParams(params)

	const parameter = await prisma.parameterTemplate.findUnique({
		where: { id },
		include: {
			values: {
				where: { isActive: true },
				orderBy: { order: 'asc' },
			},
			categoryParameters: {
				include: { category: { select: { id: true, name: true } } },
			},
			supplierOverrides: {
				include: { supplier: { select: { id: true, name: true } } },
			},
		},
	})

	if (!parameter) {
		throw new ApiError(404, 'Parameter not found')
	}

	return success(parameter)
})

export const PUT = withApiHandler(async (request: NextRequest, { params }) => {
	const id = ensureParameterIdFromParams(params)
	const payload = await parseJson(request, parameterUpdateBodyWithoutId)

	const parameter = await prisma.parameterTemplate.update({
		where: { id },
		data: buildParameterUpdateData({ ...payload, id }),
		include: { values: true },
	})

	await syncParameterGlobalStatus(parameter.id)

	const updated = await prisma.parameterTemplate.findUnique({
		where: { id },
		include: { values: true },
	})

	return success(updated)
})

export const DELETE = withApiHandler(async (_request, { params }) => {
	const id = ensureParameterIdFromParams(params)

	const parameter = await prisma.parameterTemplate.findUnique({
		where: { id },
	})

	if (!parameter) {
		throw new ApiError(404, 'Parameter not found')
	}

	if (parameter.name === 'Модель' || parameter.nameIt === 'Modello') {
		throw new ApiError(
			400,
			'Невозможно удалить системный параметр "Модель". Этот параметр обязателен для всех товаров.'
		)
	}

	const usageCount = await prisma.categoryParameter.count({
		where: { parameterId: id },
	})

	if (usageCount > 0) {
		throw new ApiError(
			400,
			`Невозможно удалить: параметр используется в ${usageCount} категориях`
		)
	}

	await prisma.parameterTemplate.delete({ where: { id } })

	return success({ success: true })
})
