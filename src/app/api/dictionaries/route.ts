import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - получить справочники по типу
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const type = searchParams.get('type')

		const where = type ? { type, isActive: true } : { isActive: true }

		const dictionaries = await prisma.dictionary.findMany({
			where,
			orderBy: { name: 'asc' },
		})

		return NextResponse.json(dictionaries)
	} catch (error) {
		console.error('Error fetching dictionaries:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch dictionaries' },
			{ status: 500 }
		)
	}
}

// POST - создать элемент справочника
export async function POST(request: NextRequest) {
	try {
		const body = await request.json()

		const dictionary = await prisma.dictionary.create({
			data: {
				type: body.type,
				name: body.name,
				isActive: body.isActive !== undefined ? body.isActive : true,
			},
		})

		return NextResponse.json(dictionary, { status: 201 })
	} catch (error) {
		console.error('Error creating dictionary:', error)
		return NextResponse.json(
			{ error: 'Failed to create dictionary' },
			{ status: 500 }
		)
	}
}

// PUT - обновить элемент справочника
export async function PUT(request: NextRequest) {
	try {
		const body = await request.json()
		const { id, ...data } = body

		const dictionary = await prisma.dictionary.update({
			where: { id: parseInt(id) },
			data: {
				name: data.name,
				isActive: data.isActive,
			},
		})

		return NextResponse.json(dictionary)
	} catch (error) {
		console.error('Error updating dictionary:', error)
		return NextResponse.json(
			{ error: 'Failed to update dictionary' },
			{ status: 500 }
		)
	}
}

// DELETE - удалить элемент справочника
export async function DELETE(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const id = searchParams.get('id')

		if (!id) {
			return NextResponse.json({ error: 'ID is required' }, { status: 400 })
		}

		await prisma.dictionary.delete({
			where: { id: parseInt(id) },
		})

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error deleting dictionary:', error)
		return NextResponse.json(
			{ error: 'Failed to delete dictionary' },
			{ status: 500 }
		)
	}
}
