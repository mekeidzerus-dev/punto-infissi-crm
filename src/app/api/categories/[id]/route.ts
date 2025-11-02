import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// GET /api/categories/[id] - получить категорию по ID
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id: categoryId } = await params

		const category = await prisma.productCategory.findUnique({
			where: { id: categoryId },
		})

		if (!category) {
			return NextResponse.json({ error: 'Category not found' }, { status: 404 })
		}

		return NextResponse.json(category)
	} catch (error) {
		logger.error('Error fetching category:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch category' },
			{ status: 500 }
		)
	}
}

// PUT /api/categories/[id] - обновить категорию
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id: categoryId } = await params
		const body = await request.json()
		const { name, description, icon, isActive } = body

		logger.info(`📝 Updating category: ${categoryId}`)

		// Проверяем что категория существует
		const existingCategory = await prisma.productCategory.findUnique({
			where: { id: categoryId },
		})

		if (!existingCategory) {
			logger.info(`❌ Category not found: ${categoryId}`)
			return NextResponse.json({ error: 'Category not found' }, { status: 404 })
		}

		// Валидация обязательных полей
		if (name !== undefined && !name.trim()) {
			return NextResponse.json(
				{ error: 'Name is required and cannot be empty' },
				{ status: 400 }
			)
		}

		// Обновляем категорию
		const updatedCategory = await prisma.productCategory.update({
			where: { id: categoryId },
			data: {
				name: name !== undefined ? name : existingCategory.name,
				icon: icon !== undefined ? icon : existingCategory.icon,
				description:
					description !== undefined
						? description
						: existingCategory.description,
				isActive: isActive !== undefined ? isActive : existingCategory.isActive,
				updatedAt: new Date(),
			},
		})

		logger.info(`✅ Updated category: ${updatedCategory.name}`)
		return NextResponse.json(updatedCategory)
	} catch (error: unknown) {
		logger.error('❌ Error updating category:', error)
		if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
			return NextResponse.json({ error: 'Category not found' }, { status: 404 })
		}
		return NextResponse.json(
			{ error: 'Failed to update category', details: String(error) },
			{ status: 500 }
		)
	}
}

// DELETE /api/categories/[id] - удалить категорию
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id: categoryId } = await params
		logger.info(`🗑️ Deleting category: ${categoryId}`)

		// Проверяем что категория существует
		const existingCategory = await prisma.productCategory.findUnique({
			where: { id: categoryId },
		})

		if (!existingCategory) {
			logger.info(`❌ Category not found: ${categoryId}`)
			return NextResponse.json({ error: 'Category not found' }, { status: 404 })
		}

		// Проверяем есть ли связанные записи поставщиков
		const supplierCategories = await prisma.supplierProductCategory.findMany({
			where: { categoryId },
		})

		// Если есть связанные записи, удаляем их сначала
		if (supplierCategories.length > 0) {
			logger.info(
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
			logger.info(
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

		logger.info(`✅ Deleted category: ${existingCategory.name}`)
		return NextResponse.json({ success: true })
	} catch (error: unknown) {
		logger.error('❌ Error deleting category:', error)
		if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
			return NextResponse.json({ error: 'Category not found' }, { status: 404 })
		}
		return NextResponse.json(
			{ error: 'Failed to delete category', details: String(error) },
			{ status: 500 }
		)
	}
}
