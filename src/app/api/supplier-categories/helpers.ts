import type { Prisma } from '@prisma/client'
import { ApiError } from '@/lib/api-handler'
import {
	supplierCategoryCreateSchema,
	supplierCategoryDeleteSchema,
	supplierCategoryQuerySchema,
	type SupplierCategoryCreateInput,
	type SupplierCategoryQueryInput,
} from '@/lib/validation/supplier-category'

export const supplierCategoryCreateBodySchema = supplierCategoryCreateSchema
export const supplierCategoryDeleteBodySchema = supplierCategoryDeleteSchema
export const supplierCategoryQueryParamsSchema = supplierCategoryQuerySchema

export function parseSupplierCategoryQuery(
	params: URLSearchParams
): SupplierCategoryQueryInput {
	return supplierCategoryQueryParamsSchema.parse({
		supplierId: params.get('supplierId'),
		categoryId: params.get('categoryId'),
	})
}

export function buildSupplierCategoryCreateData(
	input: SupplierCategoryCreateInput
): Prisma.SupplierProductCategoryCreateInput {
	return {
		supplier: { connect: { id: input.supplierId } },
		category: { connect: { id: input.categoryId } },
		parameters: input.parameters ?? [],
	}
}

export function ensureSupplierCategoryIds(
	input: SupplierCategoryCreateInput
): SupplierCategoryCreateInput {
	return input
}

export function ensureSupplierCategoryDeleteBody(value: unknown) {
	const parsed = supplierCategoryDeleteBodySchema.parse(value)
	return parsed
}

export function ensureSupplierCategoryId(value: string | null): string {
	if (!value) {
		throw new ApiError(400, 'id is required')
	}
	const trimmed = value.trim()
	if (!trimmed) {
		throw new ApiError(400, 'id must be non-empty string')
	}
	return trimmed
}
