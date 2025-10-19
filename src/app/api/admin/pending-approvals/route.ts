import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/pending-approvals
// Получить все параметры и значения, ожидающие согласования
export async function GET(request: NextRequest) {
	try {
		// Получаем pending параметры
		const pendingParameters = await prisma.parameterTemplate.findMany({
			where: {
				approvalStatus: 'pending',
			},
			orderBy: {
				createdAt: 'desc',
			},
		})

		// Получаем pending значения
		const pendingValues = await prisma.parameterValue.findMany({
			where: {
				approvalStatus: 'pending',
			},
			include: {
				parameter: {
					select: {
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

		console.log(
			`✅ Found ${pendingParameters.length} pending parameters and ${pendingValues.length} pending values`
		)

		return NextResponse.json({
			parameters: pendingParameters,
			values: pendingValues,
		})
	} catch (error) {
		console.error('❌ Error fetching pending approvals:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch pending approvals' },
			{ status: 500 }
		)
	}
}
