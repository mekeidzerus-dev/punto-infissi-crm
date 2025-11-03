/**
 * Умный парсер ввода данных клиента
 * Автоматически распознает: телефон, email, имя/фамилию, компанию
 */

export interface ParsedClientData {
	firstName?: string
	lastName?: string
	companyName?: string
	phone?: string
	email?: string
	errors: string[]
	warnings: string[]
}

/**
 * Валидация и форматирование итальянского телефона
 */
function validateAndFormatPhone(input: string): { phone: string; error?: string } {
	// Убираем все нецифровые символы кроме +
	const cleaned = input.replace(/[^\d+]/g, '')
	
	// Проверяем формат
	if (cleaned.startsWith('+39')) {
		const digits = cleaned.substring(3)
		if (digits.length === 10) {
			return { phone: `+39 ${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6)}` }
		} else if (digits.length === 9) {
			// Автоисправление: добавляем 3 в начало
			return { phone: `+39 3${digits.substring(0, 2)} ${digits.substring(2, 5)} ${digits.substring(5)}` }
		} else {
			return { phone: cleaned, error: `Итальянский номер должен содержать 10 цифр после +39 (найдено: ${digits.length})` }
		}
	} else if (cleaned.startsWith('39') && cleaned.length === 12) {
		// Автоисправление: добавляем +
		const digits = cleaned.substring(2)
		return { phone: `+39 ${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6)}` }
	} else if (cleaned.startsWith('3') && cleaned.length === 10) {
		// Автоисправление: добавляем +39
		return { phone: `+39 ${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}` }
	} else if (/^\d{10}$/.test(cleaned)) {
		// 10 цифр без кода страны
		return { phone: `+39 ${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}` }
	}
	
	return { phone: input, error: 'Неверный формат телефона. Ожидается: +39 XXX XXX XXXX' }
}

/**
 * Валидация email
 */
function validateEmail(input: string): { email: string; error?: string } {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	if (emailRegex.test(input)) {
		return { email: input.toLowerCase() }
	}
	return { email: input, error: 'Неверный формат email' }
}

/**
 * Валидация и форматирование имени
 */
function validateAndFormatName(input: string): { name: string; warning?: string } {
	// Проверяем, что первая буква заглавная
	if (input.length > 0) {
		const formatted = input.charAt(0).toUpperCase() + input.slice(1).toLowerCase()
		if (formatted !== input) {
			return { name: formatted, warning: `Имя автоматически исправлено: "${input}" → "${formatted}"` }
		}
		return { name: input }
	}
	return { name: input }
}

/**
 * Основная функция парсинга
 */
export function parseClientInput(input: string): ParsedClientData {
	const result: ParsedClientData = {
		errors: [],
		warnings: [],
	}
	
	if (!input || !input.trim()) {
		return result
	}
	
	const trimmed = input.trim()
	
	// Разбиваем по пробелам
	const parts = trimmed.split(/\s+/)
	
	const emailParts: string[] = []
	const phoneParts: string[] = []
	const nameParts: string[] = []
	
	// Классифицируем части
	for (const part of parts) {
		if (part.includes('@')) {
			emailParts.push(part)
		} else if (/[\d+\-\(\)]/.test(part) && /\d{3,}/.test(part)) {
			// Содержит цифры и похоже на телефон (минимум 3 цифры подряд)
			phoneParts.push(part)
		} else {
			nameParts.push(part)
		}
	}
	
	// Обрабатываем email
	if (emailParts.length > 0) {
		const emailResult = validateEmail(emailParts[0])
		result.email = emailResult.email
		if (emailResult.error) {
			result.errors.push(emailResult.error)
		}
	}
	
	// Обрабатываем телефон
	if (phoneParts.length > 0) {
		const phoneStr = phoneParts.join('')
		const phoneResult = validateAndFormatPhone(phoneStr)
		result.phone = phoneResult.phone
		if (phoneResult.error) {
			result.errors.push(phoneResult.error)
		}
	}
	
	// Обрабатываем имя/фамилию/компанию
	if (nameParts.length === 1) {
		// Одно слово - считаем именем
		const nameResult = validateAndFormatName(nameParts[0])
		result.firstName = nameResult.name
		if (nameResult.warning) {
			result.warnings.push(nameResult.warning)
		}
	} else if (nameParts.length === 2) {
		// Два слова - имя и фамилия
		const firstNameResult = validateAndFormatName(nameParts[0])
		const lastNameResult = validateAndFormatName(nameParts[1])
		
		result.firstName = firstNameResult.name
		result.lastName = lastNameResult.name
		
		if (firstNameResult.warning) {
			result.warnings.push(firstNameResult.warning)
		}
		if (lastNameResult.warning) {
			result.warnings.push(lastNameResult.warning)
		}
	} else if (nameParts.length > 2) {
		// Больше двух слов - считаем компанией
		result.companyName = nameParts.join(' ')
	}
	
	return result
}

