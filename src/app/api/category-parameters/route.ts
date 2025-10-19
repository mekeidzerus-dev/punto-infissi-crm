import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - получить параметры категории
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const categoryId = searchParams.get('categoryId')

		if (!categoryId) {
			return NextResponse.json(
				{ error: 'Category ID is required' },
				{ status: 400 }
			)
		}

		const categoryParameters = await prisma.categoryParameter.findMany({
			where: { categoryId },
			include: {
				parameter: {
					include: {
						values: {
							where: { isActive: true },
							orderBy: { order: 'asc' },
						},
					},
				},
			},
			orderBy: { order: 'asc' },
		})

		console.log(
			`✅ Found ${categoryParameters.length} parameters for category ${categoryId}`
		)
		return NextResponse.json(categoryParameters)
	} catch (error) {
		console.error('❌ Error fetching category parameters:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch category parameters' },
			{ status: 500 }
		)
	}
}

// POST - привязать параметр к категории
export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const {
			categoryId,
			parameterId,
			isRequired,
			isVisible,
			order,
			displayName,
			displayNameIt,
			defaultValue,
			helpText,
		} = body

		if (!categoryId || !parameterId) {
			return NextResponse.json(
				{ error: 'Category ID and Parameter ID are required' },
				{ status: 400 }
			)
		}

		const categoryParameter = await prisma.categoryParameter.create({
			data: {
				categoryId,
				parameterId,
				isRequired: isRequired ?? false,
				isVisible: isVisible ?? true,
				order: order ?? 0,
				displayName,
				displayNameIt,
				defaultValue,
				helpText,
			},
			include: {
				parameter: {
					include: {
						values: true,
					},
				},
			},
		})

		console.log(`✅ Linked parameter to category`)
		return NextResponse.json(categoryParameter)
	} catch (error: any) {
		console.error('❌ Error linking parameter to category:', error)
		if (error.code === 'P2002') {
			return NextResponse.json(
				{ error: 'This parameter is already linked to this category' },
				{ status: 400 }
			)
		}
		return NextResponse.json(
			{ error: 'Failed to link parameter' },
			{ status: 500 }
		)
	}
}

// PUT - обновить настройки параметра для категории
export async function PUT(request: NextRequest) {
	try {
		const body = await request.json()
		const {
			id,
			isRequired,
			isVisible,
			order,
			displayName,
			displayNameIt,
			defaultValue,
			helpText,
		} = body

		if (!id) {
			return NextResponse.json({ error: 'ID is required' }, { status: 400 })
		}

		const categoryParameter = await prisma.categoryParameter.update({
			where: { id },
			data: {
				isRequired,
				isVisible,
				order,
				displayName,
				displayNameIt,
				defaultValue,
				helpText,
			},
		})

		console.log(`✅ Updated category parameter: ${id}`)
		return NextResponse.json(categoryParameter)
	} catch (error) {
		console.error('❌ Error updating category parameter:', error)
		return NextResponse.json(
			{ error: 'Failed to update category parameter' },
			{ status: 500 }
		)
	}
}

// DELETE - удалить привязку
export async function DELETE(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const id = searchParams.get('id')

		if (!id) {
			return NextResponse.json({ error: 'ID is required' }, { status: 400 })
		}

		await prisma.categoryParameter.delete({
			where: { id },
		})

		console.log(`✅ Deleted category parameter: ${id}`)
		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('❌ Error deleting category parameter:', error)
		return NextResponse.json(
			{ error: 'Failed to delete category parameter' },
			{ status: 500 }
		)
	}
}
