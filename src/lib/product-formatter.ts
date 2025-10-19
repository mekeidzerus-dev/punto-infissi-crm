// Утилита для форматирования конфигурации продукта в читаемый текст

export interface ProductConfiguration {
	categoryId: string
	supplierId: number
	supplierCategoryId: string
	parameters: Record<string, any>
	customNotes?: string
}

export interface CategoryParameter {
	id: string
	parameter: {
		id: string
		name: string
		nameIt: string
		type: string
		unit?: string
		values?: Array<{
			id: string
			value: string
			valueIt: string
			displayName?: string
			ralCode?: string
		}>
	}
	displayName?: string
	displayNameIt?: string
}

/**
 * Форматирует конфигурацию продукта в читаемый текст
 */
export async function formatProductDescription(
	config: ProductConfiguration,
	categoryParams: CategoryParameter[],
	locale: 'ru' | 'it' = 'it'
): Promise<string> {
	const parts: string[] = []

	// Сортируем параметры по порядку
	const sortedParams = categoryParams.sort(
		(a: any, b: any) => a.order - b.order
	)

	for (const cp of sortedParams) {
		const param = cp.parameter
		const value = config.parameters[param.id]

		if (value === undefined || value === null || value === '') continue

		// Название параметра
		const paramName =
			locale === 'ru'
				? cp.displayName || param.name
				: cp.displayNameIt || param.nameIt || param.name

		// Форматируем значение
		let formattedValue = String(value)

		switch (param.type) {
			case 'NUMBER':
				formattedValue = `${value}${param.unit ? ' ' + param.unit : ''}`
				break

			case 'SELECT':
			case 'COLOR':
				// Находим читаемое значение
				const valueObj = param.values?.find(v => v.value === value)
				if (valueObj) {
					formattedValue =
						locale === 'ru'
							? valueObj.displayName || valueObj.value
							: valueObj.valueIt || valueObj.value
					if (valueObj.ralCode) {
						formattedValue += ` (${valueObj.ralCode})`
					}
				}
				break

			case 'BOOLEAN':
				formattedValue = value === 'true' || value === true ? 'Sì' : 'No'
				break
		}

		parts.push(`${paramName}: ${formattedValue}`)
	}

	// Добавляем дополнительные заметки если есть
	if (config.customNotes) {
		parts.push(`Note: ${config.customNotes}`)
	}

	return parts.join(', ')
}

/**
 * Форматирует конфигурацию для отображения в таблице (короткая версия)
 */
export function formatProductDescriptionShort(
	config: ProductConfiguration,
	categoryParams: CategoryParameter[],
	locale: 'ru' | 'it' = 'it'
): string {
	const parts: string[] = []

	// Только ключевые параметры
	const keyParams = [
		'Larghezza',
		'Altezza',
		'Materiale telaio',
		'Colore telaio',
	]

	for (const cp of categoryParams) {
		const param = cp.parameter

		// Проверяем это ключевой параметр
		if (
			!keyParams.some(k => param.nameIt?.includes(k) || param.name?.includes(k))
		) {
			continue
		}

		const value = config.parameters[param.id]
		if (value === undefined || value === null || value === '') continue

		// Форматируем
		let formattedValue = String(value)

		if (param.type === 'NUMBER') {
			formattedValue = `${value}${param.unit ? param.unit : ''}`
		} else if (param.type === 'SELECT' || param.type === 'COLOR') {
			const valueObj = param.values?.find(v => v.value === value)
			if (valueObj) {
				formattedValue =
					locale === 'ru'
						? valueObj.displayName || valueObj.value
						: valueObj.valueIt || valueObj.value
			}
		}

		const paramName = locale === 'ru' ? param.name : param.nameIt || param.name
		parts.push(`${paramName}: ${formattedValue}`)
	}

	return parts.join(' | ')
}

/**
 * Получает параметры категории для форматирования
 */
export async function getCategoryParametersForFormatting(
	categoryId: string
): Promise<CategoryParameter[]> {
	try {
		const response = await fetch(
			`/api/category-parameters?categoryId=${categoryId}`
		)
		if (!response.ok) return []
		return await response.json()
	} catch (error) {
		console.error('Error fetching category parameters:', error)
		return []
	}
}
