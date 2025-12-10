import type { Prisma } from '@prisma/client'
import { ApiError } from '@/lib/api-handler'
import {
	dictionaryCreateSchema,
	dictionaryUpdateSchema,
	type DictionaryCreateInput,
	type DictionaryUpdateInput,
} from '@/lib/validation/dictionary'
import { ensureOrganizationId } from '@/lib/organization-context'

export const dictionaryCreateBodySchema = dictionaryCreateSchema
export const dictionaryUpdateBodySchema = dictionaryUpdateSchema

export async function buildDictionaryCreateData(
	input: DictionaryCreateInput
): Promise<Prisma.DictionaryCreateInput> {
	const organizationId = await ensureOrganizationId()
	return {
		type: input.type.trim(),
		name: input.name.trim(),
		isActive: input.isActive ?? true,
		organizationId,
	} as Prisma.DictionaryCreateInput
}

export function buildDictionaryUpdateData(
	input: DictionaryUpdateInput
): Prisma.DictionaryUpdateInput {
	return {
		name: input.name.trim(),
		isActive: input.isActive,
	}
}

export function ensureDictionaryId(value: string | null): number {
	if (!value) {
		throw new ApiError(400, 'id is required')
	}
	const id = Number(value)
	if (!Number.isInteger(id) || id <= 0) {
		throw new ApiError(400, 'id must be a positive integer')
	}
	return id
}
