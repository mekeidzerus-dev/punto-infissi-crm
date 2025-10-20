// Валидация конфигурации продукта перед сохранением

export interface ValidationError {
	field: string
	message: string
	messageIt: string
}

export interface ValidationResult {
	valid: boolean
	errors: ValidationError[]
}

/**
 * Валидирует конфигурацию продукта
 * @param config - конфигурация продукта { categoryId, supplierId, parameters }
 * @param categoryParameters - параметры категории с настройками
 * @param locale - текущий язык интерфейса
 * @returns результат валидации с ошибками
 */
export function validateProduct(
	config: {
		categoryId?: string
		supplierId?: number
		parameters: Record<string, any>
	},
	categoryParameters: any[],
	locale: 'ru' | 'it' = 'it'
): ValidationResult {
	const errors: ValidationError[] = []

	// 1. Проверка обязательных полей
	if (!config.categoryId) {
		errors.push({
			field: 'category',
			message: 'Необходимо выбрать категорию продукта',
			messageIt: 'È necessario selezionare una categoria',
		})
	}

	if (!config.supplierId) {
		errors.push({
			field: 'supplier',
			message: 'Необходимо выбрать поставщика',
			messageIt: 'È necessario selezionare un fornitore',
		})
	}

	// 2. Проверка обязательных параметров
	for (const catParam of categoryParameters) {
		if (!catParam.isRequired) continue

		const value = config.parameters[catParam.parameter.id]
		const paramName =
			locale === 'it'
				? catParam.parameter.nameIt || catParam.parameter.name
				: catParam.parameter.name

		// Проверка на наличие значения
		if (value === undefined || value === null || value === '') {
			errors.push({
				field: catParam.parameter.id,
				message: `Параметр "${paramName}" обязателен для заполнения`,
				messageIt: `Il parametro "${paramName}" è obbligatorio`,
			})
			continue
		}

		// 3. Валидация NUMBER параметров
		if (catParam.parameter.type === 'NUMBER') {
			const numValue = parseFloat(value)

			if (isNaN(numValue)) {
				errors.push({
					field: catParam.parameter.id,
					message: `Параметр "${paramName}" должен быть числом`,
					messageIt: `Il parametro "${paramName}" deve essere un numero`,
				})
				continue
			}

			// Проверка min/max
			if (
				catParam.parameter.minValue !== null &&
				numValue < catParam.parameter.minValue
			) {
				errors.push({
					field: catParam.parameter.id,
					message: `"${paramName}" не может быть меньше ${
						catParam.parameter.minValue
					}${catParam.parameter.unit || ''}`,
					messageIt: `"${paramName}" non può essere inferiore a ${
						catParam.parameter.minValue
					}${catParam.parameter.unit || ''}`,
				})
			}

			if (
				catParam.parameter.maxValue !== null &&
				numValue > catParam.parameter.maxValue
			) {
				errors.push({
					field: catParam.parameter.id,
					message: `"${paramName}" не может быть больше ${
						catParam.parameter.maxValue
					}${catParam.parameter.unit || ''}`,
					messageIt: `"${paramName}" non può essere superiore a ${
						catParam.parameter.maxValue
					}${catParam.parameter.unit || ''}`,
				})
			}
		}

		// 4. Валидация COLOR параметров
		if (catParam.parameter.type === 'COLOR') {
			const colorValue = typeof value === 'string' ? value : ''

			// Проверка HEX формата если это строка
			if (colorValue.startsWith('#')) {
				const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
				if (!hexPattern.test(colorValue)) {
					errors.push({
						field: catParam.parameter.id,
						message: `"${paramName}": неверный формат HEX цвета`,
						messageIt: `"${paramName}": formato HEX colore non valido`,
					})
				}
			}
		}

		// 5. Валидация TEXT параметров
		if (catParam.parameter.type === 'TEXT') {
			const textValue = String(value || '')

			// Проверка минимальной длины (если задано в description)
			if (textValue.length === 0) {
				errors.push({
					field: catParam.parameter.id,
					message: `"${paramName}" не может быть пустым`,
					messageIt: `"${paramName}" non può essere vuoto`,
				})
			}
		}
	}

	return {
		valid: errors.length === 0,
		errors,
	}
}

/**
 * Форматирование ошибок для отображения пользователю
 */
export function formatValidationErrors(
	errors: ValidationError[],
	locale: 'ru' | 'it' = 'it'
): string {
	return errors
		.map(err => (locale === 'it' ? err.messageIt : err.message))
		.join('\n')
}
