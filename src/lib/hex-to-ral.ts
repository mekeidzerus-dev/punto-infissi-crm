// Таблица соответствия RAL цветов и их HEX кодов
// Самые популярные RAL цвета для окон и дверей
export const RAL_COLORS = {
	// Белые и светлые
	'RAL 9010': '#F1EBD7', // Pure White / Чисто белый
	'RAL 9016': '#F1F0EA', // Traffic White / Транспортный белый
	'RAL 9001': '#E9E0D2', // Cream / Кремовый
	'RAL 1013': '#E3D9C6', // Oyster White / Жемчужно-белый
	'RAL 1015': '#E6D2B5', // Light Ivory / Светлая слоновая кость

	// Серые
	'RAL 7001': '#8C969D', // Silver Grey / Серебристо-серый
	'RAL 7004': '#9EA0A1', // Signal Grey / Сигнальный серый
	'RAL 7035': '#CBD0CC', // Light Grey / Светло-серый
	'RAL 7040': '#9DA3A6', // Window Grey / Оконный серый
	'RAL 7016': '#383E42', // Anthracite Grey / Антрацитово-серый
	'RAL 7021': '#2E3234', // Black Grey / Чёрно-серый
	'RAL 9007': '#878581', // Grey Aluminium / Серый алюминий

	// Коричневые
	'RAL 8001': '#9D622B', // Ochre Brown / Охра коричневая
	'RAL 8003': '#7E4B26', // Clay Brown / Глиняно-коричневый
	'RAL 8004': '#8D4931', // Copper Brown / Медно-коричневый
	'RAL 8007': '#6F4A2F', // Fawn Brown / Желто-коричневый
	'RAL 8011': '#5A3A29', // Nut Brown / Ореховый
	'RAL 8014': '#49392D', // Sepia Brown / Сепия коричневая
	'RAL 8017': '#442F29', // Chocolate Brown / Шоколадно-коричневый
	'RAL 8019': '#3D3635', // Grey Brown / Серо-коричневый

	// Бежевые
	'RAL 1019': '#A48F7A', // Grey Beige / Серо-бежевый
	'RAL 1001': '#D1BC8A', // Beige / Бежевый
	'RAL 1002': '#D2AA6D', // Sand Yellow / Песочно-жёлтый

	// Чёрные
	'RAL 9005': '#0E0E10', // Jet Black / Чёрный
	'RAL 9011': '#292C2F', // Graphite Black / Графитно-чёрный

	// Зелёные
	'RAL 6005': '#114232', // Moss Green / Зелёный мох
	'RAL 6009': '#27352A', // Fir Green / Пихтовый зелёный
	'RAL 6020': '#37422F', // Chrome Green / Хромовый зелёный

	// Синие
	'RAL 5011': '#1A2B3C', // Steel Blue / Стальной синий
	'RAL 5013': '#1E2832', // Cobalt Blue / Кобальтово-синий
}

// Функция для расчёта расстояния между двумя цветами в RGB
function colorDistance(hex1: string, hex2: string): number {
	const r1 = parseInt(hex1.slice(1, 3), 16)
	const g1 = parseInt(hex1.slice(3, 5), 16)
	const b1 = parseInt(hex1.slice(5, 7), 16)

	const r2 = parseInt(hex2.slice(1, 3), 16)
	const g2 = parseInt(hex2.slice(3, 5), 16)
	const b2 = parseInt(hex2.slice(5, 7), 16)

	// Евклидово расстояние в RGB пространстве
	return Math.sqrt(
		Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2)
	)
}

// Функция для нормализации HEX цвета
function normalizeHex(hex: string): string {
	// Убираем # если есть
	let normalized = hex.replace('#', '')

	// Если короткая форма (#FFF) -> расширяем (#FFFFFF)
	if (normalized.length === 3) {
		normalized = normalized
			.split('')
			.map(c => c + c)
			.join('')
	}

	return '#' + normalized.toUpperCase()
}

// Основная функция: конвертация HEX в ближайший RAL
export function hexToRAL(hexColor: string): string | null {
	if (!hexColor) return null

	const normalizedHex = normalizeHex(hexColor)

	let closestRAL: string | null = null
	let minDistance = Infinity

	// Ищем ближайший RAL цвет
	for (const [ral, hex] of Object.entries(RAL_COLORS)) {
		const distance = colorDistance(normalizedHex, hex)
		if (distance < minDistance) {
			minDistance = distance
			closestRAL = ral
		}
	}

	return closestRAL
}

// Функция для получения HEX по RAL коду
export function ralToHex(ralCode: string): string | null {
	return RAL_COLORS[ralCode as keyof typeof RAL_COLORS] || null
}

// Функция для получения названия цвета по RAL
export function getRALColorName(ralCode: string): {
	ru: string
	it: string
} | null {
	const names: Record<string, { ru: string; it: string }> = {
		'RAL 9010': { ru: 'Чисто белый', it: 'Bianco puro' },
		'RAL 9016': { ru: 'Транспортный белый', it: 'Bianco traffico' },
		'RAL 9001': { ru: 'Кремовый', it: 'Crema' },
		'RAL 7016': { ru: 'Антрацитово-серый', it: 'Grigio antracite' },
		'RAL 7035': { ru: 'Светло-серый', it: 'Grigio chiaro' },
		'RAL 7040': { ru: 'Оконный серый', it: 'Grigio finestra' },
		'RAL 8001': { ru: 'Охра коричневая', it: 'Marrone ocra' },
		'RAL 8003': { ru: 'Глиняно-коричневый', it: 'Marrone argilla' },
		'RAL 8011': { ru: 'Ореховый', it: 'Marrone noce' },
		'RAL 8017': { ru: 'Шоколадный', it: 'Marrone cioccolato' },
		'RAL 9005': { ru: 'Чёрный', it: 'Nero' },
		'RAL 6005': { ru: 'Зелёный мох', it: 'Verde muschio' },
		'RAL 5011': { ru: 'Стальной синий', it: 'Blu acciaio' },
	}

	return names[ralCode] || null
}
