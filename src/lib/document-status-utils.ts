/**
 * Утилиты для работы с статусами документов
 */

import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

/**
 * Получить основной статус для типа документа
 * @param documentType - Тип документа ('proposal', 'order', и т.д.)
 * @returns ID основного статуса или null если не найден
 */
export async function getDefaultDocumentStatus(
	documentType: string
): Promise<number | null> {
	try {
		const defaultStatusType = await prisma.documentStatusType.findFirst({
			where: {
				documentType: { name: documentType },
				isDefault: true,
			},
			include: {
				status: true,
			},
		})

		if (defaultStatusType && defaultStatusType.status.isActive) {
			logger.info(
				`✅ Found default status for ${documentType}: ${defaultStatusType.status.name} (ID: ${defaultStatusType.statusId})`
			)
			return defaultStatusType.statusId
		}

		logger.warn(
			`⚠️ No default status found for document type: ${documentType}`
		)
		return null
	} catch (error) {
		logger.error(
			`❌ Error fetching default status for ${documentType}:`,
			error || undefined
		)
		return null
	}
}

