import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
	try {
		console.log('🔍 Fetching category parameters...')

		const { searchParams } = new URL(request.url)
		const categoryId = searchParams.get('categoryId')

		if (!categoryId) {
			return NextResponse.json(
				{ error: 'Category ID is required' },
				{ status: 400 }
			)
		}

		// Получаем параметры категории через CategoryParameter
		const categoryParameters = await prisma.categoryParameter.findMany({
			where: {
				categoryId: categoryId,
				isVisible: true,
			},
			include: {
				parameter: true,
			},
			orderBy: [{ order: 'asc' }, { parameter: { name: 'asc' } }],
		})

		// Получаем значения для SELECT и COLOR параметров
		const parametersWithValues = await Promise.all(
			categoryParameters.map(async catParam => {
				const param = catParam.parameter

				if (param.type === 'SELECT' || param.type === 'COLOR') {
					const values = await prisma.parameterValue.findMany({
						where: {
							parameterId: param.id,
							isActive: true,
						},
						select: {
							value: true,
							displayName: true,
							hexColor: true,
						},
						orderBy: {
							order: 'asc',
						},
					})

					return {
						id: param.id,
						name: catParam.displayName || param.name,
						type: param.type,
						isRequired: catParam.isRequired,
						isVisible: catParam.isVisible,
						unit: param.unit,
						min: param.minValue,
						max: param.maxValue,
						step: param.step,
						group: 'Общие', // Пока без группировки
						values: values.map(v => v.value),
					}
				}

				return {
					id: param.id,
					name: catParam.displayName || param.name,
					type: param.type,
					isRequired: catParam.isRequired,
					isVisible: catParam.isVisible,
					unit: param.unit,
					min: param.minValue,
					max: param.maxValue,
					step: param.step,
					group: 'Общие', // Пока без группировки
				}
			})
		)

		console.log(
			`✅ Found ${parametersWithValues.length} parameters for category ${categoryId}`
		)
		return NextResponse.json(parametersWithValues)
	} catch (error) {
		console.error('❌ Error fetching category parameters:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch category parameters', details: String(error) },
			{ status: 500 }
		)
	}
}
