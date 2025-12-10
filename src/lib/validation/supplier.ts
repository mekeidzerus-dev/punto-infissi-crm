import { z } from 'zod'

const nullishString = (max = 255) => z.string().trim().max(max).nullish()
const nullishInt = () => z.coerce.number().int().min(0).nullish()
const nullishDecimal = () => z.coerce.number().min(0).nullish()

export const supplierStatusEnum = z.enum(['active', 'inactive'])

export const supplierBaseSchema = z.object({
	name: z.string().trim().min(1).max(255),
	shortName: nullishString(120),
	shortNameIt: nullishString(120),
	phone: z.string().trim().min(3).max(32),
	email: z
		.union([
			z.string().trim().email(),
			z.literal('').transform(() => null),
		])
		.nullish(),
	contactPerson: nullishString(120),
	address: nullishString(255),
	codiceFiscale: nullishString(32),
	partitaIVA: nullishString(32),
	legalAddress: nullishString(255),
	paymentTerms: nullishString(120),
	deliveryDays: nullishInt(),
	minOrderAmount: nullishDecimal(),
	rating: z.coerce.number().int().min(0).max(5).nullish(),
	status: supplierStatusEnum.nullish(),
	notes: nullishString(2048),
})

export const supplierCreateSchema = supplierBaseSchema
export const supplierUpdateSchema = supplierBaseSchema.partial().extend({
	id: z.number().int().positive(),
})

export type SupplierCreateInput = z.infer<typeof supplierCreateSchema>
export type SupplierUpdateInput = z.infer<typeof supplierUpdateSchema>
