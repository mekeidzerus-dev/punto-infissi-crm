import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// GET /api/suppliers - получить всех поставщиков
export async function GET(request: NextRequest) {
	try {
		const suppliers = await prisma.supplier.findMany({
			select: {
				id: true,
				name: true,
				shortName: true,
				shortNameIt: true,
				rating: true,
				notes: true,
				paymentTerms: true,
				deliveryDays: true,
				minOrderAmount: true,
				contactPerson: true,
				email: true,
				phone: true,
				address: true,
				status: true,
				// Подсчитываем количество переопределений параметров
				parameterOverrides: {
					select: {
						id: true,
					},
				},
				// Подсчитываем количество связанных категорий
				productCategories: {
					select: {
						id: true,
					},
				},
			},
			orderBy: {
				name: 'asc',
			},
		})

		// Формируем ответ с полной информацией
		const suppliersWithFullData = suppliers.map(supplier => ({
			id: supplier.id,
			name: supplier.name,
			shortName: supplier.shortName || null,
			shortNameIt: supplier.shortNameIt || null,
			rating: supplier.rating || 0,
			logo: null, // Пока нет поля logo в схеме
			notes: supplier.notes || '',
			paymentTerms: supplier.paymentTerms || '',
			deliveryDays: supplier.deliveryDays || 0,
			minOrderAmount: supplier.minOrderAmount || 0,
			contactPerson: supplier.contactPerson || '',
			email: supplier.email || '',
			phone: supplier.phone || '',
			address: supplier.address || '',
			status: supplier.status || 'active',
			parametersCount: supplier.parameterOverrides.length,
			categoriesCount: supplier.productCategories.length,
		}))

		return NextResponse.json(suppliersWithFullData)
	} catch (error) {
		logger.error('Error fetching suppliers:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch suppliers' },
			{ status: 500 }
		)
	}
}

// POST /api/suppliers - создать нового поставщика
export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const {
			name,
			shortName,
			shortNameIt,
			phone,
			email,
			contactPerson,
			address,
			codiceFiscale,
			partitaIVA,
			legalAddress,
			paymentTerms,
			deliveryDays,
			minOrderAmount,
			rating,
			status,
			notes,
		} = body

		// Валидация обязательных полей
		if (!name || !phone || !email) {
			return NextResponse.json(
				{ error: 'Name, phone, and email are required' },
				{ status: 400 }
			)
		}

		const newSupplier = await prisma.supplier.create({
			data: {
				name,
				shortName: shortName || null,
				shortNameIt: shortNameIt || null,
				phone,
				email,
				contactPerson: contactPerson || '',
				address: address || '',
				codiceFiscale: codiceFiscale || '',
				partitaIVA: partitaIVA || null,
				legalAddress: legalAddress || '',
				paymentTerms: paymentTerms || '',
				deliveryDays: deliveryDays ? parseInt(deliveryDays) : 0,
				minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : 0,
				rating: rating ? parseInt(rating) : 0,
				status: status || 'active',
				notes: notes || '',
			},
		})

		logger.info(`✅ Created supplier: ${newSupplier.name}`)
		return NextResponse.json(newSupplier, { status: 201 })
	} catch (error) {
		logger.error('❌ Error creating supplier:', error)
		return NextResponse.json(
			{ error: 'Failed to create supplier' },
			{ status: 500 }
		)
	}
}

// PUT /api/suppliers - обновить существующего поставщика
export async function PUT(request: NextRequest) {
	try {
		const body = await request.json()
		const {
			id,
			name,
			shortName,
			shortNameIt,
			phone,
			email,
			contactPerson,
			address,
			codiceFiscale,
			partitaIVA,
			legalAddress,
			paymentTerms,
			deliveryDays,
			minOrderAmount,
			rating,
			status,
			notes,
		} = body

		// Валидация ID
		if (!id) {
			return NextResponse.json(
				{ error: 'Supplier ID is required' },
				{ status: 400 }
			)
		}

		// Проверяем существование поставщика
		const existingSupplier = await prisma.supplier.findUnique({
			where: { id: parseInt(id) },
		})

		if (!existingSupplier) {
			return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
		}

		// Обновляем поставщика
		const updatedSupplier = await prisma.supplier.update({
			where: { id: parseInt(id) },
			data: {
				name: name || existingSupplier.name,
				shortName:
					shortName !== undefined
						? shortName || null
						: existingSupplier.shortName,
				shortNameIt:
					shortNameIt !== undefined
						? shortNameIt || null
						: existingSupplier.shortNameIt,
				phone: phone || existingSupplier.phone,
				email: email || existingSupplier.email,
				contactPerson: contactPerson || existingSupplier.contactPerson,
				address: address || existingSupplier.address,
				codiceFiscale: codiceFiscale || existingSupplier.codiceFiscale,
				partitaIVA: partitaIVA || existingSupplier.partitaIVA,
				legalAddress: legalAddress || existingSupplier.legalAddress,
				paymentTerms: paymentTerms || existingSupplier.paymentTerms,
				deliveryDays: deliveryDays
					? parseInt(deliveryDays)
					: existingSupplier.deliveryDays,
				minOrderAmount: minOrderAmount
					? parseFloat(minOrderAmount)
					: existingSupplier.minOrderAmount,
				rating: rating ? parseInt(rating) : existingSupplier.rating,
				status: status || existingSupplier.status,
				notes: notes || existingSupplier.notes,
			},
		})

		logger.info(`✅ Updated supplier: ${updatedSupplier.name}`)
		return NextResponse.json(updatedSupplier)
	} catch (error) {
		logger.error('❌ Error updating supplier:', error)
		return NextResponse.json(
			{ error: 'Failed to update supplier' },
			{ status: 500 }
		)
	}
}

// DELETE /api/suppliers - удалить поставщика
export async function DELETE(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const id = searchParams.get('id')

		if (!id) {
			return NextResponse.json(
				{ error: 'Supplier ID is required' },
				{ status: 400 }
			)
		}

		// Проверяем существование поставщика
		const existingSupplier = await prisma.supplier.findUnique({
			where: { id: parseInt(id) },
		})

		if (!existingSupplier) {
			return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
		}

		// Удаляем поставщика (каскадное удаление связей)
		await prisma.supplier.delete({
			where: { id: parseInt(id) },
		})

		logger.info(`✅ Deleted supplier: ${existingSupplier.name}`)
		return NextResponse.json({ success: true })
	} catch (error) {
		logger.error('❌ Error deleting supplier:', error)
		return NextResponse.json(
			{ error: 'Failed to delete supplier' },
			{ status: 500 }
		)
	}
}
