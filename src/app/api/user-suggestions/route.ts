import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isFeatureEnabled } from '@/lib/feature-flags'

// GET - получить предложения пользователя или все предложения (для админа)
export async function GET(request: NextRequest) {
	// Проверяем включена ли функция
	if (!isFeatureEnabled('USER_SUGGESTIONS')) {
		return NextResponse.json({ error: 'Feature disabled' }, { status: 404 })
	}

	try {
		const { searchParams } = new URL(request.url)
		const sessionId = searchParams.get('sessionId')
		const status = searchParams.get('status')

		// Если нет sessionId - возвращаем все предложения (для админа)
		if (!sessionId) {
			const allSuggestions = await prisma.userSuggestion.findMany({
				where: status ? { status: status as any } : undefined,
				include: {
					parameter: {
						select: {
							id: true,
							name: true,
							nameIt: true,
							type: true,
						},
					},
				},
				orderBy: {
					createdAt: 'desc',
				},
			})

			console.log(`✅ Found ${allSuggestions.length} user suggestions`)
			return NextResponse.json(allSuggestions)
		}

		// Для конкретного пользователя по sessionId
		const userSuggestions = await prisma.userSuggestion.findMany({
			where: { sessionId },
			include: {
				parameter: {
					select: {
						id: true,
						name: true,
						nameIt: true,
						type: true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		})

		return NextResponse.json(userSuggestions)
	} catch (error) {
		console.error('Error fetching user suggestions:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch suggestions' },
			{ status: 500 }
		)
	}
}

// POST - создать новое предложение
export async function POST(request: NextRequest) {
	// Проверяем включена ли функция
	if (!isFeatureEnabled('USER_SUGGESTIONS')) {
		return NextResponse.json({ error: 'Feature disabled' }, { status: 404 })
	}

	try {
		const body = await request.json()
		const {
			type,
			parameterId,
			categoryId,
			supplierId,
			value,
			valueIt,
			description,
			sessionId,
		} = body

		// Проверяем обязательные поля
		if (!parameterId || !categoryId || !value) {
			return NextResponse.json(
				{ error: 'Missing required fields: parameterId, categoryId, value' },
				{ status: 400 }
			)
		}

		// Создаем предложение в базе данных
		const suggestion = await prisma.userSuggestion.create({
			data: {
				type: type || 'NEW_VALUE',
				parameterId,
				categoryId,
				supplierId: supplierId || null,
				suggestedValue: value,
				suggestedValueIt: valueIt || null,
				description: description || null,
				sessionId: sessionId || null,
				status: 'PENDING',
			},
			include: {
				parameter: {
					select: {
						id: true,
						name: true,
						nameIt: true,
						type: true,
					},
				},
			},
		})

		console.log(`✅ Created user suggestion: ${value}`)

		return NextResponse.json(suggestion, { status: 201 })
	} catch (error) {
		console.error('Error creating user suggestion:', error)
		return NextResponse.json(
			{ error: 'Failed to create suggestion' },
			{ status: 500 }
		)
	}
}
