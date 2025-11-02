import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// GET /api/categories - получить все категории
export async function GET() {
	try {
		const categories = await prisma.productCategory.findMany({
			orderBy: {
				name: 'asc',
			},
		})

		return NextResponse.json(categories)
	} catch (error) {
		logger.error('Error fetching categories:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch categories' },
			{ status: 500 }
		)
	}
}

// POST /api/categories - создать новую категорию
export async function POST(request: NextRequest) {
	try {
		logger.info('📝 Creating product category...')

		const body = await request.json()
		const { name, description, icon, isActive = true } = body

		// Валидация обязательных полей
		if (!name || !name.trim()) {
			return NextResponse.json({ error: 'Name is required' }, { status: 400 })
		}

		if (!icon || !icon.trim()) {
			return NextResponse.json({ error: 'Icon is required' }, { status: 400 })
		}

		const category = await prisma.productCategory.create({
			data: {
				name: name.trim(),
				description: description?.trim() || null,
				icon: icon.trim(),
				isActive,
			},
		})

		logger.info(`✅ Created product category: ${category.name}`)
		return NextResponse.json(category, { status: 201 })
	} catch (error: unknown) {
		logger.error('❌ Error creating product category:', error)
		if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
			return NextResponse.json(
				{ error: 'Category with this name already exists' },
				{ status: 400 }
			)
		}
		return NextResponse.json(
			{ error: 'Failed to create product category', details: String(error) },
			{ status: 500 }
		)
	}
}
