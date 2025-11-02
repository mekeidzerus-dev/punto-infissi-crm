/**
 * Утилита для построения объекта ProposalPosition из данных конфигуратора
 * Сохраняет оба варианта локализации (ru/it) для всех полей
 */

import { logger } from './logger'

interface ProductData {
	category: {
		id: string
		name: string
		nameIt?: string
	}
	supplier: {
		id: number
		name: string
		shortName?: string | null
		shortNameIt?: string | null
	}
	configuration: Record<string, unknown> // Параметры с их значениями
	parameters: Array<{
		id: string
		name: string
		nameIt?: string
		type: string
		values?: Array<{
			id?: string
			value: string
			valueIt?: string
			ralCode?: string
		}>
		unit?: string
		order?: number
		isGlobal?: boolean
	}>
}

interface ProposalPosition {
	id?: string
	categoryId: string
	categoryNameRu?: string
	categoryNameIt?: string
	supplierCategoryId: string
	supplierShortNameRu?: string
	supplierShortNameIt?: string
	supplier?: { name: string }
	modelValueRu?: string
	modelValueIt?: string
	parameters: Array<{
		id: string
		name: string
		nameIt: string
		type: 'SELECT' | 'COLOR' | 'TEXT' | 'NUMBER'
		valueRu: string
		valueIt: string
		unit?: string
		order: number
	}>
	configuration: Record<string, unknown>
	customNotes?: string
	unitPrice: number
	quantity: number
	discount: number
	vatRate: number
	vatAmount: number
	total: number
	description?: string
}

/**
 * Построить объект ProposalPosition из данных продукта
 * @param product - Данные продукта из конфигуратора
 * @returns ProposalPosition с полными данными для локализации
 */
