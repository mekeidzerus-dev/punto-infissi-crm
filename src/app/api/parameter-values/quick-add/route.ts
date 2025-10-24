import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
	try {
		console.log('➕ Adding new parameter value...')

		const body = await request.json()
		const { parameterId, value } = body

		if (!parameterId || !value) {
			return NextResponse.json(
				{ error: 'Parameter ID and value are required' },
				{ status: 400 }
			)
		}

		// Проверяем, что параметр существует
		const parameter = await prisma.parameterTemplate.findUnique({
			where: { id: parameterId },
		})

		if (!parameter) {
			return NextResponse.json(
				{ error: 'Parameter not found' },
				{ status: 404 }
			)
		}

		// Проверяем, что значение еще не существует
		const existingValue = await prisma.parameterValue.findFirst({
			where: {
				parameterId: parameterId,
				value: value,
			},
		})

		if (existingValue) {
			return NextResponse.json(
				{ error: 'Value already exists' },
				{ status: 409 }
			)
		}

		// Добавляем новое значение
		const newValue = await prisma.parameterValue.create({
			data: {
				parameterId: parameterId,
				value: value,
				displayName: value,
				order: 0,
				isActive: true,
			},
		})

		console.log(`✅ Added new value "${value}" for parameter ${parameterId}`)
		return NextResponse.json(newValue)
	} catch (error) {
		console.error('❌ Error adding parameter value:', error)
		return NextResponse.json(
			{ error: 'Failed to add parameter value', details: String(error) },
			{ status: 500 }
		)
	}
}
