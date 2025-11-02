import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

/**
 * Синхронизирует статус isGlobal параметра на основе количества связей с категориями
 * - Если categoryParameters.length === 0 → isGlobal = true (не привязан ни к одной категории)
 * - Если categoryParameters.length >= 1 → isGlobal = false (привязан минимум к одной категории)
 */
export async function syncParameterGlobalStatus(
	parameterId: string
): Promise<void> {
	try {
		// Считаем количество связей CategoryParameter для параметра
		const categoryParametersCount = await prisma.categoryParameter.count({
			where: {
				parameterId,
			},
		})

		// Определяем новый статус
		const newIsGlobal = categoryParametersCount === 0

		// Обновляем параметр
		await prisma.parameterTemplate.update({
			where: { id: parameterId },
			data: { isGlobal: newIsGlobal },
		})

		logger.info(
			`✅ Synced parameter ${parameterId} isGlobal status: ${newIsGlobal} (${categoryParametersCount} category links)`
		)
	} catch (error) {
		logger.error(
			`❌ Error syncing parameter ${parameterId} global status:`,
			error
		)
		throw error
	}
}
