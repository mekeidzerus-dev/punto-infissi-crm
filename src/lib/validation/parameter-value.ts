import { z } from 'zod'

const optionalTrimmedString = (max: number) =>
	z
		.string()
		.trim()
		.max(max)
		.nullish()

const hexColorSchema = z
	.string()
	.trim()
	.regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Invalid hex color')
	.nullish()

export const parameterValueQuerySchema = z.object({
	parameterId: z.string().trim().min(1, 'parameterId is required'),
})

export const parameterValueCreateSchema = z.object({
	parameterId: z.string().trim().min(1),
	value: z.string().trim().min(1).max(255),
	valueIt: optionalTrimmedString(255),
	displayName: optionalTrimmedString(255),
	hexColor: hexColorSchema,
	ralCode: optionalTrimmedString(32),
	icon: optionalTrimmedString(120),
	order: z.coerce.number().int().min(0).nullish(),
})

export const parameterValueUpdateSchema = parameterValueCreateSchema.partial().extend({
	id: z.string().trim().min(1),
})

export type ParameterValueQueryInput = z.infer<typeof parameterValueQuerySchema>
export type ParameterValueCreateInput = z.infer<typeof parameterValueCreateSchema>

export type ParameterValueUpdateInput = z.infer<typeof parameterValueUpdateSchema>
