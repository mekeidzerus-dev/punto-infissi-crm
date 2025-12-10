import { z } from 'zod'

const nullishString = (max = 255) => z.string().trim().max(max).nullish()
const nullishDecimal = () => z.coerce.number().min(0).max(100).nullish()

export const partnerStatusEnum = z.enum(['active', 'inactive'])

export const partnerBaseSchema = z.object({
	name: z.string().trim().min(1).max(255),
	phone: z.string().trim().min(3).max(32),
	email: z.string().trim().email().nullish(),
	contactPerson: nullishString(120),
	address: nullishString(255),
	type: nullishString(120),
	region: nullishString(120),
	commission: nullishDecimal(),
	codiceFiscale: nullishString(32),
	partitaIVA: nullishString(32),
	legalAddress: nullishString(255),
	status: partnerStatusEnum.nullish(),
	notes: nullishString(2048),
})

export const partnerCreateSchema = partnerBaseSchema
export const partnerUpdateSchema = partnerBaseSchema.partial().extend({
	id: z.number().int().positive(),
})

export type PartnerCreateInput = z.infer<typeof partnerCreateSchema>
export type PartnerUpdateInput = z.infer<typeof partnerUpdateSchema>
