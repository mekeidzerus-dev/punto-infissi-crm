import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const supplierId = searchParams.get('supplierId')
		const categoryId = searchParams.get('categoryId')

		console.log('🔍 Fetching supplier categories...')

		let whereClause: any = { isActive: true }

		if (supplierId) {
			whereClause.supplierId = parseInt(supplierId)
		}
		if (categoryId) {
			whereClause.categoryId = categoryId
		}

		const supplierCategories = await prisma.supplierProductCategory.findMany({
			where: whereClause,
			include: {
				supplier: true,
				category: true,
			},
			orderBy: [{ supplier: { name: 'asc' } }, { category: { name: 'asc' } }],
		})

		console.log(`✅ Found ${supplierCategories.length} supplier categories`)
		return NextResponse.json(supplierCategories)
	} catch (error) {
		console.error('❌ Error fetching supplier categories:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch supplier categories', details: String(error) },
			{ status: 500 }
		)
	}
}

export async function POST(request: NextRequest) {
	try {
		console.log('📝 Creating supplier category...')

		const body = await request.json()
		const { supplierId, categoryId, parameters } = body

		if (!supplierId || !categoryId) {
			return NextResponse.json(
				{ error: 'Supplier ID and Category ID are required' },
				{ status: 400 }
			)
		}

		const supplierCategory = await prisma.supplierProductCategory.create({
			data: {
				supplierId: parseInt(supplierId),
				categoryId,
				parameters: parameters || [],
			},
			include: {
				supplier: true,
				category: true,
			},
		})

		console.log(
			`✅ Created supplier category: ${supplierCategory.supplier.name} + ${supplierCategory.category.name}`
		)
		return NextResponse.json(supplierCategory, { status: 201 })
	} catch (error) {
		console.error('❌ Error creating supplier category:', error)
		return NextResponse.json(
			{ error: 'Failed to create supplier category', details: String(error) },
			{ status: 500 }
		)
	}
}

export async function DELETE(request: NextRequest) {
	try {
		console.log('🗑️ Deleting supplier category...')

		const body = await request.json()
		const { supplierId, categoryId } = body

		if (!supplierId || !categoryId) {
			return NextResponse.json(
				{ error: 'Supplier ID and Category ID are required' },
				{ status: 400 }
			)
		}

		const deleted = await prisma.supplierProductCategory.deleteMany({
			where: {
				supplierId: parseInt(supplierId),
				categoryId,
			},
		})

		console.log(`✅ Deleted ${deleted.count} supplier category relations`)
		return NextResponse.json({ success: true, deletedCount: deleted.count })
	} catch (error) {
		console.error('❌ Error deleting supplier category:', error)
		return NextResponse.json(
			{ error: 'Failed to delete supplier category', details: String(error) },
			{ status: 500 }
		)
	}
}
