import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT /api/user-suggestions/[id]/reject
// Отклонить предложение пользователя
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const suggestionId = params.id
		const body = await request.json()
		const { rejectionReason } = body

		// Получаем предложение
		const suggestion = await prisma.userSuggestion.findUnique({
			where: { id: suggestionId },
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

		// Отклоняем предложение
		const updatedSuggestion = await prisma.userSuggestion.update({
			where: { id: suggestionId },
			data: {
				status: 'REJECTED',
				rejectionReason: rejectionReason || null,
				reviewedAt: new Date(),
			},
			include: {
				parameter: true,
			},
		})

		console.log(
			`❌ Rejected suggestion ${suggestionId}: ${suggestion.suggestedValue}`
		)

		return NextResponse.json(updatedSuggestion)
	} catch (error) {
		console.error('❌ Error rejecting suggestion:', error)
		return NextResponse.json(
			{ error: 'Failed to reject suggestion' },
			{ status: 500 }
		)
	}
}
