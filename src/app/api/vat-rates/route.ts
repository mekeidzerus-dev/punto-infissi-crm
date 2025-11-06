import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function GET() {
	try {
		logger.info('🔍 Fetching VAT rates...')

		const vatRates = await prisma.vATRate.findMany({
			where: { isActive: true },
			orderBy: { percentage: 'asc' },
		})

		logger.info(`✅ Found ${vatRates.length} VAT rates`)
		return NextResponse.json(vatRates)
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		const errorStack = error instanceof Error ? error.stack : undefined
		logger.error('❌ Error fetching VAT rates:', error || undefined)
		logger.error('Error details:', { errorMessage, errorStack })
		
		// Безопасный ответ без stack trace в production
		const isDev =
			typeof process !== 'undefined' &&
			process.env?.NODE_ENV === 'development'
		return NextResponse.json(
			{
				error: 'Failed to fetch VAT rates',
				details: isDev ? errorMessage : 'Internal server error',
			},
			{ status: 500 }
		)
	}
}

export async function POST(request: NextRequest) {
	try {
		logger.info('📝 Creating VAT rate...')

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

		logger.info(`✅ Created VAT rate: ${vatRate.name}`)
		return NextResponse.json(vatRate, { status: 201 })
	} catch (error) {
		logger.error('❌ Error creating VAT rate:', error)
		return NextResponse.json(
			{ error: 'Failed to create VAT rate', details: String(error) },
			{ status: 500 }
		)
	}
}
