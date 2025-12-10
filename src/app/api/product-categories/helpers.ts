import { buildCategoryCreateData, buildCategoryUpdateData, categoryCreateBodySchema, categoryUpdateBodySchema } from '@/app/api/categories/helpers'
import { ApiError } from '@/lib/api-handler'

export {
	buildCategoryCreateData as buildProductCategoryCreateData,
	buildCategoryUpdateData as buildProductCategoryUpdateData,
	categoryCreateBodySchema as productCategoryCreateBodySchema,
	categoryUpdateBodySchema as productCategoryUpdateBodySchema,
}

export function ensureProductCategoryId(value: string | null): string {
	if (!value) {
		throw new ApiError(400, 'id is required')
	}
	const trimmed = value.trim()
	if (!trimmed) {
		throw new ApiError(400, 'id must be a non-empty string')
	}
	return trimmed
}
