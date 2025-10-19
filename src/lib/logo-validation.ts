import sharp from 'sharp'

export interface LogoValidationResult {
	valid: boolean
	error?: string
	metadata?: {
		width: number
		height: number
		format: string
		size: number
		aspectRatio: number
	}
}

// Конфигурация логотипа
export const LOGO_CONFIG = {
	// Максимальные размеры
	MAX_WIDTH: 350,
	MAX_HEIGHT: 100,

	// Минимальные размеры
	MIN_WIDTH: 50,
	MIN_HEIGHT: 20,

	// Максимальный размер файла (2MB)
	MAX_FILE_SIZE: 2 * 1024 * 1024,

	// Поддерживаемые форматы
	ALLOWED_TYPES: [
		'image/png',
		'image/jpeg',
		'image/jpg',
		'image/webp',
		'image/svg+xml',
	],

	// Рекомендуемые форматы для печати
	PRINT_FRIENDLY_FORMATS: ['image/png', 'image/svg+xml'],
}

export async function validateLogoBuffer(
	buffer: Buffer,
	mimeType: string,
	fileName: string
): Promise<LogoValidationResult> {
	try {
		// 1. Проверка размера файла
		if (buffer.length > LOGO_CONFIG.MAX_FILE_SIZE) {
			return {
				valid: false,
				error: `Файл слишком большой. Максимальный размер: ${
					LOGO_CONFIG.MAX_FILE_SIZE / 1024 / 1024
				}MB`,
			}
		}

		// 2. Проверка типа файла
		if (!LOGO_CONFIG.ALLOWED_TYPES.includes(mimeType)) {
			return {
				valid: false,
				error: `Неподдерживаемый формат. Разрешены: ${LOGO_CONFIG.ALLOWED_TYPES.join(
					', '
				)}`,
			}
		}

		// 3. Для SVG файлов - базовая проверка
		if (mimeType === 'image/svg+xml') {
			const svgContent = buffer.toString('utf-8')

			// Проверка на базовую SVG структуру
			if (!svgContent.includes('<svg') || !svgContent.includes('</svg>')) {
				return {
					valid: false,
					error: 'Неверный SVG файл',
				}
			}

			// Проверка на потенциально опасные элементы
			const dangerousElements = ['<script', '<iframe', '<object', '<embed']
			if (dangerousElements.some(el => svgContent.toLowerCase().includes(el))) {
				return {
					valid: false,
					error: 'SVG содержит потенциально опасные элементы',
				}
			}

			// Для SVG возвращаем базовые метаданные
			return {
				valid: true,
				metadata: {
					width: LOGO_CONFIG.MAX_WIDTH,
					height: LOGO_CONFIG.MAX_HEIGHT,
					format: 'svg',
					size: buffer.length,
					aspectRatio: LOGO_CONFIG.MAX_WIDTH / LOGO_CONFIG.MAX_HEIGHT,
				},
			}
		}

		// 4. Анализ изображения с помощью Sharp
		const metadata = await sharp(buffer).metadata()

		if (!metadata.width || !metadata.height) {
			return {
				valid: false,
				error: 'Не удалось определить размеры изображения',
			}
		}

		// 5. Проверка размеров
		if (
			metadata.width > LOGO_CONFIG.MAX_WIDTH ||
			metadata.height > LOGO_CONFIG.MAX_HEIGHT
		) {
			return {
				valid: false,
				error: `Изображение слишком большое. Максимум: ${LOGO_CONFIG.MAX_WIDTH}x${LOGO_CONFIG.MAX_HEIGHT}px`,
			}
		}

		if (
			metadata.width < LOGO_CONFIG.MIN_WIDTH ||
			metadata.height < LOGO_CONFIG.MIN_HEIGHT
		) {
			return {
				valid: false,
				error: `Изображение слишком маленькое. Минимум: ${LOGO_CONFIG.MIN_WIDTH}x${LOGO_CONFIG.MIN_HEIGHT}px`,
			}
		}

		// 6. Проверка соотношения сторон (рекомендация)
		const aspectRatio = metadata.width / metadata.height
		const recommendedRatio = LOGO_CONFIG.MAX_WIDTH / LOGO_CONFIG.MAX_HEIGHT // 3.5:1

		// Предупреждение о соотношении сторон, но не блокируем
		if (aspectRatio > 5 || aspectRatio < 0.5) {
			console.warn(
				`Логотип имеет необычное соотношение сторон: ${aspectRatio.toFixed(
					2
				)}:1`
			)
		}

		// 7. Проверка качества для печати
		const isPrintFriendly =
			LOGO_CONFIG.PRINT_FRIENDLY_FORMATS.includes(mimeType)

		return {
			valid: true,
			metadata: {
				width: metadata.width,
				height: metadata.height,
				format: metadata.format || 'unknown',
				size: buffer.length,
				aspectRatio,
				isPrintFriendly,
			},
		}
	} catch (error) {
		console.error('Ошибка валидации логотипа:', error)
		return {
			valid: false,
			error: 'Ошибка при обработке файла изображения',
		}
	}
}

// Дополнительная функция для оптимизации логотипа
export async function optimizeLogoForPrint(buffer: Buffer): Promise<Buffer> {
	try {
		// Конвертируем в PNG для лучшей печати
		return await sharp(buffer)
			.png({ quality: 100, compressionLevel: 0 })
			.resize(LOGO_CONFIG.MAX_WIDTH, LOGO_CONFIG.MAX_HEIGHT, {
				fit: 'inside',
				withoutEnlargement: true,
				background: { r: 255, g: 255, b: 255, alpha: 0 }, // Прозрачный фон
			})
			.toBuffer()
	} catch (error) {
		console.error('Ошибка оптимизации логотипа:', error)
		throw new Error('Не удалось оптимизировать логотип для печати')
	}
}
