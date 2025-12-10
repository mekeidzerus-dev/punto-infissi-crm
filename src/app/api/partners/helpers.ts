import type { Prisma } from '@prisma/client'
import { ApiError } from '@/lib/api-handler'
import {
	partnerCreateSchema,
	partnerUpdateSchema,
	type PartnerCreateInput,
	type PartnerUpdateInput,
} from '@/lib/validation/partner'
import { ensureOrganizationId } from '@/lib/organization-context'

export const partnerCreateBodySchema = partnerCreateSchema
export const partnerUpdateBodySchema = partnerUpdateSchema

const DEFAULT_STATUS: Exclude<PartnerCreateInput['status'], null | undefined> = 'active'

export async function buildPartnerCreateData(
	input: PartnerCreateInput
): Promise<Prisma.PartnerCreateInput> {
	const organizationId = await ensureOrganizationId()

	return {
		name: input.name.trim(),
		phone: input.phone.trim(),
		email: input.email ?? null,
		contactPerson: input.contactPerson ?? null,
		address: input.address ?? null,
		type: input.type ?? null,
		region: input.region ?? null,
		commission: input.commission ?? null,
		codiceFiscale: input.codiceFiscale ?? null,
		partitaIVA: input.partitaIVA ?? null,
		legalAddress: input.legalAddress ?? null,
		status: input.status ?? DEFAULT_STATUS,
		notes: input.notes ?? null,
		organizationId,
	} as Prisma.PartnerCreateInput
}

export function buildPartnerUpdateData(
	input: PartnerUpdateInput
): Prisma.PartnerUpdateInput {
	const data: Prisma.PartnerUpdateInput = {}

	if (input.name !== undefined) data.name = input.name.trim()
	if (input.phone !== undefined) data.phone = input.phone.trim()
	if (input.email !== undefined) data.email = input.email ?? null
	if (input.contactPerson !== undefined)
		data.contactPerson = input.contactPerson ?? null
	if (input.address !== undefined) data.address = input.address ?? null
	if (input.type !== undefined) data.type = input.type ?? null
	if (input.region !== undefined) data.region = input.region ?? null
	if (input.commission !== undefined)
		data.commission = input.commission ?? null
	if (input.codiceFiscale !== undefined)
		data.codiceFiscale = input.codiceFiscale ?? null
	if (input.partitaIVA !== undefined)
		data.partitaIVA = input.partitaIVA ?? null
	if (input.legalAddress !== undefined)
		data.legalAddress = input.legalAddress ?? null
	if (input.status !== undefined) data.status = input.status ?? DEFAULT_STATUS
	if (input.notes !== undefined) data.notes = input.notes ?? null

	return data
}

export function ensurePartnerId(value: string | null): number {
	if (!value) {
		throw new ApiError(400, 'id is required')
	}

	const id = Number(value)
	if (!Number.isInteger(id) || id <= 0) {
		throw new ApiError(400, 'id must be a positive integer')
	}

	return id
}
