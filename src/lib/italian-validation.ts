// Простые функции валидации для итальянских документов
// Заменяет удаленный файл italian-validation.ts

export function validateCodiceFiscale(codiceFiscale: string): boolean {
	if (!codiceFiscale) return true // Пустое значение считается валидным

	// Простая проверка длины и формата
	const cfRegex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/
	return cfRegex.test(codiceFiscale.toUpperCase())
}

export function validatePartitaIVA(partitaIVA: string): boolean {
	if (!partitaIVA) return true // Пустое значение считается валидным

	// Простая проверка длины и формата
	const pivaRegex = /^[0-9]{11}$/
	return pivaRegex.test(partitaIVA)
}
