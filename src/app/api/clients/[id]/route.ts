import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { ApiError, parseJson, success, withApiHandler } from '@/lib/api-handler'
import { clientUpdateSchema } from '@/lib/validation/client'
import {
	buildClientUpdateData,
	ensureClientId,
} from '../helpers'
import { getCurrentOrganizationId } from '@/lib/organization-context'

const clientUpdateBodySchema = clientUpdateSchema.omit({ id: true })

type Params = Record<string, string | string[]>

function extractId(params?: Params): number {
	const raw = params?.id
	const value = Array.isArray(raw) ? raw[0] ?? null : raw ?? null
	return ensureClientId(value)
}

export const GET = withApiHandler(async (_request, { params }) => {
	const id = extractId(params)
	const organizationId = await getCurrentOrganizationId()
	logger.info('🔍 Fetching client by id', { id, organizationId })

	const client = await prisma.client.findFirst({
		where: {
			id,
			...(organizationId ? { organizationId } : {}),
		},
	})

	if (!client) {
		throw new ApiError(404, 'Client not found')
	}

	return success(client)
})

export const PUT = withApiHandler(async (request: NextRequest, { params }) => {
	const id = extractId(params)
	const organizationId = await getCurrentOrganizationId()
	const payload = await parseJson(request, clientUpdateBodySchema)
	logger.info('📝 Updating client via /[id]', { id, organizationId })

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

	try {
		const client = await prisma.client.update({
			where: { id },
			data: buildClientUpdateData({ ...payload, id }),
		})

		return success(client)
	} catch (error) {
		logger.error('❌ Error updating client via /[id]', error)
		throw error
	}
})

export const DELETE = withApiHandler(async (_request, { params }) => {
	const id = extractId(params)
	const organizationId = await getCurrentOrganizationId()
	logger.info('🗑️ Deleting client via /[id]', { id, organizationId })

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

	// Проверяем наличие связанных предложений (только текущей организации)
	const proposalsCount = await prisma.proposalDocument.count({
		where: {
			clientId: id,
			...(organizationId ? { organizationId } : {}),
		},
	})

	if (proposalsCount > 0) {
		const message =
			proposalsCount === 1
				? 'Impossibile eliminare il cliente: esiste ancora un preventivo associato. Elimina o modifica il preventivo prima di procedere.'
				: `Impossibile eliminare il cliente: esistono ancora ${proposalsCount} preventivi associati. Elimina o modifica i preventivi prima di procedere.`
		throw new ApiError(409, message)
	}

	// Проверяем наличие связанных заказов (только текущей организации)
	const ordersCount = await prisma.order.count({
		where: {
			clientId: id,
			...(organizationId ? { organizationId } : {}),
		},
	})

	if (ordersCount > 0) {
		const message =
			ordersCount === 1
				? 'Impossibile eliminare il cliente: esiste ancora un ordine associato. Elimina o modifica l\'ordine prima di procedere.'
				: `Impossibile eliminare il cliente: esistono ancora ${ordersCount} ordini associati. Elimina o modifica gli ordini prima di procedere.`
		throw new ApiError(409, message)
	}

	await prisma.client.delete({ where: { id } })

	return success({ success: true })
})
