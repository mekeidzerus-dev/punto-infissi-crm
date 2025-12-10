import type { Prisma } from '@prisma/client'
import { ApiError } from '@/lib/api-handler'
import {
	installerCreateSchema,
	installerUpdateSchema,
	type InstallerCreateInput,
	type InstallerUpdateInput,
} from '@/lib/validation/installer'
import { ensureOrganizationId } from '@/lib/organization-context'

export const installerCreateBodySchema = installerCreateSchema
export const installerUpdateBodySchema = installerUpdateSchema

const DEFAULT_TYPE: Exclude<InstallerCreateInput['type'], null | undefined> = 'individual'
const DEFAULT_AVAILABILITY: Exclude<InstallerCreateInput['availability'], null | undefined> = 'available'
const DEFAULT_STATUS: Exclude<InstallerCreateInput['status'], null | undefined> = 'active'

export async function buildInstallerCreateData(
	input: InstallerCreateInput
): Promise<Prisma.InstallerCreateInput> {
	const organizationId = await ensureOrganizationId()

	return {
		type: input.type ?? DEFAULT_TYPE,
		name: input.name.trim(),
		phone: input.phone.trim(),
		email: input.email ?? null,
		specialization: input.specialization ?? null,
		experience: input.experience ?? null,
		hasTools: input.hasTools ?? true,
		hasTransport: input.hasTransport ?? true,
		rateType: input.rateType ?? null,
		ratePrice: input.ratePrice ?? null,
		schedule: input.schedule ?? null,
		availability: input.availability ?? DEFAULT_AVAILABILITY,
		rating: input.rating ?? 5,
		status: input.status ?? DEFAULT_STATUS,
		notes: input.notes ?? null,
		organizationId,
	} as Prisma.InstallerCreateInput
}

export function buildInstallerUpdateData(
	input: InstallerUpdateInput
): Prisma.InstallerUpdateInput {
	const data: Prisma.InstallerUpdateInput = {}

	if (input.type !== undefined) data.type = input.type ?? DEFAULT_TYPE
	if (input.name !== undefined) data.name = input.name.trim()
	if (input.phone !== undefined) data.phone = input.phone.trim()
	if (input.email !== undefined) data.email = input.email ?? null
	if (input.specialization !== undefined)
		data.specialization = input.specialization ?? null
	if (input.experience !== undefined) data.experience = input.experience ?? null
	if (input.hasTools !== undefined) data.hasTools = input.hasTools ?? true
	if (input.hasTransport !== undefined) data.hasTransport = input.hasTransport ?? true
	if (input.rateType !== undefined) data.rateType = input.rateType ?? null
	if (input.ratePrice !== undefined) data.ratePrice = input.ratePrice ?? null
	if (input.schedule !== undefined) data.schedule = input.schedule ?? null
	if (input.availability !== undefined) data.availability = input.availability ?? DEFAULT_AVAILABILITY
	if (input.rating !== undefined) data.rating = input.rating ?? 5
	if (input.status !== undefined) data.status = input.status ?? DEFAULT_STATUS
	if (input.notes !== undefined) data.notes = input.notes ?? null

	return data
}

export function ensureInstallerId(value: string | null): number {
	if (!value) {
		throw new ApiError(400, 'id is required')
	}

	const id = Number(value)
	if (!Number.isInteger(id) || id <= 0) {
		throw new ApiError(400, 'id must be a positive integer')
	}

	return id
}
