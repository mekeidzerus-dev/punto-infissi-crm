import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - получить всех клиентов
export async function GET() {
	try {
		console.log('🔍 Fetching clients from database...')
		const clients = await prisma.client.findMany({
			orderBy: { createdAt: 'desc' },
			include: {
				_count: {
					select: { orders: true },
				},
			},
		})

		console.log(`✅ Found ${clients.length} clients`)
		return NextResponse.json(clients)
	} catch (error) {
		console.error('❌ Error fetching clients:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch clients', details: String(error) },
			{ status: 500 }
		)
	}
}

// POST - создать клиента
export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		console.log('📝 Creating client with data:', body)

		const client = await prisma.client.create({
			data: {
				type: body.type || 'individual',
				firstName: body.firstName,
				lastName: body.lastName,
				companyName: body.companyName,
				phone: body.phone,
				email: body.email,
				address: body.address,
				codiceFiscale: body.codiceFiscale,
				partitaIVA: body.partitaIVA,
				legalAddress: body.legalAddress,
				contactPerson: body.contactPerson,
				source: body.source,
				notes: body.notes,
			},
		})

		return NextResponse.json(client, { status: 201 })
	} catch (error) {
		console.error('Error creating client:', error)
		return NextResponse.json(
			{ error: 'Failed to create client' },
			{ status: 500 }
		)
	}
}

// PUT - обновить клиента
export async function PUT(request: NextRequest) {
	try {
		const body = await request.json()
		const { id, ...data } = body

		const client = await prisma.client.update({
			where: { id: parseInt(id) },
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
			},
		})

		return NextResponse.json(client)
	} catch (error) {
		console.error('Error updating client:', error)
		return NextResponse.json(
			{ error: 'Failed to update client' },
			{ status: 500 }
		)
	}
}

// DELETE - удалить клиента
export async function DELETE(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const id = searchParams.get('id')

		if (!id) {
			return NextResponse.json({ error: 'ID is required' }, { status: 400 })
		}

		await prisma.client.delete({
			where: { id: parseInt(id) },
		})

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error deleting client:', error)
		return NextResponse.json(
			{ error: 'Failed to delete client' },
			{ status: 500 }
		)
	}
}
