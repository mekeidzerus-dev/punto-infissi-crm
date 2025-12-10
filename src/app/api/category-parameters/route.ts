import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { success, withApiHandler, parseJson } from '@/lib/api-handler'
import {
	buildCategoryParameterUpsertData,
	parseCategoryParameterQuery,
	categoryParameterLinkBodySchema,
	ensureCategoryId,
} from './helpers'

async function fetchCategoryParameters(categoryId: string) {
	const allParameters = await prisma.parameterTemplate.findMany({
		where: {
			isActive: true,
			OR: [
				{ isGlobal: true },
				{ categoryParameters: { some: { categoryId } } },
			],
		},
		include: {
			categoryParameters: { where: { categoryId } },
		},
	})

	const systemOrder: Record<string, number> = {
		Ширина: 1,
		Larghezza: 1,
		Высота: 2,
		Altezza: 2,
	}

	const result = await Promise.all(
		allParameters.map(async parameter => {
			const categoryParam = parameter.categoryParameters[0]
			let values: Array<{
				id: string
				value: string
				valueIt: string | null
				displayName: string | null
				hexColor: string | null
				ralCode: string | null
				order: number
			}> = []

			if (parameter.type === 'SELECT' || parameter.type === 'COLOR') {
				const rawValues = await prisma.parameterValue.findMany({
					where: { parameterId: parameter.id, isActive: true },
					orderBy: { order: 'asc' },
					select: {
						id: true,
						value: true,
						valueIt: true,
						displayName: true,
						hexColor: true,
						ralCode: true,
						order: true,
					},
				})

				values = rawValues.map(v => ({
					id: v.id,
					value: v.value,
					valueIt: v.valueIt,
					displayName: v.displayName,
					hexColor: v.hexColor,
					ralCode: v.ralCode,
					order: v.order,
				}))
			}

			const isModelParameter =
				parameter.name === 'Модель' || parameter.nameIt === 'Modello'
			const isSystemParameter = parameter.isSystem === true

			return {
				id: parameter.id,
				name: parameter.name,
				nameIt: parameter.nameIt,
				type: parameter.type,
				isRequired: isModelParameter || isSystemParameter
					? true
					: categoryParam?.isRequired ?? false,
				isVisible: categoryParam?.isVisible ?? true,
				isLinked: Boolean(categoryParam),
				isGlobal: parameter.isGlobal,
				isSystem: parameter.isSystem,
				unit: parameter.unit,
				min: parameter.minValue,
				max: parameter.maxValue,
				step: parameter.step,
				values,
				order: categoryParam?.order ?? null,
			}
		})
	)

	return result.sort((a, b) => {
		if (a.isSystem && b.isSystem) {
			const orderA = systemOrder[a.name] || systemOrder[a.nameIt || ''] || 999
			const orderB = systemOrder[b.name] || systemOrder[b.nameIt || ''] || 999
			return orderA - orderB
		}
		if (a.isSystem && !b.isSystem) return -1
		if (!a.isSystem && b.isSystem) return 1
		return 0
	})
}

export const GET = withApiHandler(async (request: NextRequest) => {
	const query = parseCategoryParameterQuery(request.nextUrl.searchParams)

	return success(await fetchCategoryParameters(query.categoryId))
})

export const POST = withApiHandler(async (request: NextRequest) => {
	const payload = await parseJson(request, categoryParameterLinkBodySchema)
	const categoryId = ensureCategoryId(request.nextUrl.searchParams.get('categoryId'))

	await prisma.categoryParameter.upsert(
		buildCategoryParameterUpsertData(categoryId, payload.parameterId, payload)
	)

	return success({ success: true })
})