export function buildProductPosition(product: ProductData): ProposalPosition {
	try {
		// 1. Сохранить оба варианта названия категории
		const categoryNameRu = product.category.name
		const categoryNameIt = product.category.nameIt || product.category.name

		// 2. Сохранить оба варианта короткого названия поставщика
		const supplierShortNameRu = product.supplier.shortName || null
		const supplierShortNameIt = product.supplier.shortNameIt || null

		// 3. Найти параметр "Модель" и извлечь его значение
		const modelParameter = product.parameters.find(
			p => p.name === 'Модель' || p.nameIt === 'Modello'
		)

		let modelValueRu = ''
		let modelValueIt = ''

		if (modelParameter) {
			const modelValue = product.configuration[modelParameter.id]
			if (
				modelValue &&
				!(typeof modelValue === 'string' && modelValue.trim() === '')
			) {
				// Для TEXT параметра значение одинаковое для обеих локалей
				modelValueRu = String(modelValue || '')
				modelValueIt = String(modelValue || '')
			} else {
				// Модель найдена, но не заполнена - используем пустую строку
				logger.warn('⚠️ Параметр "Модель" найден, но не заполнен')
			}
		} else {
			// Параметр "Модель" не найден в списке параметров
			// Это может быть если параметр еще не создан или не связан с категорией
			// Проверяем в configuration напрямую - может быть там есть значение с другим ID
			logger.warn(
				'⚠️ Параметр "Модель" не найден в списке parameters. Проверяю configuration напрямую...'
			)

			// Ищем значение модели в configuration по ключам содержащим "model" или "модель"
			const modelKey = Object.keys(product.configuration).find(
				key =>
					key.toLowerCase().includes('model') ||
					key.toLowerCase().includes('модель') ||
					key.toLowerCase().includes('modello')
			)

			if (modelKey) {
				const modelValue = product.configuration[modelKey]
				if (
					modelValue &&
					!(typeof modelValue === 'string' && modelValue.trim() === '')
				) {
					modelValueRu = String(modelValue)
					modelValueIt = String(modelValue)
					logger.info(
						`✅ Найдено значение модели в configuration по ключу: ${modelKey}`
					)
				}
			}

			// Если все еще не найдено - используем пустую строку (fallback)
			// Валидация должна была проверить заполнение модели до вызова buildProductPosition
			if (!modelValueRu) {
				logger.warn(
					'⚠️ Параметр "Модель" не найден и значение не найдено в configuration. Использую пустую строку.'
				)
			}
		}

		// 4. Сформировать массив parameters с полными метаданными
		const parametersArray: ProposalPosition['parameters'] = []

		for (const parameter of product.parameters) {
			// Пропускаем "Модель" - он в отдельном поле
			if (parameter.name === 'Модель' || parameter.nameIt === 'Modello') {
				continue
			}

			const paramValue = product.configuration[parameter.id]

			// Пропускаем пустые значения
			if (
				!paramValue ||
				(typeof paramValue === 'string' && paramValue.trim() === '') ||
				(Array.isArray(paramValue) && paramValue.length === 0)
			) {
				continue
			}

			let valueRu = ''
			let valueIt = ''

			// Обработка в зависимости от типа параметра
			if (parameter.type === 'TEXT') {
				// Для TEXT - значение одинаковое для обеих локалей
				if (Array.isArray(paramValue)) {
					// Множественные значения - объединяем через запятую
					valueRu = paramValue.filter(v => v && v.trim()).join(', ')
					valueIt = valueRu
				} else {
					valueRu = String(paramValue)
					valueIt = valueRu
				}
			} else if (parameter.type === 'NUMBER') {
				// Для NUMBER - значение одинаковое, единицы измерения могут быть в unit
				const numValue = String(paramValue)
				valueRu = numValue
				valueIt = numValue
				// Если есть unit, добавим его (если нужно разное для ru/it - можно расширить)
			} else if (parameter.type === 'SELECT' || parameter.type === 'COLOR') {
				// Для SELECT/COLOR - ищем значение в списке значений
				const selectedValue = parameter.values?.find(
					v =>
						v.value === paramValue ||
						v.valueIt === paramValue ||
						v.id === paramValue
				)

				if (selectedValue) {
					valueRu = selectedValue.value || ''
					valueIt = selectedValue.valueIt || selectedValue.value || ''

					// Если есть RAL код для цвета - добавляем его
					if (parameter.type === 'COLOR' && selectedValue.ralCode) {
						valueRu = `${valueRu} (${selectedValue.ralCode})`
						valueIt = `${valueIt} (${selectedValue.ralCode})`
					}
				} else {
					// Fallback - если значение не найдено в списке
					valueRu = String(paramValue)
					valueIt = String(paramValue)
				}
			} else {
				// Для других типов - используем значение как есть
				valueRu = String(paramValue)
				valueIt = String(paramValue)
			}

			parametersArray.push({
				id: parameter.id,
				name: parameter.name,
				nameIt: parameter.nameIt || parameter.name,
				type: parameter.type as 'SELECT' | 'COLOR' | 'TEXT' | 'NUMBER',
				valueRu: valueRu.trim(),
				valueIt: valueIt.trim(),
				unit: parameter.unit || undefined,
				order: parameter.order || 0,
			})
		}

		// Сортировка параметров по order
		parametersArray.sort((a, b) => a.order - b.order)

		// Извлекаем customNotes из конфигурации
		const customNotes = product.configuration._customNotes || ''

		// Удаляем _customNotes из configuration перед сохранением
		const cleanConfiguration = { ...product.configuration }
		delete cleanConfiguration._customNotes

		// Формируем базовый объект позиции
		// Остальные поля (unitPrice, quantity, etc.) будут заполнены в родительском компоненте
		const position: ProposalPosition = {
			id: Date.now().toString(),
			categoryId: product.category.id,
			categoryNameRu,
			categoryNameIt,
			supplierCategoryId: '', // Будет заполнено в родительском компоненте
			supplierShortNameRu: supplierShortNameRu || undefined,
			supplierShortNameIt: supplierShortNameIt || undefined,
			supplier: { name: product.supplier.name },
			modelValueRu,
			modelValueIt,
			parameters: parametersArray,
			configuration: cleanConfiguration,
			customNotes: customNotes || undefined,
			unitPrice: 0,
			quantity: 1,
			discount: 0,
			vatRate: 22.0,
			vatAmount: 0,
			total: 0,
		}

		logger.info('✅ Built product position:', {
			categoryNameRu,
			supplierShortNameRu: supplierShortNameRu || 'not set',
			modelValueRu,
			parametersCount: parametersArray.length,
			hasCustomNotes: !!customNotes,
		})

		return position
	} catch (error) {
		logger.error('❌ Error building product position:', error)
		throw error
	}
}
