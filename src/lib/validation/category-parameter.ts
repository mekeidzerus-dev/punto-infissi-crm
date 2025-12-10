import { z } from 'zod'

const optionalTrimmedString = (max: number) =>
	z
		.string()
		.trim()
		.max(max)
		.nullish()

export const categoryParameterQuerySchema = z.object({
	categoryId: z.string().trim().min(1),
})

export const categoryParameterLinkSchema = z.object({
	parameterId: z.string().trim().min(1),
	isRequired: z.boolean().nullish(),
	isVisible: z.boolean().nullish(),
	order: z.coerce.number().int().min(0).nullish(),
	displayName: optionalTrimmedString(255),
	displayNameIt: optionalTrimmedString(255),
	defaultValue: optionalTrimmedString(255),
	helpText: optionalTrimmedString(1024),
})

export const categoryParameterUnlinkSchema = z.object({
	categoryId: z.string().trim().min(1),
	parameterId: z.string().trim().min(1),
})

export type CategoryParameterQueryInput = z.infer<typeof categoryParameterQuerySchema>
export type CategoryParameterLinkInput = z.infer<typeof categoryParameterLinkSchema>
export type CategoryParameterUnlinkInput = z.infer<typeof categoryParameterUnlinkSchema>
