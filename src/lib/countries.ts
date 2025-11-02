/**
 * Список стран с кодами и флагами для телефонных номеров
 */

export interface Country {
	code: string // ISO код страны
	name: string // Название страны
	dialCode: string // Телефонный код
	flag: string // Emoji флаг
	format?: string // Формат номера (опционально)
}

export const COUNTRIES: Country[] = [
	{
		code: 'IT',
		name: 'Италия',
		dialCode: '+39',
		flag: '🇮🇹',
		format: 'XXX XXX XXXX',
	},
	{
		code: 'FR',
		name: 'Франция',
		dialCode: '+33',
		flag: '🇫🇷',
		format: 'X XX XX XX XX',
	},
	{
		code: 'DE',
		name: 'Германия',
		dialCode: '+49',
		flag: '🇩🇪',
		format: 'XXX XXXXXXX',
	},
	{
		code: 'ES',
		name: 'Испания',
		dialCode: '+34',
		flag: '🇪🇸',
		format: 'XXX XXX XXX',
	},
	{
		code: 'CH',
		name: 'Швейцария',
		dialCode: '+41',
		flag: '🇨🇭',
		format: 'XX XXX XX XX',
	},
	{
		code: 'AT',
		name: 'Австрия',
		dialCode: '+43',
		flag: '🇦🇹',
		format: 'XXX XXXXXXX',
	},
	{
		code: 'GB',
		name: 'Великобритания',
		dialCode: '+44',
		flag: '🇬🇧',
		format: 'XXXX XXXXXX',
	},
	{
		code: 'US',
		name: 'США',
		dialCode: '+1',
		flag: '🇺🇸',
		format: '(XXX) XXX-XXXX',
	},
	{
		code: 'RU',
		name: 'Россия',
		dialCode: '+7',
		flag: '🇷🇺',
		format: '(XXX) XXX-XX-XX',
	},
	{
		code: 'PL',
		name: 'Польша',
		dialCode: '+48',
		flag: '🇵🇱',
		format: 'XXX XXX XXX',
	},
	{
		code: 'NL',
		name: 'Нидерланды',
		dialCode: '+31',
		flag: '🇳🇱',
		format: 'X XXXXXXXX',
	},
	{
		code: 'BE',
		name: 'Бельгия',
		dialCode: '+32',
		flag: '🇧🇪',
		format: 'XXX XX XX XX',
	},
]

/**
 * Получить страну по коду
 */
export function getCountryByCode(code: string): Country | undefined {
	return COUNTRIES.find(c => c.code === code)
}

/**
 * Получить страну по телефонному коду
 */
export function getCountryByDialCode(dialCode: string): Country | undefined {
	return COUNTRIES.find(c => dialCode.startsWith(c.dialCode))
}

/**
 * Форматировать номер телефона для выбранной страны
 */
export function formatPhoneForCountry(phone: string, country: Country): string {
	// Удаляем все кроме цифр и +
	let cleaned = phone.replace(/[^\d+]/g, '')

	// Если не начинается с кода страны, добавляем
	if (!cleaned.startsWith(country.dialCode)) {
		cleaned = country.dialCode + cleaned.replace(/^\+/, '')
	}

	// Получаем цифры после кода страны
	const digits = cleaned.substring(country.dialCode.length).replace(/\s/g, '')

	// Базовое форматирование (можно расширить для каждой страны)
	if (country.code === 'IT') {
		// Италия: +39 XXX XXX XXXX
		if (digits.length > 6) {
			return `${country.dialCode} ${digits.substring(0, 3)} ${digits.substring(
				3,
				6
			)} ${digits.substring(6, 10)}`
		} else if (digits.length > 3) {
			return `${country.dialCode} ${digits.substring(0, 3)} ${digits.substring(
				3
			)}`
		} else {
			return `${country.dialCode} ${digits}`
		}
	} else if (country.code === 'US' || country.code === 'RU') {
		// США/Россия: +X (XXX) XXX-XXXX
		if (digits.length > 6) {
			return `${country.dialCode} (${digits.substring(
				0,
				3
			)}) ${digits.substring(3, 6)}-${digits.substring(6, 10)}`
		} else if (digits.length > 3) {
			return `${country.dialCode} (${digits.substring(
				0,
				3
			)}) ${digits.substring(3)}`
		} else if (digits.length > 0) {
			return `${country.dialCode} (${digits}`
		} else {
			return `${country.dialCode} `
		}
	} else {
		// Для остальных стран - простое форматирование группами по 3
		const formatted = digits.match(/.{1,3}/g)?.join(' ') || digits
		return `${country.dialCode} ${formatted}`
	}
}

/**
 * Валидация телефона для конкретной страны
 */
export function validatePhoneForCountry(
	phone: string,
	country: Country
): boolean {
	const cleaned = phone.replace(/[^\d+]/g, '')

	if (!cleaned.startsWith(country.dialCode)) {
		return false
	}

	const digits = cleaned.substring(country.dialCode.length)

	// Базовая валидация по длине (можно расширить для каждой страны)
	const minLength = country.code === 'IT' ? 9 : 7
	const maxLength = country.code === 'IT' ? 10 : 15

	return digits.length >= minLength && digits.length <= maxLength
}
