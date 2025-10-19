import { NextRequest, NextResponse } from 'next/server'
import { validateLogoBuffer } from '@/lib/logo-validation'
import {
	saveLogoFile,
	cleanupOldLogos,
	optimizeLogoStorage,
} from '@/lib/logo-storage'
import { createRateLimitMiddleware, RATE_LIMITS } from '@/lib/rate-limiter'

export async function POST(request: NextRequest) {
	try {
		// 1. Rate Limiting
		const rateLimitCheck = createRateLimitMiddleware(RATE_LIMITS.LOGO_UPLOAD)(
			request
		)

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
						'X-RateLimit-Limit': String(RATE_LIMITS.LOGO_UPLOAD.maxRequests),
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
		const validation = await validateLogoBuffer(buffer, file.type, file.name)

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
		const saveResult = await saveLogoFile(buffer, file.name)

		if (!saveResult.success) {
			return NextResponse.json(
				{
					error: saveResult.error || 'Не удалось сохранить файл',
				},
				{ status: 500 }
			)
		}

		// 6. Очистка старых файлов
		const cleanup = await optimizeLogoStorage(1) // Оставляем только последний логотип
		console.log(
			`Очистка логотипов завершена: сохранено ${cleanup.kept}, удалено ${cleanup.deleted}`
		)

		// 7. Возврат результата
		return NextResponse.json(
			{
				success: true,
				path: saveResult.path,
				message: 'Логотип успешно загружен',
				metadata: {
					...validation.metadata,
					hash: saveResult.metadata?.hash,
					fileName: saveResult.metadata?.fileName,
				},
			},
			{
				headers: {
					'X-RateLimit-Limit': String(RATE_LIMITS.LOGO_UPLOAD.maxRequests),
					'X-RateLimit-Remaining': String(rateLimitCheck.remaining),
				},
			}
		)
	} catch (error) {
		console.error('Ошибка загрузки логотипа:', error)
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
		const rateLimitCheck = createRateLimitMiddleware(RATE_LIMITS.LOGO_DELETE)(
			request
		)

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

		// 2. Удаление всех логотипов
		const cleanup = await cleanupOldLogos()

		console.log(
			`Удалено ${cleanup.deleted} логотипов, ошибок: ${cleanup.errors}`
		)

		return NextResponse.json(
			{
				success: true,
				message: 'Логотип удален',
				deleted: cleanup.deleted,
				errors: cleanup.errors,
			},
			{
				headers: {
					'X-RateLimit-Limit': String(RATE_LIMITS.LOGO_DELETE.maxRequests),
					'X-RateLimit-Remaining': String(rateLimitCheck.remaining),
				},
			}
		)
	} catch (error) {
		console.error('Ошибка удаления логотипа:', error)
		return NextResponse.json(
			{
				error: 'Внутренняя ошибка сервера',
				details: error instanceof Error ? error.message : 'Неизвестная ошибка',
			},
			{ status: 500 }
		)
	}
}
