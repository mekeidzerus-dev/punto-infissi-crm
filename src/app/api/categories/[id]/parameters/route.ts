import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT /api/categories/[id]/parameters
// Массовое обновление параметров категории
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const categoryId = params.id
		const body = await request.json()
		const { parameters } = body // Массив { parameterId, isRequired, isVisible, defaultValue, displayName, helpText, unit }

		if (!Array.isArray(parameters)) {
			return NextResponse.json(
				{ error: 'Parameters must be an array' },
				{ status: 400 }
			)
		}

		// Проверяем существование категории
		const category = await prisma.productCategory.findUnique({
			where: { id: categoryId },
		})

		if (!category) {
			return NextResponse.json({ error: 'Category not found' }, { status: 404 })
		}

		// Обновляем каждый параметр
		const updatePromises = parameters.map(param => {
			const { parameterId, ...data } = param

			// Проверяем, существует ли уже связь
			return prisma.categoryParameter.upsert({
				where: {
					categoryId_parameterId: {
						categoryId: categoryId,
						parameterId: parameterId,
					},
				},
				update: {
					isRequired:
						data.isRequired !== undefined ? data.isRequired : undefined,
					isVisible: data.isVisible !== undefined ? data.isVisible : undefined,
					defaultValue:
						data.defaultValue !== undefined ? data.defaultValue : undefined,
					displayName:
						data.displayName !== undefined ? data.displayName : undefined,
					helpText: data.helpText !== undefined ? data.helpText : undefined,
					unit: data.unit !== undefined ? data.unit : undefined,
				},
				create: {
					categoryId: categoryId,
					parameterId: parameterId,
					isRequired: data.isRequired || false,
					isVisible: data.isVisible !== undefined ? data.isVisible : true,
					defaultValue: data.defaultValue || null,
					displayName: data.displayName || null,
					helpText: data.helpText || null,
					unit: data.unit || null,
				},
			})
		})

		await Promise.all(updatePromises)

		// Получаем обновленные параметры
		const updatedParameters = await prisma.categoryParameter.findMany({
			where: { categoryId: categoryId },
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
			orderBy: {
				parameter: {
					name: 'asc',
				},
			},
		})

		console.log(
			`✅ Updated ${parameters.length} parameters for category ${categoryId}`
		)

		return NextResponse.json(updatedParameters)
	} catch (error) {
		console.error('❌ Error updating category parameters:', error)
		return NextResponse.json(
			{ error: 'Failed to update category parameters' },
			{ status: 500 }
		)
	}
}
