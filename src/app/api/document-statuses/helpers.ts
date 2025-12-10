import type { Prisma } from '@prisma/client'
import { ApiError } from '@/lib/api-handler'
import {
	documentStatusCreateSchema,
	documentStatusSetDefaultSchema,
	documentStatusUpdateSchema,
	type DocumentStatusCreateInput,
	type DocumentStatusUpdateInput,
} from '@/lib/validation/document-status'

export const documentStatusCreateBodySchema = documentStatusCreateSchema
export const documentStatusUpdateBodySchema = documentStatusUpdateSchema
export const documentStatusSetDefaultBodySchema = documentStatusSetDefaultSchema

const DEFAULT_COLOR = '#9CA3AF'

export function buildDocumentStatusCreateData(
	input: DocumentStatusCreateInput
): Prisma.DocumentStatusCreateInput {
	return {
		name: input.name.trim(),
		nameRu: input.nameRu.trim(),
		nameIt: input.nameIt.trim(),
		color: input.color ?? DEFAULT_COLOR,
	}
}

export function buildDocumentStatusUpdateData(
	input: DocumentStatusUpdateInput
): Prisma.DocumentStatusUpdateInput {
	const data: Prisma.DocumentStatusUpdateInput = {}

	if (input.name !== undefined) data.name = input.name.trim()
	if (input.nameRu !== undefined) data.nameRu = input.nameRu.trim()
	if (input.nameIt !== undefined) data.nameIt = input.nameIt.trim()
	if (input.color !== undefined) data.color = input.color ?? DEFAULT_COLOR

	return data
}

export function ensureStatusId(value: string | null): number {
	if (!value) {
		throw new ApiError(400, 'id is required')
	}
	const id = Number(value)
	if (!Number.isInteger(id) || id <= 0) {
		throw new ApiError(400, 'id must be a positive integer')
	}
	return id
}

export function ensureStatusIdFromParams(
	params?: Record<string, string | string[]>
): number {
	const raw = params?.id
	const value = Array.isArray(raw) ? raw[0] ?? null : raw ?? null
	return ensureStatusId(value)
}

export function ensureDocumentTypeName(value: string | null): string | null {
	if (value === null) return null
	const trimmed = value.trim()
	if (!trimmed) {
		throw new ApiError(400, 'documentType must be non-empty')
	}
	return trimmed
}

export function mapStatusWithCounts(
	statuses: Array<
		Prisma.DocumentStatusGetPayload<{
			include: { documentTypes: { include: { documentType: true } } }
		}>
	>
) {
	return statuses.map(status => ({
		...status,
		documentTypes: status.documentTypes.map(dt => ({
			id: (dt as any).id, // ID из DocumentStatusType
			statusId: dt.statusId,
			documentTypeId: dt.documentTypeId,
			order: dt.order,
			isDefault: dt.isDefault,
			documentType: dt.documentType,
		})),
	}))
}

export type DocumentStatusWithRelations = ReturnType<typeof mapStatusWithCounts>[number]

export function buildStatusTypeUpserts(
	statusId: number,
	documentTypeIds: number[] | undefined
) {
	return (documentTypeIds ?? []).map((documentTypeId, index) => ({
		statusId,
		documentTypeId,
		order: index,
	}))
}
