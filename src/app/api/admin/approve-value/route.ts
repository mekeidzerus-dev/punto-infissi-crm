import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/admin/approve-value
// Одобрить значение параметра
export async function POST(request: NextRequest) {
	try {
		const data = await request.json()
		const { valueId, approvedBy } = data

		if (!valueId) {
			return NextResponse.json(
				{ error: 'valueId is required' },
				{ status: 400 }
			)
		}

		const updatedValue = await prisma.parameterValue.update({
			where: { id: valueId },
			data: {
				approvalStatus: 'approved',
				approvedBy: approvedBy || 'admin',
				approvedAt: new Date(),
			},
		})

		console.log(`✅ Approved parameter value: ${updatedValue.value}`)

		return NextResponse.json(updatedValue)
	} catch (error) {
		console.error('❌ Error approving value:', error)
		return NextResponse.json(
			{ error: 'Failed to approve value' },
			{ status: 500 }
		)
	}
}
