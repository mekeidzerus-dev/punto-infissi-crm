import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/parameters/[id]/values
// Получить все значения конкретного параметра
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params

		const values = await prisma.parameterValue.findMany({
			where: {
				parameterId: id,
			},
			orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
		})

		console.log(`✅ Found ${values.length} values for parameter ${id}`)

		return NextResponse.json(values)
	} catch (error) {
		console.error('❌ Error fetching parameter values:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch parameter values' },
			{ status: 500 }
		)
	}
}
