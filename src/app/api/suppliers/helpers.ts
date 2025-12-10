import type { Prisma } from '@prisma/client'
import { ApiError } from '@/lib/api-handler'
import {
	supplierCreateSchema,
	supplierUpdateSchema,
	type SupplierCreateInput,
	type SupplierUpdateInput,
} from '@/lib/validation/supplier'
import { ensureOrganizationId } from '@/lib/organization-context'

export const supplierCreateBodySchema = supplierCreateSchema
export const supplierUpdateBodySchema = supplierUpdateSchema

const DEFAULT_STATUS: Exclude<SupplierCreateInput['status'], null | undefined> = 'active'

function normalizeEmail(
	value: SupplierCreateInput['email']
): string | null {
	if (typeof value !== 'string') return null
	const trimmed = value.trim()
	return trimmed.length > 0 ? trimmed : null
}

export async function buildSupplierCreateData(
	input: SupplierCreateInput
): Promise<Prisma.SupplierCreateInput> {
	const normalizedEmail = normalizeEmail(input.email)
	const organizationId = await ensureOrganizationId()

	return {
		name: input.name.trim(),
		shortName: input.shortName ?? null,
		shortNameIt: input.shortNameIt ?? null,
		phone: input.phone.trim(),
		email: normalizedEmail,
		contactPerson: input.contactPerson ?? null,
		address: input.address ?? null,
		codiceFiscale: input.codiceFiscale ?? null,
		partitaIVA: input.partitaIVA ?? null,
		legalAddress: input.legalAddress ?? null,
		paymentTerms: input.paymentTerms ?? null,
		deliveryDays: input.deliveryDays ?? null,
		minOrderAmount: input.minOrderAmount ?? null,
		rating: input.rating ?? 0,
		status: input.status ?? DEFAULT_STATUS,
		notes: input.notes ?? null,
		organizationId,
	} as Prisma.SupplierCreateInput
}

export function buildSupplierUpdateData(
	input: SupplierUpdateInput
): Prisma.SupplierUpdateInput {
	const data: Prisma.SupplierUpdateInput = {}

	if (input.name !== undefined) data.name = input.name.trim()
	if (input.shortName !== undefined) data.shortName = input.shortName ?? null
	if (input.shortNameIt !== undefined)
		data.shortNameIt = input.shortNameIt ?? null
	if (input.phone !== undefined) data.phone = input.phone.trim()
	if (input.email !== undefined) {
		data.email = normalizeEmail(input.email)
	}
	if (input.contactPerson !== undefined)
		data.contactPerson = input.contactPerson ?? null
	if (input.address !== undefined) data.address = input.address ?? null
	if (input.codiceFiscale !== undefined)
		data.codiceFiscale = input.codiceFiscale ?? null
	if (input.partitaIVA !== undefined) data.partitaIVA = input.partitaIVA ?? null
	if (input.legalAddress !== undefined)
		data.legalAddress = input.legalAddress ?? null
	if (input.paymentTerms !== undefined)
		data.paymentTerms = input.paymentTerms ?? null
	if (input.deliveryDays !== undefined)
		data.deliveryDays = input.deliveryDays ?? null
	if (input.minOrderAmount !== undefined)
		data.minOrderAmount = input.minOrderAmount ?? null
	if (input.rating !== undefined) data.rating = input.rating ?? 0
	if (input.status !== undefined) data.status = input.status ?? DEFAULT_STATUS
	if (input.notes !== undefined) data.notes = input.notes ?? null

	return data
}

export function ensureSupplierId(
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
