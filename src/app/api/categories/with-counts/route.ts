import { prisma } from '@/lib/prisma'
import { success, withApiHandler } from '@/lib/api-handler'

export const GET = withApiHandler(async () => {
	const categories = await prisma.productCategory.findMany({
		where: { isActive: true },
		include: {
			categoryParameters: {
				include: {
					parameter: true,
				},
			},
			supplierCategories: {
				include: {
					supplier: true,
				},
			},
		},
		orderBy: { name: 'asc' },
	})

	const result = categories.map(category => ({
		id: category.id,
		name: category.name,
		icon: category.icon,
		description: category.description,
		isActive: category.isActive,
		createdAt: category.createdAt,
		updatedAt: category.updatedAt,
		parametersCount: category.categoryParameters.length,
		suppliersCount: category.supplierCategories.length,
		parameters: category.categoryParameters.map(cp => ({
			id: cp.parameter.id,
			name: cp.parameter.name,
			type: cp.parameter.type,
			isRequired: cp.isRequired,
			isVisible: cp.isVisible,
		})),
		suppliers: category.supplierCategories.map(sc => ({
			id: sc.supplier.id,
			name: sc.supplier.name,
			rating: sc.supplier.rating,
		})),
	}))

	return success(result)
})
