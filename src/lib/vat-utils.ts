/**
 * Утилиты для работы с НДС
 */

import { prisma } from './prisma'
import { logger } from './logger'

/**
 * Получить дефолтную ставку НДС из справочника
 * @returns Дефолтная ставка НДС (0-100) или 0 если не найдена
 */
export async function getDefaultVatRate(): Promise<number> {
	try {
		const defaultRate = await prisma.vATRate.findFirst({
			where: { isDefault: true, isActive: true },
		})

		if (defaultRate) {
			const percentage = Number(defaultRate.percentage)
			logger.info(`✅ Default VAT rate found: ${percentage}%`)
			return percentage
		}

		logger.warn('⚠️ No default VAT rate found, using 0%')
		return 0
	} catch (error) {
		logger.error('❌ Error fetching default VAT rate:', error)
		// В случае ошибки возвращаем 0, чтобы не использовать хардкод
		return 0
	}
}


