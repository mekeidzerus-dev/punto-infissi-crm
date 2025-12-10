import { ApiError } from '@/lib/api-handler'
import {
	documentStatusTypeOrderSchema,
	documentStatusTypeReorderSchema,
	type DocumentStatusTypeOrderInput,
	type DocumentStatusTypeReorderInput,
} from '@/lib/validation/document-status-type'

export const documentStatusTypeOrderBodySchema = documentStatusTypeOrderSchema
export const documentStatusTypeReorderBodySchema = documentStatusTypeReorderSchema

export function ensureDocumentStatusTypeId(value: string | null): number {
	if (!value) {
		throw new ApiError(400, 'id is required')
	}
	const parsed = Number(value)
	if (!Number.isInteger(parsed) || parsed <= 0) {
		throw new ApiError(400, 'id must be a positive integer')
	}
	return parsed
}

export type {
	DocumentStatusTypeOrderInput,
	DocumentStatusTypeReorderInput,
}
