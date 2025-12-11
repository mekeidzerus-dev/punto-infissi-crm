import type { PrismaClient } from '@prisma/client'
import { prisma } from './prisma'

/**
 * Стандартные итальянские налоговые ставки согласно законодательству
 */
export const STANDARD_ITALIAN_VAT_RATES = [
	{
		name: 'IVA 4%',
		percentage: 4.0,
		description: 'Aliquota ridotta per beni di prima necessità',
		isDefault: false,
		isActive: true,
	},
	{
		name: 'IVA 5%',
		percentage: 5.0,
		description: 'Aliquota ridotta speciale',
		isDefault: false,
		isActive: true,
	},
	{
		name: 'IVA 10%',
		percentage: 10.0,
		description: 'Aliquota ridotta',
		isDefault: false,
		isActive: true,
	},
	{
		name: 'IVA 22%',
		percentage: 22.0,
		description: 'Aliquota ordinaria',
		isDefault: true,
		isActive: true,
	},
]

/**
 * Создает стандартные налоговые ставки для организации
 * @param organizationId ID организации
 * @param tx Опциональная транзакция Prisma
 */
export async function createStandardVATRatesForOrganization(
	organizationId: string,
	tx?: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>
) {
	const prismaClient = tx || prisma

	try {
		// Проверяем, есть ли уже ставки для этой организации
		const existingRates = await prismaClient.vATRate.findMany({
		where: {
			organizationId,
			isActive: true,
		},
	})

	// Если ставки уже есть, не создаем дубликаты
	if (existingRates.length > 0) {
		return existingRates
	}

	// Получаем все существующие ставки для организации одним запросом
	const existingRatesMap = new Map(
		(
			await prismaClient.vATRate.findMany({
				where: {
					organizationId,
				},
			})
		).map((rate) => [rate.name, rate])
	)

	// Снимаем дефолт со всех ставок организации перед созданием новой дефолтной
	if (existingRatesMap.size > 0) {
		await prismaClient.vATRate.updateMany({
			where: {
				organizationId,
				isDefault: true,
			},
			data: { isDefault: false },
		})
	}

	// Фильтруем ставки, которые нужно создать
	const ratesToCreate = STANDARD_ITALIAN_VAT_RATES.filter(
		(rate) => !existingRatesMap.has(rate.name)
	)

	// Создаем только новые ставки
	if (ratesToCreate.length > 0) {
		await prismaClient.vATRate.createMany({
			data: ratesToCreate.map((rate) => ({
				...rate,
				organizationId,
				isSystem: false,
			})),
			skipDuplicates: true,
		})
	}

		// Возвращаем все ставки организации (существующие + новые)
		const allRates = await prismaClient.vATRate.findMany({
			where: {
				organizationId,
			},
			orderBy: {
				percentage: 'asc',
			},
		})

		return allRates
	} catch (error) {
		console.error('Error in createStandardVATRatesForOrganization:', error)
		throw error
	}
}

