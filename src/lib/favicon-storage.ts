import { createHash } from 'crypto'
import { writeFile, unlink, readdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { logger } from '@/lib/logger'

export interface StorageResult {
	success: boolean
	path?: string
	error?: string
	metadata?: {
		hash: string
		fileName: string
		size: number
	}
}

/**
 * Генерирует хеш файла для версионирования
 */
export function generateFileHash(buffer: Buffer): string {
	return createHash('md5').update(buffer).digest('hex').slice(0, 12)
}

/**
 * Сохраняет файл фавикона с хешем в имени
 */
export async function saveFaviconFile(
	buffer: Buffer,
	originalFileName: string
): Promise<StorageResult> {
	try {
		const hash = generateFileHash(buffer)
		const ext = originalFileName.split('.').pop()?.toLowerCase() || 'png'
		const fileName = `favicon-${hash}.${ext}`
		const publicPath = join(process.cwd(), 'public', fileName)

		// Проверяем, не существует ли уже файл с таким хешем
		if (existsSync(publicPath)) {
			logger.info(`Файл с хешем ${hash} уже существует, используем его`)
			return {
				success: true,
				path: `/${fileName}`,
				metadata: {
					hash,
					fileName,
					size: buffer.length,
				},
			}
		}

		// Сохраняем файл
		await writeFile(publicPath, buffer)

		logger.info(`Фавикон сохранен: ${fileName} (hash: ${hash})`)

		return {
			success: true,
			path: `/${fileName}`,
			metadata: {
				hash,
				fileName,
				size: buffer.length,
			},
		}
	} catch (error) {
		logger.error('Ошибка сохранения фавикона:', error)
		return {
			success: false,
			error: 'Не удалось сохранить файл на сервере',
		}
	}
}

/**
 * Удаляет старые файлы фавиконов (кроме текущего)
 */
export async function cleanupOldFavicons(
	currentFileName?: string
): Promise<{ deleted: number; errors: number }> {
	try {
		const publicPath = join(process.cwd(), 'public')
		const files = await readdir(publicPath)

		// Находим все файлы фавиконов
		const faviconFiles = files.filter(
			file =>
				file.startsWith('favicon-') &&
				(file.endsWith('.png') ||
					file.endsWith('.ico') ||
					file.endsWith('.svg'))
		)

		let deleted = 0
		let errors = 0

		for (const file of faviconFiles) {
			// Не удаляем текущий файл
			if (currentFileName && file === currentFileName) {
				continue
			}

			try {
				await unlink(join(publicPath, file))
				deleted++
				logger.info(`Удален старый фавикон: ${file}`)
			} catch (error) {
				errors++
				logger.error(`Ошибка удаления ${file}:`, error)
			}
		}

		return { deleted, errors }
	} catch (error) {
		logger.error('Ошибка очистки старых фавиконов:', error)
		return { deleted: 0, errors: 1 }
	}
}

/**
 * Удаляет конкретный файл фавикона
 */
export async function deleteFaviconFile(
	fileName: string
): Promise<{ success: boolean; error?: string }> {
	try {
		const filePath = join(process.cwd(), 'public', fileName)

		if (!existsSync(filePath)) {
			return {
				success: false,
				error: 'Файл не найден',
			}
		}

		await unlink(filePath)
		logger.info(`Фавикон удален: ${fileName}`)

		return { success: true }
	} catch (error) {
		logger.error('Ошибка удаления фавикона:', error)
		return {
			success: false,
			error: 'Не удалось удалить файл',
		}
	}
}

/**
 * Получает список всех фавиконов в public/
 */
export async function listFaviconFiles(): Promise<string[]> {
	try {
		const publicPath = join(process.cwd(), 'public')
		const files = await readdir(publicPath)

		return files.filter(
			file =>
				file.startsWith('favicon-') &&
				(file.endsWith('.png') ||
					file.endsWith('.ico') ||
					file.endsWith('.svg'))
		)
	} catch (error) {
		logger.error('Ошибка получения списка фавиконов:', error)
		return []
	}
}

/**
 * Оптимизирует хранение: оставляет только N последних файлов
 */
export async function optimizeFaviconStorage(
	keepCount: number = 5
): Promise<{ kept: number; deleted: number }> {
	try {
		const publicPath = join(process.cwd(), 'public')
		const files = await readdir(publicPath)

		// Находим все файлы фавиконов с их временем создания
		const faviconFiles = await Promise.all(
			files
				.filter(
					file =>
						file.startsWith('favicon-') &&
						(file.endsWith('.png') ||
							file.endsWith('.ico') ||
							file.endsWith('.svg'))
				)
				.map(async file => {
					const stats = await import('fs').then(fs =>
						fs.promises.stat(join(publicPath, file))
					)
					return {
						name: file,
						mtime: stats.mtime.getTime(),
					}
				})
		)

		// Сортируем по времени (новые первые)
		faviconFiles.sort((a, b) => b.mtime - a.mtime)

		// Оставляем только keepCount последних
		const toDelete = faviconFiles.slice(keepCount)
		let deleted = 0

		for (const file of toDelete) {
			try {
				await unlink(join(publicPath, file.name))
				deleted++
				logger.info(`Удален старый фавикон при оптимизации: ${file.name}`)
			} catch (error) {
				logger.error(`Ошибка удаления ${file.name}:`, error)
			}
		}

		return {
			kept: Math.min(faviconFiles.length, keepCount),
			deleted,
		}
	} catch (error) {
		logger.error('Ошибка оптимизации хранилища:', error)
		return { kept: 0, deleted: 0 }
	}
}


