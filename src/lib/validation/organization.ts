import { z } from 'zod'

const optionalTrimmedString = (max: number) =>
	z
		.string()
		.trim()
		.max(max)
		.nullish()

export const organizationUpdateSchema = z.object({
	name: optionalTrimmedString(120),
	logoUrl: optionalTrimmedString(512),
	faviconUrl: optionalTrimmedString(512),
	primaryColor: optionalTrimmedString(16),
	phone: optionalTrimmedString(32),
	email: optionalTrimmedString(120),
	address: optionalTrimmedString(255),
	currency: optionalTrimmedString(16),
})

export type OrganizationUpdateInput = z.infer<typeof organizationUpdateSchema>
