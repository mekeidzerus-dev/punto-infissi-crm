import { z } from 'zod'

const optionalTrimmedString = (max: number) =>
	z
		.string()
		.trim()
		.max(max)
		.nullish()

export const documentTemplateQuerySchema = z.object({
	type: optionalTrimmedString(64),
})

const documentTemplateBaseSchema = z.object({
	name: z.string().trim().min(1).max(255),
	type: z.string().trim().min(1).max(64),
	contentRu: z.string().trim().min(1).nullish(),
	contentIt: z.string().trim().min(1).nullish(),
	isDefault: z.boolean().nullish(),
})

export const documentTemplateCreateSchema = documentTemplateBaseSchema.refine(
	data => data.contentRu || data.contentIt,
	{
		message: 'At least one language content is required',
		path: ['contentRu'],
	}
)

export const documentTemplateUpdateSchema = documentTemplateBaseSchema.partial().extend({
	id: z.string().trim().min(1),
})

export type DocumentTemplateCreateInput = z.infer<typeof documentTemplateCreateSchema>
export type DocumentTemplateUpdateInput = z.infer<typeof documentTemplateUpdateSchema>
export type DocumentTemplateQueryInput = z.infer<typeof documentTemplateQuerySchema>
