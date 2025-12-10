import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseJson, success, withApiHandler } from '@/lib/api-handler'
import {
	buildProductCategoryCreateData,
	productCategoryCreateBodySchema,
} from './helpers'

export const GET = withApiHandler(async () => {
	const categories = await prisma.productCategory.findMany({
		where: { isActive: true },
		orderBy: { name: 'asc' },
		include: {
			supplierCategories: {
				include: {
					supplier: true,
				},
			},
		},
	})

	return success(categories)
})

export const POST = withApiHandler(async (request: NextRequest) => {
	const { requireAuth } = await import('@/lib/auth-helpers')
	const { updateUserActivity } = await import('@/lib/activity-tracker')
	const user = await requireAuth()
	await updateUserActivity(user.id)
	const payload = await parseJson(request, productCategoryCreateBodySchema)

	const category = await prisma.productCategory.create({
		data: buildProductCategoryCreateData(payload),
	})

	return success(category, 201)
})
