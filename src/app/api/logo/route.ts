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

		// 7. Сохранение пути в базу данных
		try {
			const { prisma } = await import('@/lib/prisma')
			
			// Получаем или создаем организацию
			const existing = await prisma.organization.findFirst()
			
			if (existing) {
				await prisma.organization.update({
					where: { id: existing.id },
					data: { logoUrl: saveResult.path },
				})
				console.log('✅ Logo path saved to database:', saveResult.path)
			} else {
				await prisma.organization.create({
					data: {
						name: 'PUNTO INFISSI',
						slug: 'punto-infissi',
						logoUrl: saveResult.path,
						currency: 'EUR',
						timezone: 'Europe/Rome',
						language: 'it',
					},
				})
				console.log('✅ Created organization with logo:', saveResult.path)
			}
		} catch (dbError) {
			console.error('⚠️ Failed to save logo to database:', dbError)
			// Не прерываем выполнение, файл уже сохранен
		}

		// 8. Возврат результата
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

		// 3. Удаление пути из базы данных
		try {
			const { prisma } = await import('@/lib/prisma')
			const existing = await prisma.organization.findFirst()
			
			if (existing) {
				await prisma.organization.update({
					where: { id: existing.id },
					data: { logoUrl: null },
				})
				console.log('✅ Logo path removed from database')
			}
		} catch (dbError) {
			console.error('⚠️ Failed to remove logo from database:', dbError)
		}

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
