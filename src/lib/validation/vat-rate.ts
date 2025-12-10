import { z } from 'zod'

const optionalTrimmedString = (max: number) =>
	z
		.string()
		.trim()
		.max(max)
		.nullish()

export const vatRateCreateSchema = z.object({
	name: z.string().trim().min(1).max(120),
	percentage: z.coerce.number().nonnegative(),
	description: optionalTrimmedString(255),
	isDefault: z.boolean().nullish(),
})

export const vatRateUpdateSchema = vatRateCreateSchema.partial().extend({
	id: z.string().trim().min(1),
})

export type VatRateCreateInput = z.infer<typeof vatRateCreateSchema>
export type VatRateUpdateInput = z.infer<typeof vatRateUpdateSchema>
