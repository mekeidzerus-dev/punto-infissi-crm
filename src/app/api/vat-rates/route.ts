import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseJson, success, withApiHandler } from '@/lib/api-handler'
import {
	buildVatRateCreateData,
	ensureNonDuplicateDefault,
	vatRateCreateBodySchema,
} from './helpers'
import { getCurrentOrganizationId } from '@/lib/organization-context'

export const GET = withApiHandler(async () => {
	const { requireAuth } = await import('@/lib/auth-helpers')
	const { createStandardVATRatesForOrganization } = await import('@/lib/vat-rates')
	const user = await requireAuth()
	const organizationId = await getCurrentOrganizationId() || user.organizationId

	if (!organizationId) {
		return success([])
	}

	// Загружаем ставки для организации
	let vatRates = await prisma.vATRate.findMany({
		where: {
			isActive: true,
			organizationId,
		},
		orderBy: { percentage: 'asc' },
	})

	// Если ставок нет, создаем стандартные (fallback для старых организаций)
	if (vatRates.length === 0) {
		await createStandardVATRatesForOrganization(organizationId)
		vatRates = await prisma.vATRate.findMany({
			where: {
				isActive: true,
				organizationId,
			},
			orderBy: { percentage: 'asc' },
		})
	}

	return success(vatRates)
})

export const POST = withApiHandler(async (request: NextRequest) => {
	const payload = await parseJson(request, vatRateCreateBodySchema)

	await ensureNonDuplicateDefault(payload.isDefault ?? false)

	const vatRate = await prisma.vATRate.create({
		data: await buildVatRateCreateData(payload),
	})

	return success(vatRate, 201)
})
