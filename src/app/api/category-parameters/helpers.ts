import type { Prisma } from '@prisma/client'
import { ApiError } from '@/lib/api-handler'
import {
	categoryParameterLinkSchema,
	categoryParameterQuerySchema,
	categoryParameterUnlinkSchema,
	type CategoryParameterLinkInput,
	type CategoryParameterQueryInput,
	type CategoryParameterUnlinkInput,
} from '@/lib/validation/category-parameter'

export const categoryParameterQueryParamsSchema = categoryParameterQuerySchema
export const categoryParameterLinkBodySchema = categoryParameterLinkSchema
export const categoryParameterUnlinkBodySchema = categoryParameterUnlinkSchema

export function parseCategoryParameterQuery(
	params: URLSearchParams
): CategoryParameterQueryInput {
	return categoryParameterQueryParamsSchema.parse({
		categoryId: params.get('categoryId'),
	})
}

export function buildCategoryParameterUpsertData(
	categoryId: string,
	parameterId: string,
	input: CategoryParameterLinkInput
): Prisma.CategoryParameterUpsertArgs {
	return {
		where: {
			categoryId_parameterId: {
				categoryId,
				parameterId,
			},
		},
		create: {
			categoryId,
			parameterId,
			isRequired: input.isRequired ?? false,
			isVisible: input.isVisible ?? true,
			order: input.order ?? 0,
			displayName: input.displayName ?? null,
			displayNameIt: input.displayNameIt ?? null,
			defaultValue: input.defaultValue ?? null,
			helpText: input.helpText ?? null,
		},
		update: {
			isRequired: input.isRequired ?? false,
			isVisible: input.isVisible ?? true,
			order: input.order ?? 0,
			displayName: input.displayName ?? null,
			displayNameIt: input.displayNameIt ?? null,
			defaultValue: input.defaultValue ?? null,
			helpText: input.helpText ?? null,
		},
	}
}

export function ensureCategoryId(value: string | null): string {
	if (!value) {
		throw new ApiError(400, 'categoryId is required')
	}
	const trimmed = value.trim()
	if (!trimmed) {
		throw new ApiError(400, 'categoryId must be non-empty string')
	}
	return trimmed
}

export function ensureParameterId(value: string | null): string {
	if (!value) {
		throw new ApiError(400, 'parameterId is required')
	}
	const trimmed = value.trim()
	if (!trimmed) {
		throw new ApiError(400, 'parameterId must be non-empty string')
	}
	return trimmed
}
