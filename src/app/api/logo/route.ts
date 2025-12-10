import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiError, json, withApiHandler } from '@/lib/api-handler'
import { ensureOrganization } from '@/app/api/organization/helpers'
import { validateLogoBuffer } from '@/lib/logo-validation'
import {
	saveLogoFile,
	cleanupOldLogos,
	optimizeLogoStorage,
} from '@/lib/logo-storage'
import { createRateLimitMiddleware, RATE_LIMITS } from '@/lib/rate-limiter'
import { logger } from '@/lib/logger'

const uploadLimiter = createRateLimitMiddleware(RATE_LIMITS.LOGO_UPLOAD)
const deleteLimiter = createRateLimitMiddleware(RATE_LIMITS.LOGO_DELETE)

function rateLimitResponse(limitCheck: ReturnType<typeof uploadLimiter>, limit: number) {
	return json(
		{
			error: `Слишком много запросов. Попробуйте через ${limitCheck.retryAfter} сек.`,
			retryAfter: limitCheck.retryAfter,
		},
		{
			status: 429,
			headers: {
				'Retry-After': String(limitCheck.retryAfter || 60),
				'X-RateLimit-Limit': String(limit),
				'X-RateLimit-Remaining': String(limitCheck.remaining),
				'X-RateLimit-Reset': String(Math.ceil(limitCheck.resetAt / 1000)),
			},
		}
	)
}

export const POST = withApiHandler(async (request: NextRequest) => {
	const limitCheck = uploadLimiter(request)
	if (!limitCheck.allowed) {
		return rateLimitResponse(limitCheck, RATE_LIMITS.LOGO_UPLOAD.maxRequests)
	}

	const formData = await request.formData()
	const file = formData.get('file')

	if (!(file instanceof File)) {
		throw new ApiError(400, 'Файл не предоставлен')
	}

	const buffer = Buffer.from(await file.arrayBuffer())
	const validation = await validateLogoBuffer(buffer, file.type, file.name)

	if (!validation.valid) {
		throw new ApiError(400, validation.error || 'Файл не прошел валидацию')
	}

	const saveResult = await saveLogoFile(buffer, file.name)
	if (!saveResult.success) {
		throw new ApiError(500, saveResult.error || 'Не удалось сохранить файл')
	}

	const cleanup = await optimizeLogoStorage(1)
	logger.info(
		`Очистка логотипов завершена: сохранено ${cleanup.kept}, удалено ${cleanup.deleted}`
	)

	try {
		const organization = await ensureOrganization()
		await prisma.organization.update({
			where: { id: organization.id },
			data: { logoUrl: saveResult.path },
		})
		logger.info(`✅ Logo path saved to database: ${saveResult.path}`)
	} catch (error) {
		logger.error('⚠️ Failed to save logo to database:', error)
	}

	return json(
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
				'X-RateLimit-Remaining': String(limitCheck.remaining),
			},
		}
	)
})

export const DELETE = withApiHandler(async (request: NextRequest) => {
	const limitCheck = deleteLimiter(request)
	if (!limitCheck.allowed) {
		return rateLimitResponse(limitCheck, RATE_LIMITS.LOGO_DELETE.maxRequests)
	}

	const cleanup = await cleanupOldLogos()
	logger.info(`Удалено ${cleanup.deleted} логотипов, ошибок: ${cleanup.errors}`)

	try {
		const organization = await ensureOrganization()
		await prisma.organization.update({
			where: { id: organization.id },
			data: { logoUrl: null },
		})
		logger.info('✅ Logo path removed from database')
	} catch (error) {
		logger.error('⚠️ Failed to remove logo from database:', error)
	}

	return json(
		{
			success: true,
			message: 'Логотип удален',
			deleted: cleanup.deleted,
			errors: cleanup.errors,
		},
		{
			headers: {
				'X-RateLimit-Limit': String(RATE_LIMITS.LOGO_DELETE.maxRequests),
				'X-RateLimit-Remaining': String(limitCheck.remaining),
			},
		}
	)
})
