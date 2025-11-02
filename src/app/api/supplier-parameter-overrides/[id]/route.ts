import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// GET /api/supplier-parameter-overrides/[id]
// Получить конкретное переопределение
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params
		const override = await prisma.supplierParameterOverride.findUnique({
			where: { id },
			include: {
				parameter: {
					include: {
						values: {
							where: { isActive: true },
							orderBy: { order: 'asc' },
						},
					},
				},
				supplier: true,
			},
		})

		if (!override) {
			return NextResponse.json(
				{ error: 'Parameter override not found' },
				{ status: 404 }
			)
		}

		return NextResponse.json(override)
	} catch (error) {
		logger.error('❌ Error fetching parameter override:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch parameter override' },
			{ status: 500 }
		)
	}
}

// PUT /api/supplier-parameter-overrides/[id]
// Обновить переопределение параметра
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const body = await request.json()
		const { customValues, minValue, maxValue, isAvailable } = body

		// Проверяем существование переопределения
		const existing = await prisma.supplierParameterOverride.findUnique({
			where: { id: params.id },
		})

		if (!existing) {
			return NextResponse.json(
				{ error: 'Parameter override not found' },
				{ status: 404 }
			)
		}

		// Обновляем переопределение
		const override = await prisma.supplierParameterOverride.update({
			where: { id: params.id },
			data: {
				customValues: customValues !== undefined ? customValues : undefined,
				minValue:
					minValue !== undefined
						? minValue === null
							? null
							: minValue
						: undefined,
				maxValue:
					maxValue !== undefined
						? maxValue === null
							? null
							: maxValue
						: undefined,
				isAvailable: isAvailable !== undefined ? isAvailable : undefined,
			},
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
		})

		logger.info(`✅ Updated parameter override: ${params.id}`)

		return NextResponse.json(override)
	} catch (error) {
		logger.error('❌ Error updating parameter override:', error)
		return NextResponse.json(
			{ error: 'Failed to update parameter override' },
			{ status: 500 }
		)
	}
}

// DELETE /api/supplier-parameter-overrides/[id]
// Удалить переопределение параметра
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		// Проверяем существование переопределения
		const existing = await prisma.supplierParameterOverride.findUnique({
			where: { id: params.id },
		})

		if (!existing) {
			return NextResponse.json(
				{ error: 'Parameter override not found' },
				{ status: 404 }
			)
		}

		// Удаляем переопределение
		await prisma.supplierParameterOverride.delete({
			where: { id: params.id },
		})

		logger.info(`🗑️ Deleted parameter override: ${params.id}`)

		return NextResponse.json({ success: true })
	} catch (error) {
		logger.error('❌ Error deleting parameter override:', error)
		return NextResponse.json(
			{ error: 'Failed to delete parameter override' },
			{ status: 500 }
		)
	}
}
