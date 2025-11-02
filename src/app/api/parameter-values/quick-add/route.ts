import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
	try {
		logger.info('📝 Quick adding parameter value...')

		const body = await request.json()
		const { parameterId, value } = body

		if (!parameterId || !value) {
			return NextResponse.json(
				{ error: 'Parameter ID and value are required' },
				{ status: 400 }
			)
		}

		// Получаем параметр, чтобы узнать его тип
		const parameter = await prisma.parameterTemplate.findUnique({
			where: { id: parameterId },
			include: {
				values: {
					where: { isActive: true },
					orderBy: { order: 'desc' },
				},
			},
		})

		if (!parameter) {
			return NextResponse.json(
				{ error: 'Parameter not found' },
				{ status: 404 }
			)
		}

		// Проверяем, не существует ли уже такое значение
		const existingValue = await prisma.parameterValue.findFirst({
			where: {
				parameterId,
				value: value.trim(),
				isActive: true,
			},
		})

		if (existingValue) {
			logger.warn(
				`⚠️ Value "${value}" already exists for parameter ${parameter.name}`
			)
			return NextResponse.json(
				{ error: 'Value already exists', value: existingValue.value },
				{ status: 400 }
			)
		}

		// Определяем порядок нового значения
		const maxOrder = parameter.values[0]?.order ?? -1

		// Создаем новое значение
		const newValue = await prisma.parameterValue.create({
			data: {
				parameterId,
				value: value.trim(),
				valueIt: value.trim(), // По умолчанию то же значение
				displayName: value.trim(),
				order: maxOrder + 1,
				isActive: true,
			},
		})

		logger.info(
			`✅ Quick added value: "${value}" to parameter: ${parameter.name}`
		)

		// Возвращаем полный объект значения для обновления UI
		return NextResponse.json({
			value: newValue.value,
			valueIt: newValue.valueIt,
			displayName: newValue.displayName,
			hexColor: newValue.hexColor,
			id: newValue.id,
		})
	} catch (error: unknown) {
		logger.error('❌ Error quick adding parameter value:', error)
		if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
			return NextResponse.json(
				{ error: 'Value with this name already exists' },
				{ status: 400 }
			)
		}
		return NextResponse.json({ error: 'Failed to add value' }, { status: 500 })
	}
}
