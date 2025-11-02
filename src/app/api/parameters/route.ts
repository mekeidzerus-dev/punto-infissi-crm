import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { syncParameterGlobalStatus } from '@/lib/parameter-utils'

// GET - получить все параметры
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const type = searchParams.get('type')
		const isActive = searchParams.get('isActive')

		const parameters = await prisma.parameterTemplate.findMany({
			where: {
				...(type && { type: type as 'TEXT' | 'NUMBER' | 'COLOR' | 'SELECT' | 'BOOLEAN' }),
				...(isActive !== null && { isActive: isActive === 'true' }),
			},
			include: {
				values: {
					where: { isActive: true },
					orderBy: { order: 'asc' },
				},
				_count: {
					select: {
						categoryParameters: true,
						supplierOverrides: true,
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		})

		logger.info(`✅ Found ${parameters.length} parameters`)
		return NextResponse.json(parameters)
	} catch (error) {
		logger.error('❌ Error fetching parameters:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch parameters' },
			{ status: 500 }
		)
	}
}

// POST - создать новый параметр
export async function POST(request: NextRequest) {
	try {
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
			isGlobal,
			values, // массив значений для SELECT типов
		} = body

		// Проверка обязательных полей
		if (!name || !type) {
			return NextResponse.json(
				{ error: 'Name and type are required' },
				{ status: 400 }
			)
		}

		// Создаем параметр с значениями
		// isGlobal устанавливается автоматически после создания на основе связей с категориями
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
								order: index,
							})),
					  }
					: undefined,
			},
			include: {
				values: true,
			},
		})

		// Синхронизируем статус isGlobal после создания
		await syncParameterGlobalStatus(parameter.id)

		// Перезагружаем параметр с актуальным isGlobal
		const updatedParameter = await prisma.parameterTemplate.findUnique({
			where: { id: parameter.id },
			include: {
				values: true,
			},
		})

		logger.info(`✅ Created parameter: ${updatedParameter?.name}`)
		return NextResponse.json(updatedParameter)
	} catch (error: unknown) {
		logger.error('❌ Error creating parameter:', error)
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
