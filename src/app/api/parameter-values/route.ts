import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - получить значения параметра
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const parameterId = searchParams.get('parameterId')

		if (!parameterId) {
			return NextResponse.json(
				{ error: 'Parameter ID is required' },
				{ status: 400 }
			)
		}

		const values = await prisma.parameterValue.findMany({
			where: { parameterId },
			orderBy: { order: 'asc' },
		})

		return NextResponse.json(values)
	} catch (error) {
		console.error('❌ Error fetching parameter values:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch values' },
			{ status: 500 }
		)
	}
}

// POST - создать новое значение
export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const {
			parameterId,
			value,
			valueIt,
			displayName,
			hexColor,
			ralCode,
			icon,
			order,
		} = body

		if (!parameterId || !value) {
			return NextResponse.json(
				{ error: 'Parameter ID and value are required' },
				{ status: 400 }
			)
		}

		const parameterValue = await prisma.parameterValue.create({
			data: {
				parameterId,
				value,
				valueIt,
				displayName,
				hexColor,
				ralCode,
				icon,
				order: order || 0,
			},
		})

		console.log(`✅ Created parameter value: ${value}`)
		return NextResponse.json(parameterValue)
	} catch (error) {
		console.error('❌ Error creating parameter value:', error)
		return NextResponse.json(
			{ error: 'Failed to create value' },
			{ status: 500 }
		)
	}
}

// DELETE - удалить значение
export async function DELETE(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const id = searchParams.get('id')

		if (!id) {
			return NextResponse.json(
				{ error: 'Value ID is required' },
				{ status: 400 }
			)
		}

		await prisma.parameterValue.delete({
			where: { id },
		})

		console.log(`✅ Deleted parameter value: ${id}`)
		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('❌ Error deleting parameter value:', error)
		return NextResponse.json(
			{ error: 'Failed to delete value' },
			{ status: 500 }
		)
	}
}
