import { z } from 'zod'

const nullishString = (max = 255) => z.string().trim().max(max).nullish()
const hexColor = () =>
	z
		.string()
		.regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Invalid hex color')
		.nullish()

export const documentStatusCreateSchema = z.object({
	name: z.string().trim().min(1).max(64),
	nameRu: z.string().trim().min(1).max(64),
	nameIt: z.string().trim().min(1).max(64),
	color: hexColor(),
	documentTypeIds: z.array(z.number().int().positive()).nullish(),
})

export const documentStatusUpdateSchema = documentStatusCreateSchema.partial().extend({
	id: z.number().int().positive(),
})

export const documentStatusSetDefaultSchema = z.object({
	documentTypeId: z.number().int().positive(),
	isDefault: z.boolean(),
})

export type DocumentStatusCreateInput = z.infer<typeof documentStatusCreateSchema>
export type DocumentStatusUpdateInput = z.infer<typeof documentStatusUpdateSchema>
export type DocumentStatusSetDefaultInput = z.infer<
	typeof documentStatusSetDefaultSchema
>
