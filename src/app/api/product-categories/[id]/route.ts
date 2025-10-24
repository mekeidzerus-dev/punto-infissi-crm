import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/product-categories/[id] - получить категорию по ID
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id: categoryId } = await params
		console.log(`🔍 Fetching category: ${categoryId}`)

		const category = await prisma.productCategory.findUnique({
			where: { id: categoryId },
			include: {
				supplierCategories: {
					include: {
						supplier: true,
					},
				},
			},
		})

		if (!category) {
			console.log(`❌ Category not found: ${categoryId}`)
			return NextResponse.json({ error: 'Category not found' }, { status: 404 })
		}

		console.log(`✅ Found category: ${category.name}`)
		return NextResponse.json(category)
	} catch (error) {
		console.error('❌ Error fetching category:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch category' },
			{ status: 500 }
		)
	}
}

// PUT /api/product-categories/[id] - обновить категорию
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id: categoryId } = await params
		const data = await request.json()
		console.log(`📝 Updating category: ${categoryId}`)

		// Проверяем что категория существует
		const existingCategory = await prisma.productCategory.findUnique({
			where: { id: categoryId },
		})

		if (!existingCategory) {
			console.log(`❌ Category not found: ${categoryId}`)
			return NextResponse.json({ error: 'Category not found' }, { status: 404 })
		}

		// Обновляем категорию
		const updatedCategory = await prisma.productCategory.update({
			where: { id: categoryId },
			data: {
				name: data.name,
				icon: data.icon,
				description: data.description,
				isActive:
					data.isActive !== undefined
						? data.isActive
						: existingCategory.isActive,
				updatedAt: new Date(),
			},
			include: {
				supplierCategories: {
					include: {
						supplier: true,
					},
				},
			},
		})

		console.log(`✅ Updated category: ${updatedCategory.name}`)
		return NextResponse.json(updatedCategory)
	} catch (error) {
		console.error('❌ Error updating category:', error)
		return NextResponse.json(
			{ error: 'Failed to update category' },
			{ status: 500 }
		)
	}
}

// DELETE /api/product-categories/[id] - удалить категорию
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id: categoryId } = await params
		console.log(`🗑️ Deleting category: ${categoryId}`)

		// Проверяем что категория существует
		const existingCategory = await prisma.productCategory.findUnique({
			where: { id: categoryId },
		})

		if (!existingCategory) {
			console.log(`❌ Category not found: ${categoryId}`)
			return NextResponse.json({ error: 'Category not found' }, { status: 404 })
		}

		// Проверяем есть ли связанные записи
		const supplierCategories = await prisma.supplierProductCategory.findMany({
			where: { categoryId },
		})

		// Если есть связанные записи, удаляем их сначала
		if (supplierCategories.length > 0) {
			console.log(
				`🗑️ Deleting ${supplierCategories.length} supplier relationships first`
			)
			await prisma.supplierProductCategory.deleteMany({
				where: { categoryId },
			})
		}

		// Также удаляем связанные параметры категории
		const categoryParameters = await prisma.categoryParameter.findMany({
			where: { categoryId },
		})

		if (categoryParameters.length > 0) {
			console.log(
				`🗑️ Deleting ${categoryParameters.length} category parameters`
			)
			await prisma.categoryParameter.deleteMany({
				where: { categoryId },
			})
		}

		// Удаляем категорию
		await prisma.productCategory.delete({
			where: { id: categoryId },
		})

		console.log(`✅ Deleted category: ${existingCategory.name}`)
		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('❌ Error deleting category:', error)
		return NextResponse.json(
			{ error: 'Failed to delete category' },
			{ status: 500 }
		)
	}
}
