import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
	try {
		console.log('🔍 Fetching VAT rates...')

		const vatRates = await prisma.vATRate.findMany({
			where: { isActive: true },
			orderBy: { percentage: 'asc' },
		})

		console.log(`✅ Found ${vatRates.length} VAT rates`)
		return NextResponse.json(vatRates)
	} catch (error) {
		console.error('❌ Error fetching VAT rates:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch VAT rates', details: String(error) },
			{ status: 500 }
		)
	}
}

export async function POST(request: NextRequest) {
	try {
		console.log('📝 Creating VAT rate...')

		const body = await request.json()
		const { name, percentage, description, isDefault } = body

		if (!name || percentage === undefined) {
			return NextResponse.json(
				{ error: 'Name and percentage are required' },
				{ status: 400 }
			)
		}

		// Если устанавливаем как дефолтный, снимаем дефолт с остальных
		if (isDefault) {
			await prisma.vATRate.updateMany({
				where: { isDefault: true },
				data: { isDefault: false },
			})
		}

		const vatRate = await prisma.vATRate.create({
			data: {
				name,
				percentage: parseFloat(percentage),
				description,
				isDefault: isDefault || false,
			},
		})

		console.log(`✅ Created VAT rate: ${vatRate.name}`)
		return NextResponse.json(vatRate, { status: 201 })
	} catch (error) {
		console.error('❌ Error creating VAT rate:', error)
		return NextResponse.json(
			{ error: 'Failed to create VAT rate', details: String(error) },
			{ status: 500 }
		)
	}
}
