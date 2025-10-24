import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
		console.error('Error fetching categories:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch categories' },
			{ status: 500 }
		)
	}
}

// POST /api/categories - создать новую категорию
export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const { name, description, icon, isActive = true } = body

		const category = await prisma.productCategory.create({
			data: {
				name,
				description,
				icon: icon || '📦',
				isActive,
			},
		})

		return NextResponse.json(category, { status: 201 })
	} catch (error) {
		console.error('Error creating category:', error)
		return NextResponse.json(
			{ error: 'Failed to create category' },
			{ status: 500 }
		)
	}
}
