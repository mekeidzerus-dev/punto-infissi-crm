import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiError, parseJson, success, withApiHandler } from '@/lib/api-handler'
import {
	buildSupplierParameterOverrideUpdateData,
	supplierParameterOverrideUpdateBodySchema,
	ensureOverrideIdFromParams,
} from '../helpers'

const updateBodyWithoutId = supplierParameterOverrideUpdateBodySchema

export const GET = withApiHandler(async (_request, { params }) => {
	const id = ensureOverrideIdFromParams(params)

	const override = await prisma.supplierParameterOverride.findUnique({
		where: { id },
		include: {
			parameter: {
				include: {
					values: {
						where: { isActive: true },
						orderBy: { order: 'asc' },
					},
				},
			},
			supplier: true,
		},
	})

	if (!override) {
		throw new ApiError(404, 'Parameter override not found')
	}

	return success(override)
})

export const PUT = withApiHandler(async (request: NextRequest, { params }) => {
	const id = ensureOverrideIdFromParams(params)
	const payload = await parseJson(request, updateBodyWithoutId)

	const existing = await prisma.supplierParameterOverride.findUnique({
		where: { id },
	})

	if (!existing) {
		throw new ApiError(404, 'Parameter override not found')
	}

	const override = await prisma.supplierParameterOverride.update({
		where: { id },
		data: buildSupplierParameterOverrideUpdateData(payload),
		include: {
			parameter: {
				include: {
					values: {
						where: { isActive: true },
						orderBy: { order: 'asc' },
					},
				},
			},
		},
	})

	return success(override)
})

export const DELETE = withApiHandler(async (_request, { params }) => {
	const id = ensureOverrideIdFromParams(params)

	const existing = await prisma.supplierParameterOverride.findUnique({
		where: { id },
	})

	if (!existing) {
		throw new ApiError(404, 'Parameter override not found')
	}

	await prisma.supplierParameterOverride.delete({ where: { id } })

	return success({ success: true })
})
