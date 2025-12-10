import { z } from 'zod'

export const parameterTypeEnum = z.enum([
	'TEXT',
	'NUMBER',
	'SELECT',
	'MULTI_SELECT',
	'COLOR',
	'BOOLEAN',
	'DATE',
	'RANGE',
])

const optionalTrimmedString = (max: number) =>
	z
		.string()
		.trim()
		.max(max)
		.nullish()

const optionalNumber = () => z.coerce.number().finite().nullish()

export const parameterQuerySchema = z.object({
	type: parameterTypeEnum.nullish(),
	isActive: z
		.enum(['true', 'false'])
		.transform(value => value === 'true')
		.nullish(),
})

export const parameterValueSchema = z.object({
	value: z.string().trim().min(1).max(255),
	valueIt: optionalTrimmedString(255),
	displayName: optionalTrimmedString(255),
	hexColor: optionalTrimmedString(7),
	ralCode: optionalTrimmedString(32),
})

export const parameterCreateSchema = z.object({
	name: z.string().trim().min(1).max(255),
	nameIt: optionalTrimmedString(255),
	type: parameterTypeEnum,
	description: optionalTrimmedString(1024),
	unit: optionalTrimmedString(32),
	minValue: optionalNumber(),
	maxValue: optionalNumber(),
	step: optionalNumber(),
	isGlobal: z.boolean().nullish(),
	values: z.array(parameterValueSchema).nullish(),
})

export const parameterUpdateSchema = parameterCreateSchema.partial().extend({
	id: z.string().trim().min(1),
	isActive: z.boolean().nullish(),
})

export type ParameterQueryInput = z.infer<typeof parameterQuerySchema>
export type ParameterCreateInput = z.infer<typeof parameterCreateSchema>
export type ParameterUpdateInput = z.infer<typeof parameterUpdateSchema>
