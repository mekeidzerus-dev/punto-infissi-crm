import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/categories/[id] - получить категорию по ID
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const categoryId = params.id

		const category = await prisma.productCategory.findUnique({
			where: { id: categoryId },
			include: {
				_count: {
					select: {
						products: true,
					},
				},
			},
		})

		if (!category) {
			return NextResponse.json(
				{ error: 'Category not found' },
				{ status: 404 }
			)
		}

		return NextResponse.json(category)
	} catch (error) {
		console.error('Error fetching category:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch category' },
			{ status: 500 }
		)
	}
}

// PUT /api/categories/[id] - обновить категорию
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const categoryId = params.id
		const body = await request.json()
		const { name, description, icon, isActive } = body

		const category = await prisma.productCategory.update({
			where: { id: categoryId },
			data: {
				name,
				description,
				icon,
				isActive,
			},
		})

		return NextResponse.json(category)
	} catch (error) {
		console.error('Error updating category:', error)
		return NextResponse.json(
			{ error: 'Failed to update category' },
			{ status: 500 }
		)
	}
}

// DELETE /api/categories/[id] - удалить категорию
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const categoryId = params.id

		// Проверяем, есть ли связанные продукты
		const productsCount = await prisma.product.count({
			where: { categoryId },
		})

		if (productsCount > 0) {
			return NextResponse.json(
				{ error: 'Cannot delete category with associated products' },
				{ status: 400 }
			)
		}

		await prisma.productCategory.delete({
			where: { id: categoryId },
		})

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error deleting category:', error)
		return NextResponse.json(
			{ error: 'Failed to delete category' },
			{ status: 500 }
		)
	}
}
