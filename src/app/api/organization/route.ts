import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseJson, success, withApiHandler } from '@/lib/api-handler'
import {
	buildOrganizationUpdateData,
	ensureOrganization,
	organizationUpdateBodySchema,
} from './helpers'

export const GET = withApiHandler(async () => {
	const organization = await ensureOrganization()

	return success(organization)
})

export const PUT = withApiHandler(async (request: NextRequest) => {
	const payload = await parseJson(request, organizationUpdateBodySchema)

	const organization = await ensureOrganization()

	const updated = await prisma.organization.update({
		where: { id: organization.id },
		data: buildOrganizationUpdateData(payload),
	})

	return success(updated)
})
