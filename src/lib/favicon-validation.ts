import sharp from 'sharp'

export const FAVICON_CONFIG = {
	MAX_FILE_SIZE: 2 * 1024 * 1024, // 2MB
	ALLOWED_MIME_TYPES: [
		'image/png',
		'image/x-icon',
		'image/vnd.microsoft.icon',
		'image/svg+xml',
	],
	ALLOWED_EXTENSIONS: ['png', 'ico', 'svg'],
	RECOMMENDED_SIZES: [16, 32, 64, 128, 256],
	MIN_SIZE: 16,
	MAX_SIZE: 512,
} as const

export interface ValidationResult {
	valid: boolean
	error?: string
	metadata?: {
		width: number
		height: number
		format: string
		size: number
	}
}

export async function validateFaviconFile(
	file: File
): Promise<ValidationResult> {
	// 1. Проверка размера файла
	if (file.size > FAVICON_CONFIG.MAX_FILE_SIZE) {
		return {
			valid: false,
			error: `Файл слишком большой. Максимальный размер: ${
				FAVICON_CONFIG.MAX_FILE_SIZE / 1024 / 1024
			}MB`,
		}
	}

	if (file.size === 0) {
		return {
			valid: false,
			error: 'Файл пустой',
		}
	}

	// 2. Проверка MIME типа
	if (!FAVICON_CONFIG.ALLOWED_MIME_TYPES.includes(file.type)) {
		return {
			valid: false,
			error: `Неподдерживаемый формат. Разрешены: ${FAVICON_CONFIG.ALLOWED_EXTENSIONS.join(
				', '
			)}`,
		}
	}

	// 3. Проверка расширения
	const extension = file.name.split('.').pop()?.toLowerCase()
	if (!extension || !FAVICON_CONFIG.ALLOWED_EXTENSIONS.includes(extension)) {
		return {
			valid: false,
			error: `Неверное расширение файла. Разрешены: ${FAVICON_CONFIG.ALLOWED_EXTENSIONS.join(
				', '
			)}`,
		}
	}

	// 4. Для SVG - проверяем только размер и тип
	if (extension === 'svg') {
		return {
			valid: true,
			metadata: {
				width: 0,
				height: 0,
				format: 'svg',
				size: file.size,
			},
		}
	}

	// 5. Для растровых изображений - проверяем dimensions через sharp
	try {
		const buffer = Buffer.from(await file.arrayBuffer())
		const metadata = await sharp(buffer).metadata()

		if (!metadata.width || !metadata.height) {
			return {
				valid: false,
				error: 'Не удалось определить размеры изображения',
			}
		}

		// Проверка минимального размера
		if (
			metadata.width < FAVICON_CONFIG.MIN_SIZE ||
			metadata.height < FAVICON_CONFIG.MIN_SIZE
		) {
			return {
				valid: false,
				error: `Изображение слишком маленькое. Минимум: ${FAVICON_CONFIG.MIN_SIZE}x${FAVICON_CONFIG.MIN_SIZE}px`,
			}
		}

		// Проверка максимального размера
		if (
			metadata.width > FAVICON_CONFIG.MAX_SIZE ||
			metadata.height > FAVICON_CONFIG.MAX_SIZE
		) {
			return {
				valid: false,
				error: `Изображение слишком большое. Максимум: ${FAVICON_CONFIG.MAX_SIZE}x${FAVICON_CONFIG.MAX_SIZE}px`,
			}
		}

		// Рекомендация квадратного формата
		if (metadata.width !== metadata.height) {
			console.warn(
				`Фавикон не квадратный (${metadata.width}x${metadata.height}). Рекомендуется квадратный формат.`
			)
		}

		return {
			valid: true,
			metadata: {
				width: metadata.width,
				height: metadata.height,
				format: metadata.format || extension,
				size: file.size,
			},
		}
	} catch (error) {
		return {
			valid: false,
			error: 'Не удалось обработать изображение. Возможно, файл поврежден.',
		}
	}
}

export async function validateFaviconBuffer(
	buffer: Buffer,
	mimeType: string,
	fileName: string
): Promise<ValidationResult> {
	// 1. Проверка размера
	if (buffer.length > FAVICON_CONFIG.MAX_FILE_SIZE) {
		return {
			valid: false,
			error: `Файл слишком большой. Максимальный размер: ${
				FAVICON_CONFIG.MAX_FILE_SIZE / 1024 / 1024
			}MB`,
		}
	}

	// 2. Проверка MIME типа
	if (!FAVICON_CONFIG.ALLOWED_MIME_TYPES.includes(mimeType)) {
		return {
			valid: false,
			error: `Неподдерживаемый формат. Разрешены: ${FAVICON_CONFIG.ALLOWED_EXTENSIONS.join(
				', '
			)}`,
		}
	}

	// 3. Проверка расширения
	const extension = fileName.split('.').pop()?.toLowerCase()
	if (!extension || !FAVICON_CONFIG.ALLOWED_EXTENSIONS.includes(extension)) {
		return {
			valid: false,
			error: `Неверное расширение файла. Разрешены: ${FAVICON_CONFIG.ALLOWED_EXTENSIONS.join(
				', '
			)}`,
		}
	}

	// 4. Для SVG - проверяем только размер
	if (extension === 'svg') {
		return {
			valid: true,
			metadata: {
				width: 0,
				height: 0,
				format: 'svg',
				size: buffer.length,
			},
		}
	}

	// 5. Проверка dimensions через sharp
	try {
		const metadata = await sharp(buffer).metadata()

		if (!metadata.width || !metadata.height) {
			return {
				valid: false,
				error: 'Не удалось определить размеры изображения',
			}
		}

		if (
			metadata.width < FAVICON_CONFIG.MIN_SIZE ||
			metadata.height < FAVICON_CONFIG.MIN_SIZE
		) {
			return {
				valid: false,
				error: `Изображение слишком маленькое. Минимум: ${FAVICON_CONFIG.MIN_SIZE}x${FAVICON_CONFIG.MIN_SIZE}px`,
			}
		}

		if (
			metadata.width > FAVICON_CONFIG.MAX_SIZE ||
			metadata.height > FAVICON_CONFIG.MAX_SIZE
		) {
			return {
				valid: false,
				error: `Изображение слишком большое. Максимум: ${FAVICON_CONFIG.MAX_SIZE}x${FAVICON_CONFIG.MAX_SIZE}px`,
			}
		}

		return {
			valid: true,
			metadata: {
				width: metadata.width,
				height: metadata.height,
				format: metadata.format || extension,
				size: buffer.length,
			},
		}
	} catch (error) {
		return {
			valid: false,
			error: 'Не удалось обработать изображение. Возможно, файл поврежден.',
		}
	}
}


