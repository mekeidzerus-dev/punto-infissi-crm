import { z } from 'zod'

const optionalJson = z.union([z.record(z.any()), z.array(z.any())]).nullish()

export const supplierParameterOverrideCreateSchema = z.object({
	parameterId: z.string().trim().min(1),
	customValues: optionalJson,
	minValue: z.coerce.number().finite().nullish(),
	maxValue: z.coerce.number().finite().nullish(),
	isAvailable: z.boolean().nullish(),
})

export const supplierParameterOverrideUpdateSchema = z.object({
	customValues: optionalJson,
	minValue: z.coerce.number().finite().nullish(),
	maxValue: z.coerce.number().finite().nullish(),
	isAvailable: z.boolean().nullish(),
})

export type SupplierParameterOverrideCreateInput = z.infer<
	typeof supplierParameterOverrideCreateSchema
>
export type SupplierParameterOverrideUpdateInput = z.infer<
	typeof supplierParameterOverrideUpdateSchema
>
