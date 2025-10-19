/**
 * Утилита для множественного поиска (поиск по нескольким словам через пробел)
 * Каждое слово сужает результаты поиска (работает как фильтр-воронка)
 */

/**
 * Проверяет, содержит ли текст все указанные слова
 * @param text - текст для проверки
 * @param searchWords - массив слов для поиска
 * @returns true если текст содержит все слова
 */
export function containsAllWords(text: string, searchWords: string[]): boolean {
	if (!text) return false
	const lowerText = text.toLowerCase()
	return searchWords.every(word => lowerText.includes(word.toLowerCase()))
}

/**
 * Проверяет, содержит ли объект все указанные слова хотя бы в одном из полей
 * @param item - объект для проверки
 * @param searchWords - массив слов для поиска
 * @param fields - массив полей объекта для проверки
 * @returns true если объект содержит все слова
 */
export function itemMatchesAllWords<T extends Record<string, any>>(
	item: T,
	searchWords: string[],
	fields: (keyof T)[]
): boolean {
	// Для каждого слова проверяем, есть ли оно хотя бы в одном поле
	return searchWords.every(word => {
		return fields.some(field => {
			const value = item[field]
			if (value === null || value === undefined) return false
			return String(value).toLowerCase().includes(word.toLowerCase())
		})
	})
}

/**
 * Разбивает поисковый запрос на отдельные слова
 * @param searchTerm - поисковый запрос
 * @returns массив слов
 */
export function parseSearchTerms(searchTerm: string): string[] {
	return searchTerm
		.trim()
		.split(/\s+/) // разбивка по пробелам
		.filter(word => word.length > 0) // убираем пустые строки
}

/**
 * Фильтрует массив объектов по множественному поисковому запросу
 * @param items - массив объектов для фильтрации
 * @param searchTerm - поисковый запрос (слова через пробел)
 * @param fields - массив полей для поиска
 * @returns отфильтрованный массив
 */
export function multiSearch<T extends Record<string, any>>(
	items: T[],
	searchTerm: string,
	fields: (keyof T)[]
): T[] {
	if (!searchTerm) return items

	const searchWords = parseSearchTerms(searchTerm)
	if (searchWords.length === 0) return items

	return items.filter(item => itemMatchesAllWords(item, searchWords, fields))
}
