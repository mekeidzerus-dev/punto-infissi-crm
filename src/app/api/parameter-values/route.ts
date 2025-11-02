import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// GET - получить значения параметра
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const parameterId = searchParams.get('parameterId')

		if (!parameterId) {
			return NextResponse.json(
				{ error: 'Parameter ID is required' },
				{ status: 400 }
			)
		}

		const values = await prisma.parameterValue.findMany({
			where: {
				parameterId,
				isActive: true, // Показываем только активные значения
			},
			orderBy: { order: 'asc' },
		})

		return NextResponse.json(values)
	} catch (error) {
		logger.error('❌ Error fetching parameter values:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch values' },
			{ status: 500 }
		)
	}
}

// POST - создать новое значение
export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const {
			parameterId,
			value,
			valueIt,
			displayName,
			hexColor,
			ralCode,
			icon,
			order,
		} = body

		if (!parameterId || !value) {
			return NextResponse.json(
				{ error: 'Parameter ID and value are required' },
				{ status: 400 }
			)
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

		// Проверяем дубликаты значений для этого параметра
		const existingValue = await prisma.parameterValue.findFirst({
			where: {
				parameterId,
				value: value.trim(),
				isActive: true,
			},
		})

		if (existingValue) {
			return NextResponse.json(
				{ error: 'Value already exists for this parameter' },
				{ status: 400 }
			)
		}

		// Получаем максимальный order для определения позиции нового значения
		const maxOrderValue = await prisma.parameterValue.findFirst({
			where: { parameterId },
			orderBy: { order: 'desc' },
			select: { order: true },
		})

		const parameterValue = await prisma.parameterValue.create({
			data: {
				parameterId,
				value: value.trim(),
				valueIt: valueIt?.trim() || null,
				displayName: displayName?.trim() || value.trim(),
				hexColor: hexColor || null,
				ralCode: ralCode || null,
				icon: icon || null,
				order: order !== undefined ? order : (maxOrderValue?.order ?? -1) + 1,
				isActive: true,
			},
		})

		logger.info(`✅ Created parameter value: ${value}`)
		return NextResponse.json(parameterValue)
	} catch (error) {
		logger.error('❌ Error creating parameter value:', error)
		return NextResponse.json(
			{ error: 'Failed to create value' },
			{ status: 500 }
		)
	}
}

// DELETE - удалить значение
export async function DELETE(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const id = searchParams.get('id')

		if (!id) {
			return NextResponse.json(
				{ error: 'Value ID is required' },
				{ status: 400 }
			)
		}

		await prisma.parameterValue.delete({
			where: { id },
		})

		logger.info(`✅ Deleted parameter value: ${id}`)
		return NextResponse.json({ success: true })
	} catch (error) {
		logger.error('❌ Error deleting parameter value:', error)
		return NextResponse.json(
			{ error: 'Failed to delete value' },
			{ status: 500 }
		)
	}
}
