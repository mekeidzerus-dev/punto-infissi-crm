import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - получение категорий с счетчиками параметров и поставщиков
export async function GET(request: NextRequest) {
	try {
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

		// Формируем данные с счетчиками
		const categoriesWithCounts = categories.map(category => ({
			id: category.id,
			name: category.name,
			icon: category.icon,
			description: category.description,
			isActive: category.isActive,
			createdAt: category.createdAt,
			updatedAt: category.updatedAt,
			// Счетчики
			parametersCount: category.categoryParameters.length,
			suppliersCount: category.supplierCategories.length,
			// Детали для отладки
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

		console.log(
			`✅ Found ${categoriesWithCounts.length} categories with counts`
		)
		return NextResponse.json(categoriesWithCounts)
	} catch (error) {
		console.error('❌ Error fetching categories with counts:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch categories', details: String(error) },
			{ status: 500 }
		)
	}
}
