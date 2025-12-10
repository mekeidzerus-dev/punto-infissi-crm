import { z } from 'zod'

export const documentStatusTypeOrderSchema = z.object({
	order: z.coerce.number().int().min(0).nullish(),
	direction: z.enum(['up', 'down']).nullish(),
})

export const documentStatusTypeReorderSchema = z.object({
	items: z
		.array(
			z.object({
				id: z.number().int().positive(),
				order: z.number().int().min(0),
			})
		)
		.min(1),
})

export type DocumentStatusTypeOrderInput = z.infer<typeof documentStatusTypeOrderSchema>
export type DocumentStatusTypeReorderInput = z.infer<typeof documentStatusTypeReorderSchema>
