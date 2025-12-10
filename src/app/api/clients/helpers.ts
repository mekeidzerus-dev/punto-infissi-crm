import type { Prisma } from '@prisma/client'
import { ApiError } from '@/lib/api-handler'
import {
	type ClientCreateInput,
	type ClientUpdateInput,
} from '@/lib/validation/client'
import { ensureOrganizationId } from '@/lib/organization-context'

const DEFAULT_CLIENT_TYPE: Exclude<ClientCreateInput['type'], null | undefined> = 'individual'

export async function buildClientCreateData(
	input: ClientCreateInput
): Promise<Prisma.ClientCreateInput> {
	const organizationId = await ensureOrganizationId()

	const phone = input.phone?.trim()
	if (!phone || phone.length === 0) {
		throw new ApiError(400, 'Phone is required')
	}

	return {
		type: input.type ?? DEFAULT_CLIENT_TYPE,
		firstName: input.firstName ?? null,
		lastName: input.lastName ?? null,
		companyName: input.companyName ?? null,
		phone,
		email: input.email ?? null,
		address: input.address ?? null,
		codiceFiscale: input.codiceFiscale ?? null,
		partitaIVA: input.partitaIVA ?? null,
		legalAddress: input.legalAddress ?? null,
		contactPerson: input.contactPerson ?? null,
		source: input.source ?? null,
		notes: input.notes ?? null,
		organizationId,
	} as Prisma.ClientCreateInput
}

export function buildClientUpdateData(
	input: ClientUpdateInput
): Prisma.ClientUpdateInput {
	const data: Prisma.ClientUpdateInput = {}

	if (input.type !== undefined) data.type = (input.type ?? DEFAULT_CLIENT_TYPE)
	if (input.firstName !== undefined) data.firstName = input.firstName ?? null
	if (input.lastName !== undefined) data.lastName = input.lastName ?? null
	if (input.companyName !== undefined)
		data.companyName = input.companyName ?? null
	if (input.phone !== undefined) {
		const trimmed = input.phone?.trim()
		if (!trimmed || trimmed.length === 0) {
			throw new ApiError(400, 'Phone cannot be empty')
		}
		data.phone = trimmed
	}
	if (input.email !== undefined) data.email = input.email ?? null
	if (input.address !== undefined) data.address = input.address ?? null
	if (input.codiceFiscale !== undefined)
		data.codiceFiscale = input.codiceFiscale ?? null
	if (input.partitaIVA !== undefined) data.partitaIVA = input.partitaIVA ?? null
	if (input.legalAddress !== undefined)
		data.legalAddress = input.legalAddress ?? null
	if (input.contactPerson !== undefined)
		data.contactPerson = input.contactPerson ?? null
	if (input.source !== undefined) data.source = input.source ?? null
	if (input.notes !== undefined) data.notes = input.notes ?? null

	return data
}

export function ensureClientId(
	value: string | null,
	field = 'id'
): number {
	if (!value) {
		throw new ApiError(400, `${field} is required`)
	}

	const id = Number(value)
	if (!Number.isInteger(id) || id <= 0) {
		throw new ApiError(400, `${field} must be a positive integer`)
	}

	return id
}
