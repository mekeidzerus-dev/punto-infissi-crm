import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'
import sharp from 'sharp'
import { logger } from '@/lib/logger'

export interface LogoStorageResult {
	success: boolean
	path?: string
	error?: string
	metadata?: {
		hash: string
		fileName: string
		optimizedSize?: number
	}
}

export interface CleanupResult {
	deleted: number
	kept: number
	errors: number
}

// Путь к директории для логотипов
const LOGO_DIR = path.join(process.cwd(), 'public', 'logos')

// Создаем директорию если её нет
async function ensureLogoDirectory() {
	try {
		await fs.mkdir(LOGO_DIR, { recursive: true })
	} catch (error) {
		logger.error('Ошибка создания директории логотипов:', error)
	}
}

// Генерация имени файла с хешем
function generateLogoFileName(buffer: Buffer, originalName: string): string {
	const hash = crypto.createHash('md5').update(buffer).digest('hex').slice(0, 8)
	const ext = path.extname(originalName).toLowerCase()

	// Определяем формат по содержимому
	let format = ext
	if (ext === '.jpg') format = '.jpeg'
	if (ext === '.svg') format = '.svg'

	return `logo-${hash}${format}`
}

export async function saveLogoFile(
	buffer: Buffer,
	originalName: string
): Promise<LogoStorageResult> {
	try {
		await ensureLogoDirectory()

		const fileName = generateLogoFileName(buffer, originalName)
		const filePath = path.join(LOGO_DIR, fileName)
		const publicPath = `/logos/${fileName}`

		// Проверяем, существует ли уже такой файл
		try {
			await fs.access(filePath)
			// Файл уже существует, возвращаем его путь
			return {
				success: true,
				path: publicPath,
				metadata: {
					hash: fileName.split('-')[1].split('.')[0],
					fileName,
				},
			}
		} catch {
			// Файл не существует, создаем новый
		}

		// Оптимизируем изображение для веба (если это не SVG)
		let optimizedBuffer = buffer
		let optimizedSize = buffer.length

		if (!originalName.toLowerCase().endsWith('.svg')) {
			try {
				optimizedBuffer = await sharp(buffer)
					.resize(350, 100, {
						fit: 'inside',
						withoutEnlargement: true,
						background: { r: 255, g: 255, b: 255, alpha: 0 },
					})
					.png({ quality: 90, compressionLevel: 6 })
					.toBuffer()

				optimizedSize = optimizedBuffer.length
				logger.info(
					`Логотип оптимизирован: ${buffer.length} → ${optimizedSize} байт`
				)
			} catch (error) {
				logger.warn(
					'Не удалось оптимизировать логотип, используем оригинал:',
					error
				)
			}
		}

		// Сохраняем файл
		await fs.writeFile(filePath, optimizedBuffer)

		logger.info(`✅ Логотип сохранен: ${fileName}`)

		return {
			success: true,
			path: publicPath,
			metadata: {
				hash: fileName.split('-')[1].split('.')[0],
				fileName,
				optimizedSize,
			},
		}
	} catch (error) {
		logger.error('Ошибка сохранения логотипа:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Неизвестная ошибка',
		}
	}
}

export async function cleanupOldLogos(): Promise<CleanupResult> {
	try {
		await ensureLogoDirectory()

		const files = await fs.readdir(LOGO_DIR)
		const logoFiles = files.filter(file => file.startsWith('logo-'))

		let deleted = 0
		let errors = 0

		for (const file of logoFiles) {
			try {
				const filePath = path.join(LOGO_DIR, file)
				await fs.unlink(filePath)
				deleted++
				logger.info(`🗑️ Удален старый логотип: ${file}`)
			} catch (error) {
				logger.error(`Ошибка удаления ${file}:`, error)
				errors++
			}
		}

		return {
			deleted,
			kept: 0,
			errors,
		}
	} catch (error) {
		logger.error('Ошибка очистки логотипов:', error)
		return {
			deleted: 0,
			kept: 0,
			errors: 1,
		}
	}
}

export async function optimizeLogoStorage(
	maxVersions: number
): Promise<CleanupResult> {
	try {
		await ensureLogoDirectory()

		const files = await fs.readdir(LOGO_DIR)
		const logoFiles = files.filter(file => file.startsWith('logo-'))

		if (logoFiles.length <= maxVersions) {
			return {
				deleted: 0,
				kept: logoFiles.length,
				errors: 0,
			}
		}

		// Сортируем файлы по дате изменения (новые первые)
		const filesWithStats = await Promise.all(
			logoFiles.map(async file => {
				const filePath = path.join(LOGO_DIR, file)
				const stats = await fs.stat(filePath)
				return { file, mtime: stats.mtime }
			})
		)

		filesWithStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime())

		// Удаляем старые файлы
		const filesToDelete = filesWithStats.slice(maxVersions)
		let deleted = 0
		let errors = 0

		for (const { file } of filesToDelete) {
			try {
				const filePath = path.join(LOGO_DIR, file)
				await fs.unlink(filePath)
				deleted++
				logger.info(`🗑️ Удален старый логотип: ${file}`)
			} catch (error) {
				logger.error(`Ошибка удаления ${file}:`, error)
				errors++
			}
		}

		return {
			deleted,
			kept: maxVersions,
			errors,
		}
	} catch (error) {
		logger.error('Ошибка оптимизации хранения логотипов:', error)
		return {
			deleted: 0,
			kept: 0,
			errors: 1,
		}
	}
}

// Функция для получения текущего логотипа
export async function getCurrentLogo(): Promise<string | null> {
	try {
		await ensureLogoDirectory()

		const files = await fs.readdir(LOGO_DIR)
		const logoFiles = files.filter(file => file.startsWith('logo-'))

		if (logoFiles.length === 0) {
			return null
		}

		// Возвращаем самый новый файл
		const filesWithStats = await Promise.all(
			logoFiles.map(async file => {
				const filePath = path.join(LOGO_DIR, file)
				const stats = await fs.stat(filePath)
				return { file, mtime: stats.mtime }
			})
		)

		filesWithStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
		return `/logos/${filesWithStats[0].file}`
	} catch (error) {
		logger.error('Ошибка получения текущего логотипа:', error)
		return null
	}
}

// Функция для генерации логотипа для печати (высокое качество)
export async function generatePrintLogo(buffer: Buffer): Promise<Buffer> {
	try {
		return await sharp(buffer)
			.resize(350, 100, {
				fit: 'inside',
				withoutEnlargement: true,
				background: { r: 255, g: 255, b: 255, alpha: 1 }, // Белый фон для печати
			})
			.png({ quality: 100, compressionLevel: 0 })
			.toBuffer()
	} catch (error) {
		logger.error('Ошибка генерации логотипа для печати:', error)
		throw error
	}
}
