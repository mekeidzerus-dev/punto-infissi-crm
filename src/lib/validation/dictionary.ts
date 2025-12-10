import { z } from 'zod'

const nullishString = (max = 255) => z.string().trim().max(max).nullish()

export const dictionaryTypeSchema = z.string().trim().min(1).max(64)

export const dictionaryCreateSchema = z.object({
	type: dictionaryTypeSchema,
	name: z.string().trim().min(1).max(255),
	isActive: z.boolean().nullish(),
})

export const dictionaryUpdateSchema = z.object({
	id: z.number().int().positive(),
	name: z.string().trim().min(1).max(255),
	isActive: z.boolean(),
})

export const dictionaryQuerySchema = z.object({
	type: nullishString(64),
})

export type DictionaryCreateInput = z.infer<typeof dictionaryCreateSchema>
export type DictionaryUpdateInput = z.infer<typeof dictionaryUpdateSchema>
