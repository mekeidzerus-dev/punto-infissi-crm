import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
	try {
		logger.info('🔍 Fetching category parameters...')

		const { searchParams } = new URL(request.url)
		const categoryId = searchParams.get('categoryId')

		if (!categoryId) {
			return NextResponse.json(
				{ error: 'Category ID is required' },
				{ status: 400 }
			)
		}

		// Получаем все параметры (и глобальные, и привязанные к категории)
		// ВАЖНО: Глобальные параметры (isGlobal=true) показываются всегда,
		// даже если они не связаны с категорией через categoryParameters
		const allParameters = await prisma.parameterTemplate.findMany({
			where: {
				isActive: true,
				// Включаем либо глобальные параметры, либо параметры связанные с категорией
				OR: [
					{ isGlobal: true }, // Глобальные параметры всегда
					{
						categoryParameters: {
							some: {
								categoryId: categoryId,
							},
						},
					},
				],
			},
		include: {
			categoryParameters: {
				where: {
					categoryId: categoryId,
				},
			},
		},
		// Без orderBy здесь, сортировка будет в коде ниже
	})

		// Формируем результат - показываем все параметры
		const result = await Promise.all(
			allParameters.map(async param => {
				const categoryParam = param.categoryParameters[0]

				// Получаем значения для SELECT и COLOR параметров
				let values = []
				if (param.type === 'SELECT' || param.type === 'COLOR') {
					const paramValues = await prisma.parameterValue.findMany({
						where: {
							parameterId: param.id,
							isActive: true,
						},
						select: {
							id: true,
							value: true,
							valueIt: true,
							displayName: true,
							hexColor: true,
						},
						orderBy: {
							order: 'asc',
						},
					})
					values = paramValues.map(v => ({
						id: v.id, // Добавляем ID для уникальной идентификации
						value: v.value,
						valueIt: v.valueIt,
						displayName: v.displayName,
						hexColor: v.hexColor,
					}))
				}

				// Параметр "Модель" всегда обязателен
				const isModelParameter =
					param.name === 'Модель' || param.nameIt === 'Modello'
				// Системные параметры (размеры) всегда обязательны
				const isSystemParameter = param.isSystem === true
				const isRequired = isModelParameter || isSystemParameter
					? true
					: categoryParam?.isRequired || false

				return {
					id: param.id,
					name: param.name,
					nameIt: param.nameIt,
					type: param.type,
					isRequired,
					isVisible: categoryParam?.isVisible ?? true, // По умолчанию видимый
					isLinked: !!categoryParam, // Показываем, привязан ли параметр
					isGlobal: param.isGlobal, // Глобальный или категорийный параметр
					isSystem: param.isSystem, // Системный параметр (размеры)
					unit: param.unit,
					min: param.minValue,
					max: param.maxValue,
					step: param.step,
					values,
				}
			})
		)

		// Специальная сортировка: Ширина → Высота для системных параметров
		result.sort((a, b) => {
			// Если оба системные параметры размеров
			if (a.isSystem && b.isSystem) {
				const systemOrder: Record<string, number> = {
					'Ширина': 1,
					'Larghezza': 1,
					'Высота': 2,
					'Altezza': 2,
				}
				const orderA = systemOrder[a.name] || systemOrder[a.nameIt || ''] || 999
				const orderB = systemOrder[b.name] || systemOrder[b.nameIt || ''] || 999
				return orderA - orderB
			}
			// Системные параметры всегда первые
			if (a.isSystem && !b.isSystem) return -1
			if (!a.isSystem && b.isSystem) return 1
			// Остальные по алфавиту
			return 0
		})

		logger.info(
			`✅ Found ${result.length} parameters for category ${categoryId}`
		)
		return NextResponse.json(result)
	} catch (error) {
		logger.error('❌ Error fetching category parameters:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch category parameters', details: String(error) },
			{ status: 500 }
		)
	}
}
