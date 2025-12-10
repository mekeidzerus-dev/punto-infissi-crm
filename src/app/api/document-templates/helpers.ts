import type { Prisma } from '@prisma/client'
import { ApiError } from '@/lib/api-handler'
import {
	documentTemplateCreateSchema,
	documentTemplateQuerySchema,
	documentTemplateUpdateSchema,
	type DocumentTemplateCreateInput,
	type DocumentTemplateQueryInput,
	type DocumentTemplateUpdateInput,
} from '@/lib/validation/document-template'
import { ensureOrganizationId } from '@/lib/organization-context'

export const documentTemplateCreateBodySchema = documentTemplateCreateSchema
export const documentTemplateUpdateBodySchema = documentTemplateUpdateSchema
export const documentTemplateQueryParamsSchema = documentTemplateQuerySchema

export function parseDocumentTemplateQuery(
	params: URLSearchParams
): DocumentTemplateQueryInput {
	return documentTemplateQueryParamsSchema.parse({
		type: params.get('type'),
	})
}

export async function buildDocumentTemplateCreateData(
	input: DocumentTemplateCreateInput
): Promise<Prisma.DocumentTemplateCreateInput> {
	const organizationId = await ensureOrganizationId()
	return {
		name: input.name.trim(),
		type: input.type.trim(),
		contentRu: input.contentRu ?? null,
		contentIt: input.contentIt ?? null,
		isDefault: input.isDefault ?? false,
		organizationId,
	} as Prisma.DocumentTemplateCreateInput
}

export function buildDocumentTemplateUpdateData(
	input: DocumentTemplateUpdateInput
): Prisma.DocumentTemplateUpdateInput {
	const data: Prisma.DocumentTemplateUpdateInput = {}

	if (input.name !== undefined) data.name = input.name.trim()
	if (input.type !== undefined) data.type = input.type.trim()
	if (input.contentRu !== undefined) data.contentRu = input.contentRu ?? null
	if (input.contentIt !== undefined) data.contentIt = input.contentIt ?? null
	if (input.isDefault !== undefined) data.isDefault = input.isDefault ?? false

	return data
}

export function ensureDocumentTemplateId(value: string | null): string {
	if (!value) {
		throw new ApiError(400, 'id is required')
	}
	const trimmed = value.trim()
	if (!trimmed) {
		throw new ApiError(400, 'id must be a non-empty string')
	}
	return trimmed
}
