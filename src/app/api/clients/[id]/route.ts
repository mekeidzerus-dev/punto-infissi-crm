import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { logger } from '@/lib/logger'

const prisma = new PrismaClient()

// GET /api/clients/[id] - получить клиента по ID
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const clientId = parseInt(params.id)

		if (isNaN(clientId)) {
			return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 })
		}

		logger.info(`🔍 Fetching client: ${clientId}`)

		const client = await prisma.client.findUnique({
			where: { id: clientId },
		})

		if (!client) {
			logger.info(`❌ Client not found: ${clientId}`)
			return NextResponse.json({ error: 'Client not found' }, { status: 404 })
		}

		logger.info(`✅ Found client: ${client.firstName} ${client.lastName}`)
		return NextResponse.json(client)
	} catch (error) {
		logger.error('❌ Error fetching client:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch client' },
			{ status: 500 }
		)
	}
}

// PUT /api/clients/[id] - обновить клиента
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const clientId = parseInt(params.id)

		if (isNaN(clientId)) {
			return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 })
		}

		const data = await request.json()
		logger.info(`📝 Updating client: ${clientId}`)

		// Проверяем что клиент существует
		const existingClient = await prisma.client.findUnique({
			where: { id: clientId },
		})

		if (!existingClient) {
			logger.info(`❌ Client not found: ${clientId}`)
			return NextResponse.json({ error: 'Client not found' }, { status: 404 })
		}

		// Обновляем клиента
		const updatedClient = await prisma.client.update({
			where: { id: clientId },
			data: {
				type: data.type,
				firstName: data.firstName,
				lastName: data.lastName,
				companyName: data.companyName,
				phone: data.phone,
				email: data.email,
				address: data.address,
				codiceFiscale: data.codiceFiscale,
				partitaIVA: data.partitaIVA,
				legalAddress: data.legalAddress,
				contactPerson: data.contactPerson,
				source: data.source,
				notes: data.notes,
				updatedAt: new Date(),
			},
		})

		logger.info(
			`✅ Updated client: ${updatedClient.firstName} ${updatedClient.lastName}`
		)
		return NextResponse.json(updatedClient)
	} catch (error) {
		logger.error('❌ Error updating client:', error)
		return NextResponse.json(
			{ error: 'Failed to update client' },
			{ status: 500 }
		)
	}
}

// DELETE /api/clients/[id] - удалить клиента
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const clientId = parseInt(params.id)

		if (isNaN(clientId)) {
			return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 })
		}

		logger.info(`🗑️ Deleting client: ${clientId}`)

		// Проверяем что клиент существует
		const existingClient = await prisma.client.findUnique({
			where: { id: clientId },
		})

		if (!existingClient) {
			logger.info(`❌ Client not found: ${clientId}`)
			return NextResponse.json({ error: 'Client not found' }, { status: 404 })
		}

		// Удаляем клиента
		await prisma.client.delete({
			where: { id: clientId },
		})

		logger.info(
			`✅ Deleted client: ${existingClient.firstName} ${existingClient.lastName}`
		)
		return NextResponse.json({ success: true })
	} catch (error) {
		logger.error('❌ Error deleting client:', error)
		return NextResponse.json(
			{ error: 'Failed to delete client' },
			{ status: 500 }
		)
	}
}
