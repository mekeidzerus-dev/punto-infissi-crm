import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
	try {
		logger.info('📝 Quick creating parameter...')

		const body = await request.json()
		const {
			name,
			nameIt,
			type,
			description,
			unit,
			minValue,
			maxValue,
			step,
			values, // массив значений для SELECT типов
		} = body

		// Проверка обязательных полей
		if (!name || !type) {
			return NextResponse.json(
				{ error: 'Name and type are required' },
				{ status: 400 }
			)
		}

		// Создаем параметр БЕЗ привязки к категории
		// Привязка будет происходить при создании товара
		// isGlobal определяется автоматически через syncParameterGlobalStatus
		const parameter = await prisma.parameterTemplate.create({
			data: {
				name,
				nameIt,
				type,
				description,
				unit,
				minValue: minValue ? parseFloat(minValue) : null,
				maxValue: maxValue ? parseFloat(maxValue) : null,
				step: step ? parseFloat(step) : null,
				isGlobal: true, // По умолчанию глобальный, пока нет связей
			values: values
				? {
						create: values.map((v: Record<string, unknown>, index: number) => ({
								value: v.value,
								valueIt: v.valueIt,
								displayName: v.displayName,
								hexColor: v.hexColor,
								ralCode: v.ralCode,
								icon: v.icon,
								order: index,
							})),
					  }
					: undefined,
			},
			include: {
				values: true,
			},
		})

		// Синхронизируем статус isGlobal (будет true, т.к. нет связей)
		// Импортируем функцию синхронизации
		const { syncParameterGlobalStatus } = await import('@/lib/parameter-utils')
		await syncParameterGlobalStatus(parameter.id)

		logger.info(
			`✅ Quick created parameter: ${parameter.name} (will be linked to category when product is created)`
		)

		return NextResponse.json(parameter)
	} catch (error: unknown) {
		logger.error('❌ Error quick creating parameter:', error)
		if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
			return NextResponse.json(
				{ error: 'Parameter with this name already exists' },
				{ status: 400 }
			)
		}
		return NextResponse.json(
			{ error: 'Failed to create parameter' },
			{ status: 500 }
		)
	}
}
