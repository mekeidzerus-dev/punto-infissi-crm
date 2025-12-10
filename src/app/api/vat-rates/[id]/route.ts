import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiError, parseJson, success, withApiHandler } from '@/lib/api-handler'
import {
	buildVatRateUpdateData,
	ensureVatRateId,
	ensureNonDuplicateDefault,
	vatRateUpdateBodySchema,
} from '../helpers'
import { getCurrentOrganizationId } from '@/lib/organization-context'

export const PUT = withApiHandler(async (request: NextRequest, { params }) => {
	const id = ensureVatRateId(params?.id as string)
	const payload = await parseJson(request, vatRateUpdateBodySchema)
	const organizationId = await getCurrentOrganizationId()

	// Проверяем принадлежность записи к организации
	const existing = await prisma.vATRate.findFirst({
		where: {
			id,
			...(organizationId ? { organizationId } : {}),
		},
	})

	if (!existing) {
		throw new ApiError(404, 'VAT rate not found')
	}

	if (payload.isDefault === true) {
		await prisma.vATRate.updateMany({
			where: {
				NOT: { id },
				...(organizationId ? { organizationId } : {}),
			},
			data: { isDefault: false },
		})
	}

	const vatRate = await prisma.vATRate.update({
		where: { id },
		data: buildVatRateUpdateData(payload),
	})

	return success(vatRate)
})

export const DELETE = withApiHandler(async (_request, { params }) => {
	const id = ensureVatRateId(params?.id as string)
	const organizationId = await getCurrentOrganizationId()

	// Проверяем принадлежность записи к организации
	const existing = await prisma.vATRate.findFirst({
		where: {
			id,
			...(organizationId ? { organizationId } : {}),
		},
	})

	if (!existing) {
		throw new ApiError(404, 'VAT rate not found')
	}

	if (existing.isDefault) {
		throw new ApiError(400, 'Cannot delete default VAT rate')
	}

	await prisma.vATRate.delete({ where: { id } })

	return success({ success: true })
})
