import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - получить все параметры
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const type = searchParams.get('type')
		const isActive = searchParams.get('isActive')

		const parameters = await prisma.parameterTemplate.findMany({
			where: {
				...(type && { type: type as any }),
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

		console.log(`✅ Found ${parameters.length} parameters`)
		return NextResponse.json(parameters)
	} catch (error) {
		console.error('❌ Error fetching parameters:', error)
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
				values: values
					? {
							create: values.map((v: any, index: number) => ({
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

		console.log(`✅ Created parameter: ${parameter.name}`)
		return NextResponse.json(parameter)
	} catch (error: any) {
		console.error('❌ Error creating parameter:', error)
		if (error.code === 'P2002') {
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
