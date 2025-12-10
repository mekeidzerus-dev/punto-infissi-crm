import { NextRequest } from 'next/server'
import { ApiError, json, withApiHandler } from '@/lib/api-handler'
import { validateFaviconBuffer } from '@/lib/favicon-validation'
import {
	saveFaviconFile,
	cleanupOldFavicons,
	optimizeFaviconStorage,
} from '@/lib/favicon-storage'
import { createRateLimitMiddleware, RATE_LIMITS } from '@/lib/rate-limiter'
import { logger } from '@/lib/logger'

async function ensureRateLimit(
	request: NextRequest,
	limit: (typeof RATE_LIMITS)[keyof typeof RATE_LIMITS]
) {
	const rateLimitCheck = createRateLimitMiddleware(limit)(request)

	if (!rateLimitCheck.allowed) {
		throw new ApiError(
			429,
			`Слишком много запросов. Попробуйте через ${rateLimitCheck.retryAfter} сек.`,
			{
				retryAfter: rateLimitCheck.retryAfter,
				limit: limit.maxRequests,
				remaining: rateLimitCheck.remaining,
			}
		)
	}

	return rateLimitCheck
}

export const POST = withApiHandler(async (request: NextRequest) => {
	const rateLimitCheck = await ensureRateLimit(
		request,
		RATE_LIMITS.FAVICON_UPLOAD
	)

	const contentType = request.headers.get('content-type') ?? ''
	if (!contentType.toLowerCase().startsWith('multipart/form-data')) {
		throw new ApiError(400, 'Ожидается multipart/form-data запрос')
	}

	let formData: FormData
	try {
		formData = await request.formData()
	} catch (error) {
		throw new ApiError(400, 'Не удалось прочитать multipart/form-data', {
			cause: 'invalid_multipart',
		})
	}
	const file = formData.get('file') as File | null

	if (!file) {
		throw new ApiError(400, 'Файл не предоставлен')
	}

	const bytes = await file.arrayBuffer()
	const buffer = Buffer.from(bytes)

	const validation = await validateFaviconBuffer(buffer, file.type, file.name)
	if (!validation.valid) {
		throw new ApiError(400, validation.error ?? 'Файл не прошел валидацию')
	}

	const saveResult = await saveFaviconFile(buffer, file.name)
	if (!saveResult.success) {
		throw new ApiError(500, saveResult.error ?? 'Не удалось сохранить файл')
	}

	const cleanup = await optimizeFaviconStorage(3)
	logger.info(
		`Очистка фавиконов завершена: сохранено ${cleanup.kept}, удалено ${cleanup.deleted}`
	)

	return json(
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
})

export const DELETE = withApiHandler(async (request: NextRequest) => {
	const rateLimitCheck = await ensureRateLimit(
		request,
		RATE_LIMITS.FAVICON_DELETE
	)

	const cleanup = await cleanupOldFavicons()
	logger.info(`Удалено ${cleanup.deleted} фавиконов, ошибок: ${cleanup.errors}`)

	return json(
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
})
