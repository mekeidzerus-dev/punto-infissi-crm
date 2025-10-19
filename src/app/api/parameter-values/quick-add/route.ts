import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/parameter-values/quick-add
// Быстрое добавление значения параметра прямо из конфигуратора
export async function POST(request: NextRequest) {
	try {
		const data = await request.json()
		const { parameterId, value, valueIt, hexColor, ralCode, createdBy } = data

		if (!parameterId || !value) {
			return NextResponse.json(
				{ error: 'parameterId and value are required' },
				{ status: 400 }
			)
		}

		// Проверяем, не существует ли уже такое значение
		const existing = await prisma.parameterValue.findFirst({
			where: {
				parameterId,
				value,
			},
		})

		if (existing) {
			return NextResponse.json(
				{ error: 'This value already exists' },
				{ status: 409 }
			)
		}

		// Определяем статус: если admin - сразу approved, иначе - pending
		const approvalStatus = createdBy === 'admin' ? 'approved' : 'pending'

		// Создаём новое значение
		const newValue = await prisma.parameterValue.create({
			data: {
				parameterId,
				value,
				valueIt: valueIt || value,
				hexColor: hexColor || null,
				ralCode: ralCode || null,
				createdBy: createdBy || 'user',
				approvalStatus,
				approvedBy: approvalStatus === 'approved' ? 'admin' : null,
				approvedAt: approvalStatus === 'approved' ? new Date() : null,
				isActive: true,
				order: 999, // В конец списка
			},
		})

		console.log(
			`✅ Created parameter value: ${value} (${approvalStatus}) for parameter ${parameterId}`
		)

		return NextResponse.json(newValue, { status: 201 })
	} catch (error) {
		console.error('❌ Error creating parameter value:', error)
		return NextResponse.json(
			{ error: 'Failed to create parameter value' },
			{ status: 500 }
		)
	}
}
