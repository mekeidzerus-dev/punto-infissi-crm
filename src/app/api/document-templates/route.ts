import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseJson, success, withApiHandler } from '@/lib/api-handler'
import {
	buildDocumentTemplateCreateData,
	parseDocumentTemplateQuery,
	documentTemplateCreateBodySchema,
} from './helpers'
import { getCurrentOrganizationId } from '@/lib/organization-context'

export const GET = withApiHandler(async (request: NextRequest) => {
	const query = parseDocumentTemplateQuery(request.nextUrl.searchParams)
	const organizationId = await getCurrentOrganizationId()

	const templates = await prisma.documentTemplate.findMany({
		where: {
			isActive: true,
			...(query.type ? { type: query.type } : {}),
			...(organizationId ? { organizationId } : {}),
		},
		orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
	})

	return success(templates)
})

export const POST = withApiHandler(async (request: NextRequest) => {
	const payload = await parseJson(request, documentTemplateCreateBodySchema)
	const organizationId = await getCurrentOrganizationId()

	if (payload.isDefault) {
		await prisma.documentTemplate.updateMany({
			where: {
				type: payload.type,
				isDefault: true,
				...(organizationId ? { organizationId } : {}),
			},
			data: { isDefault: false },
		})
	}

	const template = await prisma.documentTemplate.create({
		data: await buildDocumentTemplateCreateData(payload),
	})

	return success(template, 201)
})
