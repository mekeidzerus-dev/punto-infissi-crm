import { prisma } from '@/lib/prisma'
import { ApiError } from '@/lib/api-handler'
import {
	vatRateCreateSchema,
	vatRateUpdateSchema,
	type VatRateCreateInput,
	type VatRateUpdateInput,
} from '@/lib/validation/vat-rate'
import { ensureOrganizationId, getCurrentOrganizationId } from '@/lib/organization-context'
import type { Prisma } from '@prisma/client'

export const vatRateCreateBodySchema = vatRateCreateSchema
export const vatRateUpdateBodySchema = vatRateUpdateSchema

export function ensureVatRateId(value: string | null): string {
	if (!value) {
		throw new ApiError(400, 'id is required')
	}
	const trimmed = value.trim()
	if (!trimmed) {
		throw new ApiError(400, 'id must be a non-empty string')
	}
	return trimmed
}


export async function ensureNonDuplicateDefault(isDefault?: boolean) {
	if (!isDefault) return
	const organizationId = await getCurrentOrganizationId()

	await prisma.vATRate.updateMany({
		where: {
			isDefault: true,
			...(organizationId ? { organizationId } : {}),
		},
		data: { isDefault: false },
	})
}

export async function buildVatRateCreateData(input: VatRateCreateInput) {
	const organizationId = await ensureOrganizationId()
	return {
		name: input.name.trim(),
		percentage: input.percentage,
		description: input.description ?? null,
		isDefault: input.isDefault ?? false,
		organizationId,
	} as Prisma.VATRateCreateInput
}

export function buildVatRateUpdateData(input: VatRateUpdateInput) {
	const data: Record<string, unknown> = {}

	if (input.name !== undefined) data.name = input.name.trim()
	if (input.percentage !== undefined) data.percentage = input.percentage
	if (input.description !== undefined) data.description = input.description ?? null
	if (input.isDefault !== undefined) data.isDefault = input.isDefault

	return data
}
