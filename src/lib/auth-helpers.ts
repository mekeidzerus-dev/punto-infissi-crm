import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { ApiError } from './api-handler'

/**
 * Получает текущего пользователя из сессии NextAuth
 * Используется в API routes (server-side)
 */
export async function getCurrentUser() {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id) {
		return null
	}

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		include: { organization: true },
	})

	return user
}

/**
 * Требует аутентификации и возвращает текущего пользователя
 * Выбрасывает ApiError если пользователь не авторизован
 */
export async function requireAuth() {
	const user = await getCurrentUser()
	if (!user) {
		throw new ApiError(401, 'Authentication required')
	}
	return user
}

/**
 * Проверяет, является ли пользователь администратором организации
 */
export async function requireAdmin() {
	const user = await requireAuth()
	if (user.role !== 'admin') {
		throw new ApiError(403, 'Admin access required')
	}
	return user
}

