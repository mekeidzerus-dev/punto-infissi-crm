import { prisma } from '@/lib/prisma'
import { organizationUpdateSchema, type OrganizationUpdateInput } from '@/lib/validation/organization'

export const organizationUpdateBodySchema = organizationUpdateSchema

export async function ensureOrganization() {
	const existing = await prisma.organization.findFirst({ include: { settings: true } })
	if (existing) return existing

	return prisma.organization.create({
		data: {
			name: 'MODOCRM',
			slug: 'modocrm',
			logoUrl: null,
			faviconUrl: null,
			primaryColor: '#dc2626',
			currency: 'EUR',
			timezone: 'Europe/Rome',
			language: 'it',
		},
		include: { settings: true },
	})
}

export function buildOrganizationUpdateData(input: OrganizationUpdateInput) {
	const data: Record<string, unknown> = {}

	if (input.name !== undefined) data.name = input.name ?? 'MODOCRM'
	if (input.logoUrl !== undefined) data.logoUrl = input.logoUrl ?? null
	if (input.faviconUrl !== undefined) data.faviconUrl = input.faviconUrl ?? null
	if (input.primaryColor !== undefined) data.primaryColor = input.primaryColor ?? '#dc2626'
	if (input.phone !== undefined) data.phone = input.phone ?? null
	if (input.email !== undefined) data.email = input.email ?? null
	if (input.address !== undefined) data.address = input.address ?? null
	if (input.currency !== undefined) data.currency = input.currency ?? 'EUR'

	return data
}
