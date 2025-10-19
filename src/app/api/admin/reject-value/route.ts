import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/admin/reject-value
// Отклонить значение параметра
export async function POST(request: NextRequest) {
	try {
		const data = await request.json()
		const { valueId, rejectedBy, rejectionReason } = data

		if (!valueId) {
			return NextResponse.json(
				{ error: 'valueId is required' },
				{ status: 400 }
			)
		}

		const updatedValue = await prisma.parameterValue.update({
			where: { id: valueId },
			data: {
				approvalStatus: 'rejected',
				rejectedBy: rejectedBy || 'admin',
				rejectedAt: new Date(),
				rejectionReason: rejectionReason || 'Отклонено администратором',
				isActive: false, // Делаем неактивным
			},
		})

		console.log(
			`❌ Rejected parameter value: ${updatedValue.value} - ${
				rejectionReason || 'No reason provided'
			}`
		)

		return NextResponse.json(updatedValue)
	} catch (error) {
		console.error('❌ Error rejecting value:', error)
		return NextResponse.json(
			{ error: 'Failed to reject value' },
			{ status: 500 }
		)
	}
}
