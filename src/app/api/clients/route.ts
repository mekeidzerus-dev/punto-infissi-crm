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

export const dynamic = 'force-dynamic'

export const GET = withApiHandler(async () => {
	// #region agent log
	const fs = require('fs')
	const logPath =
		'/Users/ruslanmekeidze/Desktop/mini-website/MODOCRM/src/app/api/user/profile/.cursor/debug.log'
	const logEntry1 =
		JSON.stringify({
			location: 'api/clients/route.ts:15',
			message: 'GET /api/clients called',
			data: {},
			timestamp: Date.now(),
			sessionId: 'debug-session',
			runId: 'run1',
			hypothesisId: 'D',
		}) + '\n'
	try {
		fs.appendFileSync(logPath, logEntry1)
	} catch {}
	// #endregion

	const user = await requireAuth()
	await updateUserActivity(user.id)

	// #region agent log
	const logEntry2 =
		JSON.stringify({
			location: 'api/clients/route.ts:17',
			message: 'User authenticated',
			data: { userId: user.id, organizationId: user.organizationId },
			timestamp: Date.now(),
			sessionId: 'debug-session',
			runId: 'run1',
			hypothesisId: 'D',
		}) + '\n'
	try {
		fs.appendFileSync(logPath, logEntry2)
	} catch {}
	// #endregion

	logger.info('🔍 Fetching clients from database...', {
		userId: user.id,
		userOrganizationId: user.organizationId,
	})
	const organizationId = await getCurrentOrganizationId()
	logger.info('Organization ID from session:', { organizationId })

	// Если organizationId есть в сессии, используем его, иначе используем из user
	const finalOrganizationId = organizationId || user.organizationId
	logger.info('Final organization ID for query:', { finalOrganizationId })

	// #region agent log
	const logEntry3 =
		JSON.stringify({
			location: 'api/clients/route.ts:27',
			message: 'Before database query',
			data: { finalOrganizationId },
			timestamp: Date.now(),
			sessionId: 'debug-session',
			runId: 'run1',
			hypothesisId: 'D',
		}) + '\n'
	try {
		fs.appendFileSync(logPath, logEntry3)
	} catch {}
	// #endregion

	const clients = await prisma.client.findMany({
		where: finalOrganizationId
			? { organizationId: finalOrganizationId }
			: undefined,
		include: {
			_count: {
				select: {
					orders: true,
				},
			},
		},
		orderBy: { createdAt: 'desc' },
	})

	// #region agent log
	const logEntry4 =
		JSON.stringify({
			location: 'api/clients/route.ts:40',
			message: 'Database query completed',
			data: { clientsCount: clients.length, finalOrganizationId },
			timestamp: Date.now(),
			sessionId: 'debug-session',
			runId: 'run1',
			hypothesisId: 'D',
		}) + '\n'
	try {
		fs.appendFileSync(logPath, logEntry4)
	} catch {}
	// #endregion

	logger.info(
		`✅ Found ${clients.length} clients for organization ${finalOrganizationId}`
	)
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

	logger.info('✅ Client created:', {
		id: client.id,
		organizationId: client.organizationId,
	})
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
