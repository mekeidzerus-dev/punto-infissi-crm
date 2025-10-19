/**
 * Утилиты для валидации итальянских данных
 */

/**
 * Валидация итальянского номера телефона
 * Форматы: +39 xxx xxx xxxx, 39xxxxxxxxxx, 3xxxxxxxxx
 */
export function validateItalianPhone(phone: string): boolean {
	if (!phone) return false

	// Убираем все пробелы и дефисы
	const cleaned = phone.replace(/[\s\-()]/g, '')

	// Проверяем формат
	const patterns = [
		/^\+39\d{9,10}$/, // +39xxxxxxxxx
		/^39\d{9,10}$/, // 39xxxxxxxxx
		/^3\d{8,9}$/, // 3xxxxxxxx (мобильный)
		/^0\d{9,10}$/, // 0xxxxxxxxx (стационарный)
	]

	return patterns.some(pattern => pattern.test(cleaned))
}

/**
 * Форматирование итальянского номера телефона
 * Преобразует в формат: +39 xxx xxx xxxx
 */
export function formatItalianPhone(phone: string): string {
	if (!phone) return ''

	// Убираем все пробелы и символы
	const cleaned = phone.replace(/[\s\-()]/g, '')

	// Убираем префикс +39 или 39 если есть
	let number = cleaned
	if (cleaned.startsWith('+39')) {
		number = cleaned.substring(3)
	} else if (cleaned.startsWith('39')) {
		number = cleaned.substring(2)
	}

	// Форматируем: +39 xxx xxx xxxx
	if (number.length >= 9) {
		const part1 = number.substring(0, 3)
		const part2 = number.substring(3, 6)
		const part3 = number.substring(6, 10)
		return `+39 ${part1} ${part2} ${part3}`.trim()
	}

	return `+39 ${number}`
}

/**
 * Валидация Codice Fiscale (16 символов)
 * Формат: RSSMRA80A01H501U
 */
export function validateCodiceFiscale(cf: string): boolean {
	if (!cf) return true // Опциональное поле

	// Убираем пробелы и приводим к верхнему регистру
	const cleaned = cf.replace(/\s/g, '').toUpperCase()

	// Проверяем длину
	if (cleaned.length !== 16) return false

	// Проверяем формат: LLLLLLNNLNNLNNNL
	const pattern = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/

	return pattern.test(cleaned)
}

/**
 * Валидация Partita IVA (11 цифр)
 * Формат: 12345678901
 */
export function validatePartitaIVA(piva: string): boolean {
	if (!piva) return true // Опциональное поле

	// Убираем пробелы
	const cleaned = piva.replace(/\s/g, '')

	// Проверяем длину и что это только цифры
	if (cleaned.length !== 11) return false
	if (!/^\d{11}$/.test(cleaned)) return false

	return true
}

/**
 * Форматирование Codice Fiscale
 */
export function formatCodiceFiscale(cf: string): string {
	if (!cf) return ''
	return cf.replace(/\s/g, '').toUpperCase()
}

/**
 * Форматирование Partita IVA
 */
export function formatPartitaIVA(piva: string): string {
	if (!piva) return ''
	return piva.replace(/\s/g, '')
}

/**
 * Автоформатирование телефона при вводе
 */
export function autoFormatPhone(value: string): string {
	// Убираем все кроме цифр и +
	let cleaned = value.replace(/[^\d+]/g, '')

	// Если начинается не с +, добавляем +39
	if (!cleaned.startsWith('+')) {
		cleaned = '+39' + cleaned
	}

	// Ограничиваем длину
	if (cleaned.length > 13) {
		cleaned = cleaned.substring(0, 13)
	}

	return cleaned
}
