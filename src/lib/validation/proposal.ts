import { z } from 'zod'

const positiveInt = () => z.coerce.number().int().positive()

// Валидация даты: принимает YYYY-MM-DD или ISO datetime строку
const nullableDateString = z
	.union([
		z.string().datetime(), // ISO datetime
		z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
	])
	.nullish()
	.transform((val) => {
		if (!val) return null
		// Если формат YYYY-MM-DD, преобразуем в ISO datetime
		if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
			return new Date(val + 'T00:00:00.000Z').toISOString()
		}
		return val
	})

const nullableTrimmedString = (max: number) =>
	z
		.string()
		.trim()
		.max(max)
		.nullish()

// Валидация statusId: принимает строку или число, преобразует в строку
const nullableStatusId = z.preprocess(
	(val) => {
		if (val === null || val === undefined) return null
		return val
	},
	z.union([z.string(), z.number(), z.null()]).transform((val) => {
		if (val === null || val === undefined) return null
		return String(val)
	})
) as z.ZodType<string | null>

export const proposalPositionSchema = z
	.object({
		categoryId: z.string().trim().min(1),
		supplierCategoryId: z.string().trim().min(1),
		description: nullableTrimmedString(1024),
		unitPrice: z.coerce.number().min(0),
		quantity: z.coerce.number().min(0),
		discount: z.coerce.number().min(0).nullish(),
		vatRate: z.coerce.number().min(0).nullish(),
		total: z.coerce.number().min(0).nullish(),
		vatAmount: z.coerce.number().nullish(),
		configuration: z.record(z.any()).nullish(),
		metadata: z.record(z.any()).nullish(),
		customNotes: nullableTrimmedString(1024),
	})
	.passthrough()

export const proposalGroupSchema = z.object({
	name: z.string().trim().min(1),
	description: nullableTrimmedString(1024),
	positions: z.array(proposalPositionSchema).min(1),
})

export const proposalCreateSchema = z.object({
	clientId: positiveInt(),
	groups: z.array(proposalGroupSchema).min(1),
	vatRate: z.coerce.number().nullish(),
	proposalDate: nullableDateString,
	validUntil: nullableDateString,
	responsibleManager: nullableTrimmedString(255),
	status: nullableTrimmedString(64),
	statusId: nullableStatusId,
	notes: nullableTrimmedString(2000),
})

export const proposalUpdateSchema = proposalCreateSchema.partial()

export type ProposalCreateInput = z.infer<typeof proposalCreateSchema>
export type ProposalGroupInput = z.infer<typeof proposalGroupSchema>
export type ProposalPositionInput = z.infer<typeof proposalPositionSchema>
export type ProposalUpdateInput = z.infer<typeof proposalUpdateSchema>
