import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseJson, success, withApiHandler } from '@/lib/api-handler'
import {
	buildSupplierCategoryCreateData,
	parseSupplierCategoryQuery,
	supplierCategoryCreateBodySchema,
	supplierCategoryDeleteBodySchema,
} from './helpers'

export const GET = withApiHandler(async (request: NextRequest) => {
	const query = parseSupplierCategoryQuery(request.nextUrl.searchParams)

	const supplierCategories = await prisma.supplierProductCategory.findMany({
		where: {
			isActive: true,
			...(query.supplierId ? { supplierId: query.supplierId } : {}),
			...(query.categoryId ? { categoryId: query.categoryId } : {}),
		},
		include: {
			supplier: {
				select: {
					id: true,
					name: true,
					shortName: true,
					shortNameIt: true,
					phone: true,
					email: true,
					status: true,
				},
			},
			category: true,
		},
		orderBy: [{ supplier: { name: 'asc' } }, { category: { name: 'asc' } }],
	})

	return success(supplierCategories)
})

export const POST = withApiHandler(async (request: NextRequest) => {
	const payload = await parseJson(request, supplierCategoryCreateBodySchema)

	const supplierCategory = await prisma.supplierProductCategory.create({
		data: buildSupplierCategoryCreateData(payload),
		include: {
			supplier: true,
			category: true,
		},
	})

	return success(supplierCategory, 201)
})

export const DELETE = withApiHandler(async (request: NextRequest) => {
	const payload = await parseJson(request, supplierCategoryDeleteBodySchema)

	const deleted = await prisma.supplierProductCategory.deleteMany({
		where: {
			supplierId: payload.supplierId,
			categoryId: payload.categoryId,
		},
	})

	return success({ success: true, deletedCount: deleted.count })
})
