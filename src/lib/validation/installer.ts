import { z } from 'zod'

const nullishString = (max = 255) => z.string().trim().max(max).nullish()
const nullishInt = () => z.coerce.number().int().min(0).max(80).nullish()
const nullishDecimal = () => z.coerce.number().min(0).nullish()

export const installerTypeEnum = z.enum(['individual', 'ip', 'company'])
export const installerAvailabilityEnum = z.enum(['available', 'busy', 'vacation'])
export const installerStatusEnum = z.enum(['active', 'inactive'])
export const rateTypeEnum = z.enum(['per-unit', 'per-hour', 'per-project']).nullish()

export const installerBaseSchema = z.object({
	type: installerTypeEnum.nullish(),
	name: z.string().trim().min(1).max(255),
	phone: z.string().trim().min(3).max(32),
	email: z.string().trim().email().nullish(),
	specialization: nullishString(120),
	experience: nullishInt(),
	hasTools: z.coerce.boolean().nullish(),
	hasTransport: z.coerce.boolean().nullish(),
	rateType: rateTypeEnum,
	ratePrice: nullishDecimal(),
	schedule: nullishString(255),
	availability: installerAvailabilityEnum.nullish(),
	rating: z.coerce.number().int().min(0).max(5).nullish(),
	status: installerStatusEnum.nullish(),
	notes: nullishString(2048),
})

export const installerCreateSchema = installerBaseSchema
export const installerUpdateSchema = installerBaseSchema.partial().extend({
	id: z.number().int().positive(),
})

export type InstallerCreateInput = z.infer<typeof installerCreateSchema>
export type InstallerUpdateInput = z.infer<typeof installerUpdateSchema>
