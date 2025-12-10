import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

/**
 * Получает ID текущей организации из сессии пользователя.
 * 
 * @returns Promise<string | null> - ID организации или null если пользователь не авторизован
 */
export async function getCurrentOrganizationId(): Promise<string | null> {
	try {
		const session = await getServerSession(authOptions)
		if (!session?.user?.organizationId) {
			return null
		}
		return session.user.organizationId
	} catch (error) {
		console.error('Error getting current organization:', error)
		return null
	}
}

/**
 * Получает текущую организацию или создает дефолтную если её нет.
 * Используется только при создании новых записей, когда организация должна существовать.
 * 
 * @returns Promise<string> - ID организации
 */
export async function ensureOrganizationId(): Promise<string> {
	const orgId = await getCurrentOrganizationId()
	
	if (orgId) {
		return orgId
	}

	// Если пользователь авторизован, но organizationId отсутствует - это ошибка
	const session = await getServerSession(authOptions)
	if (session?.user?.id) {
		throw new Error('User is authenticated but has no organizationId')
	}

	// Создаем дефолтную организацию только если пользователь не авторизован
	// Это fallback для legacy кода, но в продакшене этого не должно происходить
	const organization = await prisma.organization.create({
		data: {
			name: 'MODOCRM',
			slug: 'modocrm',
			logoUrl: null,
			faviconUrl: null,
			primaryColor: '#dc2626',
			currency: 'EUR',
			timezone: 'Europe/Rome',
			language: 'it',
		},
		select: { id: true },
	})

	return organization.id
}

