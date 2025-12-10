import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { ApiError, parseJson, success, withApiHandler } from '@/lib/api-handler'
import { clientCreateSchema, clientUpdateSchema } from '@/lib/validation/client'
import {
	buildClientCreateData,
	buildClientUpdateData,
	ensureClientId,
} from './helpers'
import { getCurrentOrganizationId } from '@/lib/organization-context'
import { requireAuth } from '@/lib/auth-helpers'
import { updateUserActivity } from '@/lib/activity-tracker'

export const GET = withApiHandler(async () => {
	const user = await requireAuth()
	await updateUserActivity(user.id)
	logger.info('🔍 Fetching clients from database...', {
		userId: user.id,
		userOrganizationId: user.organizationId,
	})
	const organizationId = await getCurrentOrganizationId()
	logger.info('Organization ID from session:', { organizationId })

	// Если organizationId есть в сессии, используем его, иначе используем из user
	const finalOrganizationId = organizationId || user.organizationId
	logger.info('Final organization ID for query:', { finalOrganizationId })

	const clients = await prisma.client.findMany({
		where: finalOrganizationId ? { organizationId: finalOrganizationId } : undefined,
		include: {
			_count: {
				select: {
					orders: true,
				},
			},
		},
		orderBy: { createdAt: 'desc' },
	})

	logger.info(`✅ Found ${clients.length} clients for organization ${finalOrganizationId}`)
	return success(clients)
})

export const POST = withApiHandler(async (request: NextRequest) => {
	const user = await requireAuth()
	await updateUserActivity(user.id)
	const payload = await parseJson(request, clientCreateSchema)
	logger.info('📝 Creating client with data', {
		payload,
		userOrganizationId: user.organizationId,
	})

	const createData = await buildClientCreateData(payload)
	logger.info('Client create data with organizationId:', {
		organizationId: (createData as any).organizationId,
	})

	const client = await prisma.client.create({
		data: createData,
	})

	logger.info('✅ Client created:', { id: client.id, organizationId: client.organizationId })
	return success(client, 201)
})

export const PUT = withApiHandler(async (request: NextRequest) => {
	const user = await requireAuth()
	await updateUserActivity(user.id)
	const payload = await parseJson(request, clientUpdateSchema)
	const organizationId = await getCurrentOrganizationId()
	logger.info('📝 Updating client', { id: payload.id, organizationId })

	// Проверяем принадлежность записи к организации
	const existing = await prisma.client.findFirst({
		where: {
			id: payload.id,
			...(organizationId ? { organizationId } : {}),
		},
	})

	if (!existing) {
		throw new ApiError(404, 'Client not found')
	}

	const client = await prisma.client.update({
		where: { id: payload.id },
		data: buildClientUpdateData(payload),
	})

	return success(client)
})

export const DELETE = withApiHandler(async (request: NextRequest) => {
	const user = await requireAuth()
	await updateUserActivity(user.id)
	const id = ensureClientId(request.nextUrl.searchParams.get('id'))
	const organizationId = await getCurrentOrganizationId()
	logger.info('🗑️ Deleting client', { id, organizationId })

	// Проверяем принадлежность записи к организации
	const existing = await prisma.client.findFirst({
		where: {
			id,
			...(organizationId ? { organizationId } : {}),
		},
	})

	if (!existing) {
		throw new ApiError(404, 'Client not found')
	}

	await prisma.client.delete({
		where: { id },
	})

	return success({ success: true })
})
