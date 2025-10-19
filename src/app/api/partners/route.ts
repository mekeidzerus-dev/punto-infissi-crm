import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - получить всех партнеров
export async function GET() {
	try {
		const partners = await prisma.partner.findMany({
			orderBy: { createdAt: 'desc' },
		})

		return NextResponse.json(partners)
	} catch (error) {
		console.error('Error fetching partners:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch partners' },
			{ status: 500 }
		)
	}
}

// POST - создать партнера
export async function POST(request: NextRequest) {
	try {
		const body = await request.json()

		const partner = await prisma.partner.create({
			data: {
				name: body.name,
				phone: body.phone,
				email: body.email,
				contactPerson: body.contactPerson,
				address: body.address,
				type: body.type,
				region: body.region,
				commission: body.commission ? parseFloat(body.commission) : null,
				codiceFiscale: body.codiceFiscale,
				partitaIVA: body.partitaIVA,
				legalAddress: body.legalAddress,
				status: body.status || 'active',
				notes: body.notes,
			},
		})

		return NextResponse.json(partner, { status: 201 })
	} catch (error) {
		console.error('Error creating partner:', error)
		return NextResponse.json(
			{ error: 'Failed to create partner' },
			{ status: 500 }
		)
	}
}

// PUT - обновить партнера
export async function PUT(request: NextRequest) {
	try {
		const body = await request.json()
		const { id, ...data } = body

		const partner = await prisma.partner.update({
			where: { id: parseInt(id) },
			data: {
				name: data.name,
				phone: data.phone,
				email: data.email,
				contactPerson: data.contactPerson,
				address: data.address,
				type: data.type,
				region: data.region,
				commission: data.commission ? parseFloat(data.commission) : null,
				codiceFiscale: data.codiceFiscale,
				partitaIVA: data.partitaIVA,
				legalAddress: data.legalAddress,
				status: data.status,
				notes: data.notes,
			},
		})

		return NextResponse.json(partner)
	} catch (error) {
		console.error('Error updating partner:', error)
		return NextResponse.json(
			{ error: 'Failed to update partner' },
			{ status: 500 }
		)
	}
}

// DELETE - удалить партнера
export async function DELETE(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const id = searchParams.get('id')

		if (!id) {
			return NextResponse.json({ error: 'ID is required' }, { status: 400 })
		}

		await prisma.partner.delete({
			where: { id: parseInt(id) },
		})

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error deleting partner:', error)
		return NextResponse.json(
			{ error: 'Failed to delete partner' },
			{ status: 500 }
		)
	}
}
