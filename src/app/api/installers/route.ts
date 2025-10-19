import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - получить всех монтажников
export async function GET() {
	try {
		const installers = await prisma.installer.findMany({
			orderBy: { createdAt: 'desc' },
		})

		return NextResponse.json(installers)
	} catch (error) {
		console.error('Error fetching installers:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch installers' },
			{ status: 500 }
		)
	}
}

// POST - создать монтажника
export async function POST(request: NextRequest) {
	try {
		const body = await request.json()

		const installer = await prisma.installer.create({
			data: {
				type: body.type || 'individual',
				name: body.name,
				phone: body.phone,
				email: body.email,
				specialization: body.specialization,
				experience: body.experience ? parseInt(body.experience) : null,
				hasTools: body.hasTools === 'yes',
				hasTransport: body.hasTransport === 'yes',
				rateType: body.rateType,
				ratePrice: body.ratePrice ? parseFloat(body.ratePrice) : null,
				schedule: body.schedule,
				availability: body.availability || 'available',
				rating: body.rating ? parseInt(body.rating) : 5,
				status: body.status || 'active',
				notes: body.notes,
			},
		})

		return NextResponse.json(installer, { status: 201 })
	} catch (error) {
		console.error('Error creating installer:', error)
		return NextResponse.json(
			{ error: 'Failed to create installer' },
			{ status: 500 }
		)
	}
}

// PUT - обновить монтажника
export async function PUT(request: NextRequest) {
	try {
		const body = await request.json()
		const { id, ...data } = body

		const installer = await prisma.installer.update({
			where: { id: parseInt(id) },
			data: {
				type: data.type,
				name: data.name,
				phone: data.phone,
				email: data.email,
				specialization: data.specialization,
				experience: data.experience ? parseInt(data.experience) : null,
				hasTools: data.hasTools === 'yes',
				hasTransport: data.hasTransport === 'yes',
				rateType: data.rateType,
				ratePrice: data.ratePrice ? parseFloat(data.ratePrice) : null,
				schedule: data.schedule,
				availability: data.availability,
				rating: data.rating ? parseInt(data.rating) : 5,
				status: data.status,
				notes: data.notes,
			},
		})

		return NextResponse.json(installer)
	} catch (error) {
		console.error('Error updating installer:', error)
		return NextResponse.json(
			{ error: 'Failed to update installer' },
			{ status: 500 }
		)
	}
}

// DELETE - удалить монтажника
export async function DELETE(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const id = searchParams.get('id')

		if (!id) {
			return NextResponse.json({ error: 'ID is required' }, { status: 400 })
		}

		await prisma.installer.delete({
			where: { id: parseInt(id) },
		})

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error deleting installer:', error)
		return NextResponse.json(
			{ error: 'Failed to delete installer' },
			{ status: 500 }
		)
	}
}
