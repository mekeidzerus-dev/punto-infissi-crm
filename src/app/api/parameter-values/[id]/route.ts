import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT /api/parameter-values/[id]
// Обновить значение параметра
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params
		const data = await request.json()
		const { value, valueIt, hexColor, ralCode, displayName, order } = data

		const updatedValue = await prisma.parameterValue.update({
			where: { id },
			data: {
				...(value && { value }),
				...(valueIt !== undefined && { valueIt }),
				...(hexColor !== undefined && { hexColor }),
				...(ralCode !== undefined && { ralCode }),
				...(displayName !== undefined && { displayName }),
				...(order !== undefined && { order }),
			},
		})

		console.log(`✅ Updated parameter value: ${updatedValue.value}`)

		return NextResponse.json(updatedValue)
	} catch (error) {
		console.error('❌ Error updating parameter value:', error)
		return NextResponse.json(
			{ error: 'Failed to update parameter value' },
			{ status: 500 }
		)
	}
}

// DELETE /api/parameter-values/[id]
// Удалить значение параметра
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params

		await prisma.parameterValue.delete({
			where: { id },
		})

		console.log(`✅ Deleted parameter value: ${id}`)

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('❌ Error deleting parameter value:', error)
		return NextResponse.json(
			{ error: 'Failed to delete parameter value' },
			{ status: 500 }
		)
	}
}
