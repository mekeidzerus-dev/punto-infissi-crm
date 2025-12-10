import { NextRequest } from 'next/server'
import type { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ApiError, parseJson, success, withApiHandler } from '@/lib/api-handler'
import {
	buildDocumentTemplateUpdateData,
	documentTemplateUpdateBodySchema,
	ensureDocumentTemplateId,
} from '../helpers'
import { getCurrentOrganizationId } from '@/lib/organization-context'

const updateBodyWithoutId = documentTemplateUpdateBodySchema.omit({ id: true })

type DocumentTemplateUpdatePayload = z.infer<typeof updateBodyWithoutId>

export const PUT = withApiHandler(async (request: NextRequest, { params }) => {
	const id = ensureDocumentTemplateId(params?.id as string)
	const payload: DocumentTemplateUpdatePayload = await parseJson(request, updateBodyWithoutId)
	const organizationId = await getCurrentOrganizationId()

	// Проверяем принадлежность записи к организации
	const template = await prisma.documentTemplate.findFirst({
		where: {
			id,
			...(organizationId ? { organizationId } : {}),
		},
	})

	if (!template) {
		throw new ApiError(404, 'Document template not found')
	}

	if (payload.isDefault) {
		await prisma.documentTemplate.updateMany({
			where: {
				type: template.type,
				id: { not: id },
				isDefault: true,
				...(organizationId ? { organizationId } : {}),
			},
			data: { isDefault: false },
		})
	}

	const updated = await prisma.documentTemplate.update({
		where: { id },
		data: buildDocumentTemplateUpdateData({ ...payload, id }),
	})

	return success(updated)
})

export const DELETE = withApiHandler(async (_request, { params }) => {
	const id = ensureDocumentTemplateId(params?.id as string)
	const organizationId = await getCurrentOrganizationId()

	// Проверяем принадлежность записи к организации
	const existing = await prisma.documentTemplate.findFirst({
		where: {
			id,
			...(organizationId ? { organizationId } : {}),
		},
	})

	if (!existing) {
		throw new ApiError(404, 'Document template not found')
	}

	await prisma.documentTemplate.delete({ where: { id } })

	return success({ success: true })
})