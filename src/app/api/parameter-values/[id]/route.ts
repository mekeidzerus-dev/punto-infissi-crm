import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

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

		// Проверяем существование значения
		const existingValue = await prisma.parameterValue.findUnique({
			where: { id },
		})

		if (!existingValue) {
			return NextResponse.json(
				{ error: 'Parameter value not found' },
				{ status: 404 }
			)
		}

		// Проверяем дубликаты при изменении значения
		if (value && value.trim() !== existingValue.value) {
			const duplicateValue = await prisma.parameterValue.findFirst({
				where: {
					parameterId: existingValue.parameterId,
					value: value.trim(),
					isActive: true,
					NOT: { id },
				},
			})

			if (duplicateValue) {
				return NextResponse.json(
					{ error: 'Value already exists for this parameter' },
					{ status: 400 }
				)
			}
		}

		const updatedValue = await prisma.parameterValue.update({
			where: { id },
			data: {
				...(value && { value: value.trim() }),
				...(valueIt !== undefined && { valueIt: valueIt?.trim() || null }),
				...(hexColor !== undefined && { hexColor: hexColor || null }),
				...(ralCode !== undefined && { ralCode: ralCode || null }),
				...(displayName !== undefined && {
					displayName: displayName?.trim() || null,
				}),
				...(order !== undefined && { order }),
			},
		})

		logger.info(`✅ Updated parameter value: ${updatedValue.value}`)

		return NextResponse.json(updatedValue)
	} catch (error) {
		logger.error('❌ Error updating parameter value:', error)
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

		// Проверяем существование значения
		const existingValue = await prisma.parameterValue.findUnique({
			where: { id },
		})

		if (!existingValue) {
			return NextResponse.json(
				{ error: 'Parameter value not found' },
				{ status: 404 }
			)
		}

		// Используем мягкое удаление (устанавливаем isActive = false)
		// Это позволяет сохранить историю использования значений
		await prisma.parameterValue.update({
			where: { id },
			data: { isActive: false },
		})

		logger.info(`✅ Deleted parameter value: ${id}`)

		return NextResponse.json({ success: true })
	} catch (error: unknown) {
		logger.error('❌ Error deleting parameter value:', error)
		if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
			return NextResponse.json(
				{ error: 'Parameter value not found' },
				{ status: 404 }
			)
		}
		return NextResponse.json(
			{ error: 'Failed to delete parameter value', details: String(error) },
			{ status: 500 }
		)
	}
}
