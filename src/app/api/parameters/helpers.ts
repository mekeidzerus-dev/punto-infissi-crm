import type { Prisma } from '@prisma/client'
import { ApiError } from '@/lib/api-handler'
import {
	parameterCreateSchema,
	parameterQuerySchema,
	parameterUpdateSchema,
	type ParameterCreateInput,
	type ParameterQueryInput,
	type ParameterUpdateInput,
} from '@/lib/validation/parameter'

export const parameterCreateBodySchema = parameterCreateSchema
export const parameterUpdateBodySchema = parameterUpdateSchema
export const parameterQueryParamsSchema = parameterQuerySchema

export function parseParameterQuery(
	params: URLSearchParams
): ParameterQueryInput {
	return parameterQueryParamsSchema.parse({
		type: params.get('type'),
		isActive: params.get('isActive'),
	})
}

export function buildParameterCreateData(
	input: ParameterCreateInput
): Prisma.ParameterTemplateCreateInput {
	return {
		name: input.name.trim(),
		nameIt: input.nameIt ?? null,
		type: input.type,
		description: input.description ?? null,
		unit: input.unit ?? null,
		minValue: input.minValue ?? null,
		maxValue: input.maxValue ?? null,
		step: input.step ?? null,
		isGlobal: true,
		values: input.values
			? {
				create: input.values.map((value, index) => ({
					value: value.value.trim(),
					valueIt: value.valueIt ?? null,
					displayName: value.displayName ?? null,
					hexColor: value.hexColor ?? null,
					ralCode: value.ralCode ?? null,
					order: index,
				})),
			}
			: undefined,
	}
}

export function buildParameterUpdateData(
	input: ParameterUpdateInput
): Prisma.ParameterTemplateUpdateInput {
	const data: Prisma.ParameterTemplateUpdateInput = {}

	if (input.name !== undefined) data.name = input.name.trim()
	if (input.nameIt !== undefined) data.nameIt = input.nameIt ?? null
	if (input.description !== undefined)
		data.description = input.description ?? null
	if (input.unit !== undefined) data.unit = input.unit ?? null
	if (input.minValue !== undefined) data.minValue = input.minValue ?? null
	if (input.maxValue !== undefined) data.maxValue = input.maxValue ?? null
	if (input.step !== undefined) data.step = input.step ?? null
	if (input.isActive !== undefined) data.isActive = input.isActive ?? true
	// type and values managed by dedicated endpoints

	return data
}

export function ensureParameterId(value: string | null): string {
	if (!value) {
		throw new ApiError(400, 'id is required')
	}
	const trimmed = value.trim()
	if (!trimmed) {
		throw new ApiError(400, 'id must be a non-empty string')
	}
	return trimmed
}

export function ensureParameterIdFromParams(
	params?: Record<string, string | string[]>
): string {
	const raw = params?.id
	const value = Array.isArray(raw) ? raw[0] ?? null : raw ?? null
	return ensureParameterId(value)
}
