import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

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

		console.log(`🔍 Fetching client: ${clientId}`)

		const client = await prisma.client.findUnique({
			where: { id: clientId },
		})

		if (!client) {
			console.log(`❌ Client not found: ${clientId}`)
			return NextResponse.json({ error: 'Client not found' }, { status: 404 })
		}

		console.log(`✅ Found client: ${client.firstName} ${client.lastName}`)
		return NextResponse.json(client)
	} catch (error) {
		console.error('❌ Error fetching client:', error)
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
		console.log(`📝 Updating client: ${clientId}`)

		// Проверяем что клиент существует
		const existingClient = await prisma.client.findUnique({
			where: { id: clientId },
		})

		if (!existingClient) {
			console.log(`❌ Client not found: ${clientId}`)
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

		console.log(
			`✅ Updated client: ${updatedClient.firstName} ${updatedClient.lastName}`
		)
		return NextResponse.json(updatedClient)
	} catch (error) {
		console.error('❌ Error updating client:', error)
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

		console.log(`🗑️ Deleting client: ${clientId}`)

		// Проверяем что клиент существует
		const existingClient = await prisma.client.findUnique({
			where: { id: clientId },
		})

		if (!existingClient) {
			console.log(`❌ Client not found: ${clientId}`)
			return NextResponse.json({ error: 'Client not found' }, { status: 404 })
		}

		// Удаляем клиента
		await prisma.client.delete({
			where: { id: clientId },
		})

		console.log(
			`✅ Deleted client: ${existingClient.firstName} ${existingClient.lastName}`
		)
		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('❌ Error deleting client:', error)
		return NextResponse.json(
			{ error: 'Failed to delete client' },
			{ status: 500 }
		)
	}
}
