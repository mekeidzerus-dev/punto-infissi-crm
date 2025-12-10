import { z } from 'zod'

const nullishString = (max = 255) => z.string().trim().max(max).nullish()

export const clientTypeEnum = z.enum(['individual', 'company'])

export const clientBaseSchema = z.object({
	type: clientTypeEnum.nullish(),
	firstName: nullishString(120),
	lastName: nullishString(120),
	companyName: nullishString(255),
	phone: z
		.string()
		.trim()
		.refine(val => val === '' || val.length >= 3, {
			message: 'Phone must be at least 3 characters',
		})
		.refine(val => val === '' || val.length <= 32, {
			message: 'Phone must be at most 32 characters',
		})
		.transform(val => (val === '' ? null : val))
		.nullish(),
	email: z
		.string()
		.trim()
		.refine(val => val === '' || z.string().email().safeParse(val).success, {
			message: 'Invalid email format',
		})
		.transform(val => (val === '' ? null : val))
		.nullish(),
	address: nullishString(255),
	codiceFiscale: nullishString(32),
	partitaIVA: nullishString(32),
	legalAddress: nullishString(255),
	contactPerson: nullishString(120),
	source: nullishString(120),
	notes: nullishString(2048),
})

export const clientCreateSchema = clientBaseSchema
export const clientUpdateSchema = clientBaseSchema.partial().extend({
	id: z.number().int().positive(),
})

export type ClientCreateInput = z.infer<typeof clientCreateSchema>
export type ClientUpdateInput = z.infer<typeof clientUpdateSchema>
