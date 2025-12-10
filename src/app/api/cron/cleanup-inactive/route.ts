import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiError, success, withApiHandler } from '@/lib/api-handler'

/**
 * Cron job для очистки неактивных аккаунтов
 * Должен вызываться ежедневно через внешний сервис (cron-job.org, GitHub Actions, Vercel Cron)
 * 
 * Логика:
 * 1. Находит пользователей без активности >30 дней
 * 2. Отправляет email предупреждение (если еще не отправлено)
 * 3. Устанавливает deletionScheduledAt = now() + 14 дней
 * 4. Через 14 дней после предупреждения удаляет организацию и все данные
 */
export const POST = withApiHandler(async (request: NextRequest) => {
	// Проверка секретного ключа для защиты от несанкционированного доступа
	const authHeader = request.headers.get('authorization')
	const cronSecret = process.env.CRON_SECRET || 'change-me-in-production'

	if (authHeader !== `Bearer ${cronSecret}`) {
		throw new ApiError(401, 'Unauthorized')
	}

	const now = new Date()
	const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
	const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

	// Находим пользователей без активности >30 дней
	const inactiveUsers = await prisma.user.findMany({
		where: {
			lastActivityAt: {
				lt: thirtyDaysAgo,
			},
			deletionScheduledAt: null, // Еще не запланировано удаление
		},
		include: {
			organization: true,
		},
	})

	let warningsSent = 0
	let deletionsScheduled = 0

	for (const user of inactiveUsers) {
		if (!user.deletionWarningSentAt) {
			// Отправляем предупреждение и планируем удаление
			await prisma.user.update({
				where: { id: user.id },
				data: {
					deletionWarningSentAt: now,
					deletionScheduledAt: fourteenDaysFromNow,
				},
			})

			// TODO: Отправить email с предупреждением
			// await sendInactiveWarningEmail(user.email, user.organization?.name)

			warningsSent++
		}
	}

	// Находим пользователей, у которых прошло 14 дней после предупреждения
	const usersToDelete = await prisma.user.findMany({
		where: {
			deletionScheduledAt: {
				lte: now,
			},
			deletionWarningSentAt: {
				not: null,
			},
		},
		include: {
			organization: {
				include: {
					_count: {
						select: {
							users: true,
						},
					},
				},
			},
		},
	})

	let organizationsDeleted = 0

	for (const user of usersToDelete) {
		if (!user.organizationId) continue

		// Удаляем организацию (каскадно удалятся все связанные данные)
		await prisma.organization.delete({
			where: { id: user.organizationId },
		})

		organizationsDeleted++
	}

	return success({
		warningsSent,
		deletionsScheduled: warningsSent,
		organizationsDeleted,
		timestamp: now.toISOString(),
	})
})

