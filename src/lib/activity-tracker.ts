import { prisma } from './prisma'

/**
 * Обновляет время последней активности пользователя
 * Вызывается при каждом API запросе авторизованного пользователя
 */
export async function updateUserActivity(userId: string) {
	try {
		await prisma.user.update({
			where: { id: userId },
			data: {
				lastActivityAt: new Date(),
			},
		})
	} catch (error) {
		// Не прерываем выполнение при ошибке обновления активности
		console.error('Error updating user activity:', error)
	}
}

