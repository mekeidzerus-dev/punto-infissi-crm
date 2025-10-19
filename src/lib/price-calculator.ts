/**
 * PRICE CALCULATOR - Автоматический расчет цены продуктов
 * 
 * Система расчета цены на основе параметров продукта:
 * - Размеры (площадь)
 * - Материал
 * - Опции (тип открытия, стеклопакет, фурнитура)
 */

import { Configuration } from '@/components/product-configurator'

// ============================================
// ТИПЫ
// ============================================

interface PriceBreakdown {
	basePrice: number // Базовая цена
	sizePrice: number // Цена за размер (площадь)
	materialSurcharge: number // Надбавка за материал
	optionsSurcharge: number // Надбавка за опции
	total: number // Итоговая цена
	details: string[] // Детали расчета
}

interface SupplierPricing {
	supplierId: number
	categoryId: string
	basePricePerSqm: number // Базовая цена за м²
	materialMultipliers: Record<string, number> // Коэффициенты материалов
	optionPrices: Record<string, number> // Цены опций
}

// ============================================
// ЦЕНОВЫЕ ТАБЛИЦЫ ПО ПОСТАВЩИКАМ
// ============================================

const SUPPLIER_PRICING: SupplierPricing[] = [
	// Venus Design - Премиум окна и двери
	{
		supplierId: 1,
		categoryId: 'okna', // ID категории "Окна"
		basePricePerSqm: 250, // €250 за м²
		materialMultipliers: {
			PVC: 1.0, // Базовый материал
			Aluminum: 1.5, // +50%
			Wood: 2.0, // +100%
			Combined: 2.5, // +150%
		},
		optionPrices: {
			// Тип открытия
			casement: 0, // Поворотное - базовое
			'tilt-turn': 50, // Поворотно-откидное +€50
			sliding: 100, // Раздвижное +€100
			fixed: -30, // Глухое -€30

			// Стеклопакет
			'single-glass': -50, // Однокамерный -€50
			'double-glass': 0, // Двухкамерный - базовое
			'triple-glass': 80, // Трехкамерный +€80
			'energy-saving': 120, // Энергосберегающий +€120

			// Фурнитура
			basic: 0, // Базовая
			premium: 100, // Премиум +€100
			smart: 200, // Умная фурнитура +€200
		},
	},
	{
		supplierId: 1,
		categoryId: 'dveri', // ID категории "Двери"
		basePricePerSqm: 400, // €400 за м²
		materialMultipliers: {
			PVC: 1.0,
			Aluminum: 1.4,
			Wood: 1.8,
			Steel: 1.6,
		},
		optionPrices: {
			// Тип открытия
			swing: 0, // Распашная - базовое
			sliding: 150, // Раздвижная +€150
			folding: 200, // Складная +€200

			// Стеклопакет
			'no-glass': -100, // Без стекла -€100
			'small-glass': 0, // Небольшое остекление - базовое
			'full-glass': 150, // Полное остекление +€150

			// Безопасность
			'standard-lock': 0, // Стандартный замок
			'multi-point-lock': 80, // Многоточечный +€80
			'security-class': 200, // Класс безопасности +€200
		},
	},
	// Alco Windows - Средний сегмент
	{
		supplierId: 2,
		categoryId: 'okna',
		basePricePerSqm: 180, // €180 за м²
		materialMultipliers: {
			PVC: 1.0,
			Aluminum: 1.4,
			Wood: 1.7,
		},
		optionPrices: {
			casement: 0,
			'tilt-turn': 40,
			sliding: 80,
			fixed: -20,
			'single-glass': -40,
			'double-glass': 0,
			'triple-glass': 60,
		},
	},
	// PVC Master - Бюджетный сегмент
	{
		supplierId: 3,
		categoryId: 'okna',
		basePricePerSqm: 120, // €120 за м²
		materialMultipliers: {
			PVC: 1.0,
			Aluminum: 1.3,
		},
		optionPrices: {
			casement: 0,
			'tilt-turn': 30,
			sliding: 60,
			fixed: -15,
			'single-glass': -30,
			'double-glass': 0,
			'triple-glass': 50,
		},
	},
]

// ============================================
// ОСНОВНАЯ ФУНКЦИЯ РАСЧЕТА
// ============================================

/**
 * Рассчитывает цену продукта на основе конфигурации
 */
