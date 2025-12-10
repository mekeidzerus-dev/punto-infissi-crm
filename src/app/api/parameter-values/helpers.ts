import type { Prisma } from '@prisma/client'
import { ApiError } from '@/lib/api-handler'
import {
	parameterValueCreateSchema,
	parameterValueQuerySchema,
	parameterValueUpdateSchema,
	type ParameterValueCreateInput,
	type ParameterValueQueryInput,
	type ParameterValueUpdateInput,
} from '@/lib/validation/parameter-value'

export const parameterValueCreateBodySchema = parameterValueCreateSchema
export const parameterValueUpdateBodySchema = parameterValueUpdateSchema
export const parameterValueQueryParamsSchema = parameterValueQuerySchema

export function parseParameterValueQuery(
	params: URLSearchParams
): ParameterValueQueryInput {
	return parameterValueQueryParamsSchema.parse({
		parameterId: params.get('parameterId'),
	})
}

export function buildParameterValueCreateData(
	input: ParameterValueCreateInput,
	order: number
): Prisma.ParameterValueUncheckedCreateInput {
	const trimmedValue = input.value.trim()
	return {
		parameterId: input.parameterId.trim(),
		value: trimmedValue,
		valueIt: input.valueIt ?? null,
		displayName: (input.displayName ?? trimmedValue).trim(),
		hexColor: input.hexColor ?? null,
		ralCode: input.ralCode ?? null,
		icon: input.icon ?? null,
		order,
		isActive: true,
	}
}

export function ensureParameterValueId(value: string | null): string {
	if (!value) {
		throw new ApiError(400, 'id is required')
	}
	const trimmed = value.trim()
	if (!trimmed) {
		throw new ApiError(400, 'id must be a non-empty string')
	}
	return trimmed
}

export const parameterValueUpdateBodyWithoutId = parameterValueUpdateSchema.omit({ id: true })

export function buildParameterValueUpdateData(
	input: ParameterValueUpdateInput
): Prisma.ParameterValueUpdateInput {
	const data: Prisma.ParameterValueUpdateInput = {}

	if (input.value !== undefined) data.value = input.value.trim()
	if (input.valueIt !== undefined) data.valueIt = input.valueIt ?? null
	if (input.displayName !== undefined) {
		const base = input.displayName ?? input.value ?? null
		data.displayName = base ? base.trim() : null
	}
	if (input.hexColor !== undefined) data.hexColor = input.hexColor ?? null
	if (input.ralCode !== undefined) data.ralCode = input.ralCode ?? null
	if (input.icon !== undefined) data.icon = input.icon ?? null
	if (input.order !== undefined && input.order !== null) data.order = input.order

	return data
}

export function ensureParameterValueIdFromParams(
	params?: Record<string, string | string[]>
): string {
	const raw = params?.id
	const value = Array.isArray(raw) ? raw[0] ?? null : raw ?? null
	return ensureParameterValueId(value)
}

export const parameterValueQuickAddBodySchema = parameterValueCreateSchema.pick({
	parameterId: true,
	value: true,
})

export function buildQuickAddValueData(
	input: { parameterId: string; value: string },
	order: number
): Prisma.ParameterValueUncheckedCreateInput {
	const trimmed = input.value.trim()
	return {
		parameterId: input.parameterId.trim(),
		value: trimmed,
		valueIt: trimmed,
		displayName: trimmed,
		order,
		isActive: true,
	}
}
