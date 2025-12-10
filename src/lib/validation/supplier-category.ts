import { z } from 'zod'

export const supplierCategoryQuerySchema = z.object({
	supplierId: z.coerce.number().int().positive().nullish(),
	categoryId: z.string().trim().min(1).nullish(),
})

export const supplierCategoryCreateSchema = z.object({
	supplierId: z.coerce.number().int().positive(),
	categoryId: z.string().trim().min(1),
	parameters: z.array(z.record(z.any())).nullish(),
})

export const supplierCategoryDeleteSchema = supplierCategoryCreateSchema.pick({
	supplierId: true,
	categoryId: true,
})

export type SupplierCategoryQueryInput = z.infer<typeof supplierCategoryQuerySchema>
export type SupplierCategoryCreateInput = z.infer<typeof supplierCategoryCreateSchema>
export type SupplierCategoryDeleteInput = z.infer<typeof supplierCategoryDeleteSchema>
