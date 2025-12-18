import type { Prisma } from '@prisma/client'

/**
 * Добавляет фильтрацию по organizationId к where условию Prisma запроса
 * @param organizationId - ID организации или null
 * @param where - существующее where условие (опционально)
 * @returns Объект с добавленным organizationId фильтром
 */
export function withOrganizationFilter<T extends Record<string, unknown>>(
	organizationId: string | null,
	where?: T
): T & { organizationId?: string } {
	return {
		...where,
		...(organizationId ? { organizationId } : {}),
	} as T & { organizationId?: string }
}

/**
 * Добавляет organizationId к данным для создания записи в Prisma
 * @param organizationId - ID организации или null
 * @param data - данные для создания
 * @returns Данные с добавленным organizationId
 */
export function withOrganizationId<T extends Record<string, unknown>>(
	organizationId: string | null,
	data: T
): T & { organizationId?: string } {
	return {
		...data,
		...(organizationId ? { organizationId } : {}),
	}
}



