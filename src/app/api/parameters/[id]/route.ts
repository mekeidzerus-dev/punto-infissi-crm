import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { syncParameterGlobalStatus } from '@/lib/parameter-utils'

// GET - получить конкретный параметр
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params

		const parameter = await prisma.parameterTemplate.findUnique({
			where: { id },
			include: {
				values: {
					where: { isActive: true },
					orderBy: { order: 'asc' },
				},
				categoryParameters: {
					include: {
						category: {
							select: { id: true, name: true },
						},
					},
				},
				supplierOverrides: {
					include: {
						supplier: {
							select: { id: true, name: true },
						},
					},
				},
			},
		})

		if (!parameter) {
			return NextResponse.json(
				{ error: 'Parameter not found' },
				{ status: 404 }
			)
		}

		return NextResponse.json(parameter)
	} catch (error) {
		logger.error('❌ Error fetching parameter:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch parameter' },
			{ status: 500 }
		)
	}
}

// PUT - обновить параметр
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params
		const body = await request.json()
		const {
			name,
			nameIt,
			description,
			unit,
			minValue,
			maxValue,
			step,
			isActive,
			// isGlobal удален - теперь определяется автоматически
		} = body

		const parameter = await prisma.parameterTemplate.update({
			where: { id },
			data: {
				name,
				nameIt,
				description,
				unit,
				minValue: minValue ? parseFloat(minValue) : null,
				maxValue: maxValue ? parseFloat(maxValue) : null,
				step: step ? parseFloat(step) : null,
				isActive,
				// isGlobal не обновляется здесь - определяется автоматически
			},
			include: {
				values: true,
			},
		})

		// Синхронизируем статус isGlobal после обновления
		await syncParameterGlobalStatus(parameter.id)

		// Перезагружаем параметр с актуальным isGlobal
		const updatedParameter = await prisma.parameterTemplate.findUnique({
			where: { id },
			include: {
				values: true,
			},
		})

		logger.info(`✅ Updated parameter: ${updatedParameter?.name}`)
		return NextResponse.json(updatedParameter)
	} catch (error: unknown) {
		logger.error('❌ Error updating parameter:', error)
		if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
			return NextResponse.json(
				{ error: 'Parameter with this name already exists' },
				{ status: 400 }
			)
		}
		return NextResponse.json(
			{ error: 'Failed to update parameter' },
			{ status: 500 }
		)
	}
}

// DELETE - удалить параметр
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params

		// Проверяем существует ли параметр
		const existingParameter = await prisma.parameterTemplate.findUnique({
			where: { id },
		})

		if (!existingParameter) {
			return NextResponse.json(
				{ error: 'Parameter not found' },
				{ status: 404 }
			)
		}

		// Защита от удаления системного параметра "Модель"
		if (
			existingParameter.name === 'Модель' ||
			existingParameter.nameIt === 'Modello'
		) {
			return NextResponse.json(
				{
					error:
						'Невозможно удалить системный параметр "Модель". Этот параметр обязателен для всех товаров.',
				},
				{ status: 400 }
			)
		}

		// Проверяем используется ли параметр
		const usageCount = await prisma.categoryParameter.count({
			where: { parameterId: id },
		})

		if (usageCount > 0) {
			return NextResponse.json(
				{
					error: `Невозможно удалить: параметр используется в ${usageCount} категориях`,
				},
				{ status: 400 }
			)
		}

		await prisma.parameterTemplate.delete({
			where: { id },
		})

		logger.info(`✅ Deleted parameter: ${id}`)
		return NextResponse.json({ success: true })
	} catch (error) {
		logger.error('❌ Error deleting parameter:', error)
		return NextResponse.json(
			{ error: 'Failed to delete parameter' },
			{ status: 500 }
		)
	}
}
