import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT /api/user-suggestions/[id]/approve
// Одобрить предложение пользователя и создать значение параметра
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const suggestionId = params.id

		// Получаем предложение
		const suggestion = await prisma.userSuggestion.findUnique({
			where: { id: suggestionId },
			include: {
				parameter: true,
			},
		})

		if (!suggestion) {
			return NextResponse.json(
				{ error: 'Suggestion not found' },
				{ status: 404 }
			)
		}

		if (suggestion.status !== 'PENDING') {
			return NextResponse.json(
				{ error: 'Suggestion already processed' },
				{ status: 400 }
			)
		}

		// Одобряем предложение
		await prisma.userSuggestion.update({
			where: { id: suggestionId },
			data: {
				status: 'APPROVED',
				reviewedAt: new Date(),
			},
		})

		// Если это предложение нового значения для существующего параметра
		if (
			suggestion.type === 'NEW_VALUE' &&
			suggestion.parameterId &&
			suggestion.parameter
		) {
			// Создаем новое значение параметра
			const maxOrder = await prisma.parameterValue.findFirst({
				where: { parameterId: suggestion.parameterId },
				orderBy: { order: 'desc' },
				select: { order: true },
			})

			await prisma.parameterValue.create({
				data: {
					parameterId: suggestion.parameterId,
					value: suggestion.suggestedValue,
					valueIt: suggestion.suggestedValueIt || suggestion.suggestedValue,
					order: (maxOrder?.order || 0) + 1,
					isActive: true,
				},
			})

			console.log(
				`✅ Approved suggestion ${suggestionId} and created parameter value: ${suggestion.suggestedValue}`
			)
		}

		// Если это предложение нового параметра
		if (suggestion.type === 'NEW_PARAMETER') {
			// Создаем новый параметр
			const newParameter = await prisma.parameterTemplate.create({
				data: {
					name: suggestion.suggestedValue,
					nameIt: suggestion.suggestedValueIt || suggestion.suggestedValue,
					type: 'TEXT', // По умолчанию TEXT, админ может изменить позже
					description: suggestion.description,
					isActive: true,
				},
			})

			console.log(
				`✅ Approved suggestion ${suggestionId} and created parameter: ${suggestion.suggestedValue}`
			)
		}

		// Получаем обновленное предложение
		const updatedSuggestion = await prisma.userSuggestion.findUnique({
			where: { id: suggestionId },
			include: {
				parameter: true,
			},
		})

		return NextResponse.json(updatedSuggestion)
	} catch (error) {
		console.error('❌ Error approving suggestion:', error)
		return NextResponse.json(
			{ error: 'Failed to approve suggestion' },
			{ status: 500 }
		)
	}
}
