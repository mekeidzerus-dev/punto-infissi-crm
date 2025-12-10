import { z } from 'zod'

const optionalString = (max: number) =>
	z
		.string()
		.trim()
		.max(max)
		.nullish()

export const configuratorDraftQuerySchema = z.object({
	userId: optionalString(128),
	sessionId: optionalString(128),
}).refine(data => data.userId || data.sessionId, {
	message: 'Either userId or sessionId is required',
})

export const configuratorDraftCreateSchema = z.object({
	userId: optionalString(128),
	sessionId: optionalString(128),
	currentStep: z.coerce.number().int().min(1).max(3).nullish(),
	selectedCategoryId: optionalString(64),
	selectedSupplierId: z.coerce.number().int().positive().nullish(),
	configuration: z.record(z.any()).nullish(),
}).refine(data => data.userId || data.sessionId, {
	message: 'Either userId or sessionId is required',
})

export type ConfiguratorDraftQueryInput = z.infer<typeof configuratorDraftQuerySchema>
export type ConfiguratorDraftCreateInput = z.infer<
	typeof configuratorDraftCreateSchema
>
