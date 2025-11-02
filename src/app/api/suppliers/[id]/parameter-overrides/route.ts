import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// GET /api/suppliers/[id]/parameter-overrides
// Получить все переопределения параметров для поставщика
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params
		const supplierId = parseInt(id)

		if (isNaN(supplierId)) {
			return NextResponse.json(
				{ error: 'Invalid supplier ID' },
				{ status: 400 }
			)
		}

		// Проверяем существование поставщика
		const supplier = await prisma.supplier.findUnique({
			where: { id: supplierId },
		})

		if (!supplier) {
			return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
		}

		// Получаем все переопределения параметров для этого поставщика
		const overrides = await prisma.supplierParameterOverride.findMany({
			where: {
				supplierId: supplierId,
			},
			include: {
				parameter: {
					include: {
						values: {
							where: { isActive: true },
							orderBy: { order: 'asc' },
						},
					},
				},
			},
			orderBy: {
				parameter: {
					name: 'asc',
				},
			},
		})

		logger.info(
			`✅ Found ${overrides.length} parameter overrides for supplier ${supplierId}`
		)

		return NextResponse.json(overrides)
	} catch (error) {
		logger.error('❌ Error fetching supplier parameter overrides:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch parameter overrides' },
			{ status: 500 }
		)
	}
}

// POST /api/suppliers/[id]/parameter-overrides
// Создать новое переопределение параметра для поставщика
export async function POST(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const supplierId = parseInt(params.id)

		if (isNaN(supplierId)) {
			return NextResponse.json(
				{ error: 'Invalid supplier ID' },
				{ status: 400 }
			)
		}

		const body = await request.json()
		const { parameterId, customValues, minValue, maxValue, isAvailable } = body

		// Валидация
		if (!parameterId) {
			return NextResponse.json(
				{ error: 'Parameter ID is required' },
				{ status: 400 }
			)
		}

		// Проверяем существование поставщика
		const supplier = await prisma.supplier.findUnique({
			where: { id: supplierId },
		})

		if (!supplier) {
			return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
		}

		// Проверяем существование параметра
		const parameter = await prisma.parameterTemplate.findUnique({
			where: { id: parameterId },
		})

		if (!parameter) {
			return NextResponse.json(
				{ error: 'Parameter not found' },
				{ status: 404 }
			)
		}

		// Проверяем, нет ли уже переопределения для этого параметра
		const existing = await prisma.supplierParameterOverride.findFirst({
			where: {
				supplierId: supplierId,
				parameterId: parameterId,
			},
		})

		if (existing) {
			return NextResponse.json(
				{ error: 'Override for this parameter already exists' },
				{ status: 400 }
			)
		}

		// Создаем переопределение
		const override = await prisma.supplierParameterOverride.create({
			data: {
				supplierId: supplierId,
				parameterId: parameterId,
				customValues: customValues || null,
				minValue: minValue !== undefined ? minValue : null,
				maxValue: maxValue !== undefined ? maxValue : null,
				isAvailable: isAvailable !== undefined ? isAvailable : true,
			},
			include: {
				parameter: {
					include: {
						values: {
							where: { isActive: true },
							orderBy: { order: 'asc' },
						},
					},
				},
			},
		})

		logger.info(
			`✅ Created parameter override for supplier ${supplierId}, parameter ${parameterId}`
		)

		return NextResponse.json(override, { status: 201 })
	} catch (error) {
		logger.error('❌ Error creating supplier parameter override:', error)
		return NextResponse.json(
			{ error: 'Failed to create parameter override' },
			{ status: 500 }
		)
	}
}
