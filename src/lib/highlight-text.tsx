import React from 'react'

/**
 * Подсвечивает совпадения в тексте зеленым фоном
 * Поддерживает множественный поиск (слова через пробел)
 * @param text - исходный текст
 * @param searchTerm - поисковый запрос (может содержать несколько слов через пробел)
 * @returns React элемент с подсветкой
 */
export function highlightText(
	text: string,
	searchTerm: string
): React.ReactNode {
	if (!searchTerm || !text) {
		return text
	}

	// Разбиваем поисковый запрос на отдельные слова
	const searchWords = searchTerm
		.trim()
		.split(/\s+/) // разбивка по пробелам
		.filter(word => word.length > 0) // убираем пустые строки
		.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // экранируем спецсимволы

	if (searchWords.length === 0) {
		return text
	}

	// Создаем регулярное выражение для всех слов (через ИЛИ)
	const regex = new RegExp(`(${searchWords.join('|')})`, 'gi')
	const parts = text.split(regex)

	return (
		<>
			{parts.map((part, index) => {
				// Проверяем, совпадает ли часть с любым из поисковых слов
				const isMatch = searchWords.some(
					word => part.toLowerCase() === word.toLowerCase()
				)

				if (isMatch) {
					return (
						<span
							key={index}
							className='bg-green-50 text-green-900 font-medium px-1 rounded'
						>
							{part}
						</span>
					)
				}
				return <span key={index}>{part}</span>
			})}
		</>
	)
}
