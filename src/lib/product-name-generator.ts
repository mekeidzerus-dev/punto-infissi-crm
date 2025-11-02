/**
 * Утилита для генерации описания товара из параметров
 * Формат: "Категория | Поставщик | Модель | Размеры | Цвет | Остальные параметры"
 */

interface Parameter {
	name: string // ru
	nameIt: string // it
	valueRu: string
	valueIt: string
	type: string
	unit?: string
	order: number
}

interface GenerateDescriptionParams {
	categoryNameRu?: string
	categoryNameIt?: string
	supplierShortNameRu?: string
	supplierShortNameIt?: string
	supplierFullName?: string
	modelValueRu?: string
	modelValueIt?: string
	parameters: Parameter[]
	locale: 'ru' | 'it'
}

/**
 * Генерирует описание товара в правильном порядке
 * @param params - Параметры для генерации описания
 * @returns Строка описания в формате "Категория | Поставщик | Модель | Размеры | Цвет | Остальные"
 */
export function generateProductDescription(
	params: GenerateDescriptionParams
): string {
	const {
		categoryNameRu,
		categoryNameIt,
		supplierShortNameRu,
		supplierShortNameIt,
		supplierFullName,
		modelValueRu,
		modelValueIt,
		parameters,
		locale,
	} = params

	const parts: string[] = []

	// 1. Категория
	const categoryName = locale === 'ru' ? categoryNameRu : categoryNameIt
	if (categoryName) {
		parts.push(categoryName)
	}

	// 2. Поставщик (используем короткое название если есть, иначе полное)
	const supplierName =
		locale === 'ru'
			? supplierShortNameRu?.trim() || supplierFullName?.trim()
			: supplierShortNameIt?.trim() || supplierFullName?.trim()
	if (supplierName) {
		parts.push(supplierName)
	}

	// 3. Модель (обязательно)
	const modelValue = locale === 'ru' ? modelValueRu : modelValueIt
	if (modelValue) {
		parts.push(modelValue)
	}

	// 4. Размеры - объединяем все NUMBER параметры с размерными единицами
	const sizeParams = parameters
		.filter(
			p =>
				p.type === 'NUMBER' &&
				(p.unit?.includes('мм') ||
					p.unit?.includes('см') ||
					p.unit?.includes('м') ||
					/ширина|высота|глубина|width|height|depth|larghezza|altezza|profondità/i.test(
						p.name
					))
		)
		.sort((a, b) => {
			// Порядок: ширина -> высота -> глубина
			const order = [
				'width',
				'ширина',
				'larghezza',
				'height',
				'высота',
				'altezza',
				'depth',
				'глубина',
				'profondità',
			]
			return (
				order.indexOf(a.name.toLowerCase()) -
				order.indexOf(b.name.toLowerCase())
			)
		})

	if (sizeParams.length > 0) {
		const sizeValues = sizeParams.map(p =>
			locale === 'ru' ? p.valueRu : p.valueIt
		)
		const sizeUnit = sizeParams[0].unit || 'мм'
		const sizeString = sizeValues.join('x') + ` ${sizeUnit}`
		parts.push(sizeString)
		
		// Автоматический расчет площади (м²) для Ширина x Высота
		if (sizeParams.length >= 2) {
			const width = parseFloat(sizeValues[0])
			const height = parseFloat(sizeValues[1])
			if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
				// Конвертируем в метры если единица мм
				const widthM = sizeUnit.includes('мм') ? width / 1000 : 
				              sizeUnit.includes('см') ? width / 100 : width
				const heightM = sizeUnit.includes('мм') ? height / 1000 : 
				               sizeUnit.includes('см') ? height / 100 : height
				const area = (widthM * heightM).toFixed(2)
				parts.push(`${area} м²`)
			}
		}
	}

	// 5. Цвет - найти COLOR параметр
	const colorParam = parameters.find(p => p.type === 'COLOR')
	if (colorParam) {
		const colorValue = locale === 'ru' ? colorParam.valueRu : colorParam.valueIt
		if (colorValue) {
			parts.push(colorValue)
		}
	}

	// 6. Остальные параметры (исключая размеры, цвет, модель)
	const otherParams = parameters
		.filter(
			p =>
				p.type !== 'MODEL' &&
				!sizeParams.includes(p) &&
				p !== colorParam &&
				(locale === 'ru' ? p.valueRu : p.valueIt) // только заполненные
		)
		.sort((a, b) => a.order - b.order)

	for (const param of otherParams) {
		const paramValue = locale === 'ru' ? param.valueRu : param.valueIt
		
		if (paramValue) {
			// Для булевых параметров: добавляем название параметра + значение
			if (param.type === 'BOOLEAN') {
				const paramName = locale === 'ru' ? param.name : param.nameIt
				const boolValue = paramValue === 'true' || paramValue === true
				const boolText = locale === 'ru' 
					? (boolValue ? 'Да' : 'Нет') 
					: (boolValue ? 'Sì' : 'No')
				parts.push(`${paramName}: ${boolText}`)
			} else {
				// Для остальных параметров: только значение
				parts.push(paramValue)
			}
		}
	}

	// Объединяем все части разделителем
	return parts.join(' | ')
}
