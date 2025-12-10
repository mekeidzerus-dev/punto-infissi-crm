import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseJson, success, withApiHandler } from '@/lib/api-handler'
import {
	buildSupplierParameterOverrideCreateData,
	ensureNoDuplicateOverride,
	ensureParameterExists,
	ensureSupplierExists,
	ensureSupplierId,
	supplierParameterOverrideCreateBodySchema,
} from '@/app/api/supplier-parameter-overrides/helpers'

const overrideInclude = {
	parameter: {
		include: {
			values: {
				where: { isActive: true },
				orderBy: { order: 'asc' },
			},
		},
	},
} as const

type SupplierRouteParams = { id: string }

type SupplierParamsInput =
	| SupplierRouteParams
	| Record<string, string | string[]>
	| undefined

async function resolveSupplierId(params: SupplierParamsInput | Promise<SupplierParamsInput>) {
	const resolved = await params
	const value = resolved && 'id' in resolved ? resolved.id : resolved?.['id']
	const id = Array.isArray(value) ? value[0] ?? null : value ?? null
	return ensureSupplierId(id)
}

export const GET = withApiHandler(async (_request, { params }) => {
	const supplierId = await resolveSupplierId(params)

	await ensureSupplierExists(supplierId)

	const overrides = await prisma.supplierParameterOverride.findMany({
		where: { supplierId },
		include: overrideInclude,
		orderBy: {
			parameter: {
				name: 'asc',
			},
		},
	})

	return success(overrides)
})

export const POST = withApiHandler(async (request: NextRequest, { params }) => {
	const supplierId = await resolveSupplierId(params)
	await ensureSupplierExists(supplierId)

	const payload = await parseJson(request, supplierParameterOverrideCreateBodySchema)

	await ensureParameterExists(payload.parameterId)
	await ensureNoDuplicateOverride(supplierId, payload.parameterId)

	const override = await prisma.supplierParameterOverride.create({
		data: buildSupplierParameterOverrideCreateData(supplierId, payload),
		include: overrideInclude,
	})

	return success(override, 201)
})
