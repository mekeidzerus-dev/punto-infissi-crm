import type { Prisma } from '@prisma/client'
import { ApiError } from '@/lib/api-handler'
import {
	categoryCreateSchema,
	categoryUpdateSchema,
	type CategoryCreateInput,
	type CategoryUpdateInput,
} from '@/lib/validation/category'

export const categoryCreateBodySchema = categoryCreateSchema
export const categoryUpdateBodySchema = categoryUpdateSchema

export function buildCategoryCreateData(
	input: CategoryCreateInput
): Prisma.ProductCategoryCreateInput {
	return {
		name: input.name.trim(),
		description: input.description?.trim() ?? null,
		icon: input.icon.trim(),
		isActive: input.isActive ?? true,
	}
}

export function buildCategoryUpdateData(
	input: CategoryUpdateInput
): Prisma.ProductCategoryUpdateInput {
	const data: Prisma.ProductCategoryUpdateInput = {}

	if (input.name !== undefined) data.name = input.name.trim()
	if (input.description !== undefined)
		data.description = input.description?.trim() ?? null
	if (input.icon !== undefined) data.icon = input.icon.trim()
	if (input.isActive !== undefined) data.isActive = input.isActive ?? true

	return data
}

export function ensureCategoryId(value: string | null): string {
	if (!value || !value.trim()) {
		throw new ApiError(400, 'id is required')
	}
	return value.trim()
}
