import { z } from 'zod'

/**
 * Схема валидации пароля
 * Требования:
 * - Минимум 8 символов
 * - Хотя бы одна буква
 * - Хотя бы одна цифра
 */
export const passwordSchema = z
	.string()
	.min(8, 'Пароль должен содержать минимум 8 символов')
	.regex(/[a-zA-Z]/, 'Пароль должен содержать хотя бы одну букву')
	.regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру')

export const passwordValidationMessages = {
	ru: {
		minLength: 'Пароль должен содержать минимум 8 символов',
		hasLetter: 'Пароль должен содержать хотя бы одну букву',
		hasNumber: 'Пароль должен содержать хотя бы одну цифру',
		required: 'Пароль обязателен',
	},
	it: {
		minLength: 'La password deve contenere almeno 8 caratteri',
		hasLetter: 'La password deve contenere almeno una lettera',
		hasNumber: 'La password deve contenere almeno un numero',
		required: 'La password è obbligatoria',
	},
}

/**
 * Валидация пароля с локализованными сообщениями
 */
export function validatePassword(password: string, locale: 'ru' | 'it' = 'ru'): {
	valid: boolean
	errors: string[]
} {
	const errors: string[] = []
	const messages = passwordValidationMessages[locale]

	if (!password || password.length < 8) {
		errors.push(messages.minLength)
	}
	if (!/[a-zA-Z]/.test(password)) {
		errors.push(messages.hasLetter)
	}
	if (!/[0-9]/.test(password)) {
		errors.push(messages.hasNumber)
	}

	return {
		valid: errors.length === 0,
		errors,
	}
}

