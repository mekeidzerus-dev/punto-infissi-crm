import { NextRequest, NextResponse } from 'next/server'
import { validateFaviconBuffer } from '@/lib/favicon-validation'
import {
	saveFaviconFile,
	cleanupOldFavicons,
	optimizeFaviconStorage,
} from '@/lib/favicon-storage'
import { createRateLimitMiddleware, RATE_LIMITS } from '@/lib/rate-limiter'

export async function POST(request: NextRequest) {
	try {
		// 1. Rate Limiting
		const rateLimitCheck = createRateLimitMiddleware(
			RATE_LIMITS.FAVICON_UPLOAD
		)(request)

		if (!rateLimitCheck.allowed) {
			return NextResponse.json(
				{
					error: `Слишком много запросов. Попробуйте через ${rateLimitCheck.retryAfter} сек.`,
					retryAfter: rateLimitCheck.retryAfter,
				},
				{
					status: 429,
					headers: {
						'Retry-After': String(rateLimitCheck.retryAfter || 60),
						'X-RateLimit-Limit': String(RATE_LIMITS.FAVICON_UPLOAD.maxRequests),
						'X-RateLimit-Remaining': String(rateLimitCheck.remaining),
						'X-RateLimit-Reset': String(
							Math.ceil(rateLimitCheck.resetAt / 1000)
						),
					},
				}
			)
		}

		// 2. Получение файла
		const formData = await request.formData()
		const file = formData.get('file') as File

		if (!file) {
			return NextResponse.json(
				{ error: 'Файл не предоставлен' },
				{ status: 400 }
			)
		}

		// 3. Конвертация в Buffer
		const bytes = await file.arrayBuffer()
		const buffer = Buffer.from(bytes)

		// 4. Валидация файла
		const validation = await validateFaviconBuffer(buffer, file.type, file.name)

		if (!validation.valid) {
			return NextResponse.json(
				{
					error: validation.error || 'Файл не прошел валидацию',
					details: validation.error,
				},
				{ status: 400 }
			)
		}

		// 5. Сохранение файла с хешем
		const saveResult = await saveFaviconFile(buffer, file.name)

		if (!saveResult.success) {
			return NextResponse.json(
				{
					error: saveResult.error || 'Не удалось сохранить файл',
				},
				{ status: 500 }
			)
		}

		// 6. Очистка старых файлов (опционально, можно настроить)
		// Оставляем только последние 3 версии
		const cleanup = await optimizeFaviconStorage(3)
		console.log(
			`Очистка завершена: сохранено ${cleanup.kept}, удалено ${cleanup.deleted}`
		)

		// 7. Возврат результата
		return NextResponse.json(
			{
				success: true,
				path: saveResult.path,
				message: 'Фавикон успешно загружен',
				metadata: {
					...validation.metadata,
					hash: saveResult.metadata?.hash,
					fileName: saveResult.metadata?.fileName,
				},
			},
			{
				headers: {
					'X-RateLimit-Limit': String(RATE_LIMITS.FAVICON_UPLOAD.maxRequests),
					'X-RateLimit-Remaining': String(rateLimitCheck.remaining),
				},
			}
		)
	} catch (error) {
		console.error('Ошибка загрузки фавикона:', error)
		return NextResponse.json(
			{
				error: 'Внутренняя ошибка сервера',
				details: error instanceof Error ? error.message : 'Неизвестная ошибка',
			},
			{ status: 500 }
		)
	}
}

export async function DELETE(request: NextRequest) {
	try {
		// 1. Rate Limiting
		const rateLimitCheck = createRateLimitMiddleware(
			RATE_LIMITS.FAVICON_DELETE
		)(request)

		if (!rateLimitCheck.allowed) {
			return NextResponse.json(
				{
					error: `Слишком много запросов. Попробуйте через ${rateLimitCheck.retryAfter} сек.`,
					retryAfter: rateLimitCheck.retryAfter,
				},
				{
					status: 429,
					headers: {
						'Retry-After': String(rateLimitCheck.retryAfter || 60),
					},
				}
			)
		}

		// 2. Удаление всех файлов фавиконов (с версионированием)
		const cleanup = await cleanupOldFavicons()

		console.log(
			`Удалено ${cleanup.deleted} фавиконов, ошибок: ${cleanup.errors}`
		)

		return NextResponse.json(
			{
				success: true,
				message: 'Все фавиконы удалены',
				deleted: cleanup.deleted,
				errors: cleanup.errors,
			},
			{
				headers: {
					'X-RateLimit-Limit': String(RATE_LIMITS.FAVICON_DELETE.maxRequests),
					'X-RateLimit-Remaining': String(rateLimitCheck.remaining),
				},
			}
		)
	} catch (error) {
		console.error('Ошибка удаления фавикона:', error)
		return NextResponse.json(
			{
				error: 'Внутренняя ошибка сервера',
				details: error instanceof Error ? error.message : 'Неизвестная ошибка',
			},
			{ status: 500 }
		)
	}
}
