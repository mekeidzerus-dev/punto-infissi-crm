import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - получить всех поставщиков
export async function GET() {
	try {
		const suppliers = await prisma.supplier.findMany({
			orderBy: { createdAt: 'desc' },
		})

		return NextResponse.json(suppliers)
	} catch (error) {
		console.error('Error fetching suppliers:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch suppliers' },
			{ status: 500 }
		)
	}
}

// POST - создать поставщика
export async function POST(request: NextRequest) {
	try {
		const body = await request.json()

		const supplier = await prisma.supplier.create({
			data: {
				name: body.name,
				phone: body.phone,
				email: body.email,
				contactPerson: body.contactPerson,
				address: body.address,
				codiceFiscale: body.codiceFiscale,
				partitaIVA: body.partitaIVA,
				legalAddress: body.legalAddress,
				paymentTerms: body.paymentTerms,
				deliveryDays: body.deliveryDays ? parseInt(body.deliveryDays) : null,
				minOrderAmount: body.minOrderAmount
					? parseFloat(body.minOrderAmount)
					: null,
				rating: body.rating ? parseInt(body.rating) : 5,
				status: body.status || 'active',
				notes: body.notes,
			},
		})

		return NextResponse.json(supplier, { status: 201 })
	} catch (error) {
		console.error('Error creating supplier:', error)
		return NextResponse.json(
			{ error: 'Failed to create supplier' },
			{ status: 500 }
		)
	}
}

// PUT - обновить поставщика
export async function PUT(request: NextRequest) {
	try {
		const body = await request.json()
		const { id, ...data } = body

		const supplier = await prisma.supplier.update({
			where: { id: parseInt(id) },
			data: {
				name: data.name,
				phone: data.phone,
				email: data.email,
				contactPerson: data.contactPerson,
				address: data.address,
				codiceFiscale: data.codiceFiscale,
				partitaIVA: data.partitaIVA,
				legalAddress: data.legalAddress,
				paymentTerms: data.paymentTerms,
				deliveryDays: data.deliveryDays ? parseInt(data.deliveryDays) : null,
				minOrderAmount: data.minOrderAmount
					? parseFloat(data.minOrderAmount)
					: null,
				rating: data.rating ? parseInt(data.rating) : 5,
				status: data.status,
				notes: data.notes,
			},
		})

		return NextResponse.json(supplier)
	} catch (error) {
		console.error('Error updating supplier:', error)
		return NextResponse.json(
			{ error: 'Failed to update supplier' },
			{ status: 500 }
		)
	}
}

// DELETE - удалить поставщика
export async function DELETE(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const id = searchParams.get('id')

		if (!id) {
			return NextResponse.json({ error: 'ID is required' }, { status: 400 })
		}

		await prisma.supplier.delete({
			where: { id: parseInt(id) },
		})

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error deleting supplier:', error)
		return NextResponse.json(
			{ error: 'Failed to delete supplier' },
			{ status: 500 }
		)
	}
}