export function calculateProductPrice(
	config: Configuration
): PriceBreakdown {
	const details: string[] = []

	// 1. Найти ценовую таблицу для поставщика и категории
	const pricing = SUPPLIER_PRICING.find(
		p => p.supplierId === config.supplierId && p.categoryId === config.categoryId
	)

	if (!pricing) {
		// Если нет ценовой таблицы, возвращаем 0
		return {
			basePrice: 0,
			sizePrice: 0,
			materialSurcharge: 0,
			optionsSurcharge: 0,
			total: 0,
			details: ['⚠️ Нет ценовой таблицы для данного поставщика и категории'],
		}
	}

	// 2. Рассчитать площадь (если есть размеры)
	const width = getParameterValue(config, ['width', 'ширина', 'larghezza'])
	const height = getParameterValue(config, ['height', 'высота', 'altezza'])

	let area = 0
	if (width && height) {
		// Размеры в мм, переводим в м²
		area = (width / 1000) * (height / 1000)
		details.push(
			`📐 Размеры: ${width}×${height} мм = ${area.toFixed(2)} м²`
		)
	} else {
		// Если размеры не указаны, используем средний размер 1.2м × 1.5м = 1.8м²
		area = 1.8
		details.push('📐 Размеры не указаны, используем стандартные (1.2м × 1.5м)')
	}

	// 3. Базовая цена за площадь
	const basePrice = pricing.basePricePerSqm * area
	details.push(
		`💰 Базовая цена: €${pricing.basePricePerSqm}/м² × ${area.toFixed(2)} м² = €${basePrice.toFixed(2)}`
	)

	// 4. Надбавка за материал
	const material = getParameterValue(config, [
		'material',
		'материал',
		'materiale',
	])
	const materialKey = normalizeValue(material)
	const materialMultiplier = pricing.materialMultipliers[materialKey] || 1.0

	const materialSurcharge =
		materialMultiplier > 1.0
			? basePrice * (materialMultiplier - 1.0)
			: 0

	if (material) {
		details.push(
			`🔧 Материал: ${material} (×${materialMultiplier}) = ${materialSurcharge > 0 ? `+€${materialSurcharge.toFixed(2)}` : 'базовый'}`
		)
	}

	// 5. Надбавки за опции
	let optionsSurcharge = 0
	const params = config.parameters

	Object.entries(params).forEach(([key, value]) => {
		const normalizedValue = normalizeValue(value)
		const optionPrice = pricing.optionPrices[normalizedValue]

		if (optionPrice !== undefined && optionPrice !== 0) {
			optionsSurcharge += optionPrice
			details.push(
				`✨ ${key}: ${value} = ${optionPrice > 0 ? '+' : ''}€${optionPrice.toFixed(2)}`
			)
		}
	})

	// 6. Итоговая цена
	const total = basePrice * materialMultiplier + optionsSurcharge

	details.push(`\n💵 ИТОГО: €${total.toFixed(2)}`)

	return {
		basePrice,
		sizePrice: basePrice,
		materialSurcharge,
		optionsSurcharge,
		total,
		details,
	}
}

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

/**
 * Получает значение параметра по разным возможным ключам
 */
function getParameterValue(
	config: Configuration,
	possibleKeys: string[]
): number | string | null {
	for (const key of possibleKeys) {
		// Ищем по точному совпадению ключа
		if (config.parameters[key] !== undefined) {
			return config.parameters[key]
		}

		// Ищем по частичному совпадению (case-insensitive)
		const foundKey = Object.keys(config.parameters).find(k =>
			k.toLowerCase().includes(key.toLowerCase())
		)

		if (foundKey) {
			return config.parameters[foundKey]
		}
	}

	return null
}

/**
 * Нормализует значение параметра для поиска в таблице цен
 */
function normalizeValue(value: string | number | null): string {
	if (value === null || value === undefined) return ''

	return String(value)
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[аяёюиыеэоуáàâäãåéèêëíìîïóòôöõúùûü]/g, match => {
			const map: Record<string, string> = {
				а: 'a',
				я: 'ya',
				ё: 'yo',
				ю: 'yu',
				и: 'i',
				ы: 'y',
				е: 'e',
				э: 'e',
				о: 'o',
				у: 'u',
			}
			return map[match] || match
		})
}

/**
 * Экспортирует ценовую таблицу для конкретного поставщика
 */
export function getSupplierPricing(
	supplierId: number,
	categoryId: string
): SupplierPricing | null {
	return (
		SUPPLIER_PRICING.find(
			p => p.supplierId === supplierId && p.categoryId === categoryId
		) || null
	)
}

/**
 * Проверяет, есть ли ценовая таблица для поставщика
 */
export function hasSupplierPricing(
	supplierId: number,
	categoryId: string
): boolean {
	return SUPPLIER_PRICING.some(
		p => p.supplierId === supplierId && p.categoryId === categoryId
	)
}

/**
 * Форматирует breakdown цены для отображения пользователю
 */
export function formatPriceBreakdown(breakdown: PriceBreakdown): string {
	return breakdown.details.join('\n')
}

