import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
	try {
		console.log('🔍 Fetching product categories...')

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

		console.log(`✅ Found ${categories.length} product categories`)
		return NextResponse.json(categories)
	} catch (error) {
		console.error('❌ Error fetching product categories:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch product categories', details: String(error) },
			{ status: 500 }
		)
	}
}

export async function POST(request: NextRequest) {
	try {
		console.log('📝 Creating product category...')

		const body = await request.json()
		const { name, icon, description } = body

		if (!name || !icon) {
			return NextResponse.json(
				{ error: 'Name and icon are required' },
				{ status: 400 }
			)
		}

		const category = await prisma.productCategory.create({
			data: {
				name,
				icon,
				description,
			},
		})

		console.log(`✅ Created product category: ${category.name}`)
		return NextResponse.json(category, { status: 201 })
	} catch (error) {
		console.error('❌ Error creating product category:', error)
		return NextResponse.json(
			{ error: 'Failed to create product category', details: String(error) },
			{ status: 500 }
		)
	}
}
