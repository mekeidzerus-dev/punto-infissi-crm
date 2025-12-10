import { z } from 'zod'

const nullishString = (max = 255) => z.string().trim().max(max).nullish()

export const categoryBaseSchema = z.object({
	name: z.string().trim().min(1).max(255),
	description: nullishString(1024),
	icon: z.string().trim().min(1).max(5000), // Увеличено для SVG иконок
	isActive: z.boolean().nullish(),
})

export const categoryCreateSchema = categoryBaseSchema
export const categoryUpdateSchema = categoryBaseSchema.partial().extend({
	id: z.string().trim().min(1),
})

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>
