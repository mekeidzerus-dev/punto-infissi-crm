import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params
		const body = await request.json()

		logger.info(`📝 Updating VAT rate: ${id}`, { body })

		// Если устанавливаем isDefault = true, сначала снимаем его со всех остальных
		if (body.isDefault === true) {
			await prisma.vATRate.updateMany({
				where: { NOT: { id } },
				data: { isDefault: false },
			})
		}

		const vatRate = await prisma.vATRate.update({
			where: { id },
			data: {
				...(body.name && { name: body.name }),
				...(body.percentage !== undefined && {
					percentage: body.percentage,
				}),
				...(body.description !== undefined && {
					description: body.description,
				}),
				...(body.isDefault !== undefined && {
					isDefault: body.isDefault,
				}),
				...(body.isActive !== undefined && { isActive: body.isActive }),
			},
		})

		logger.info(`✅ Updated VAT rate: ${vatRate.name}`)
		return NextResponse.json(vatRate)
	} catch (error) {
		logger.error('❌ Error updating VAT rate:', error || undefined)
		return NextResponse.json(
			{ error: 'Failed to update VAT rate' },
			{ status: 500 }
		)
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params

		logger.info(`🗑️ Deleting VAT rate: ${id}`)

		// Проверяем, не используется ли эта ставка
		const rate = await prisma.vATRate.findUnique({
			where: { id },
		})

		if (rate?.isDefault) {
			return NextResponse.json(
				{ error: 'Cannot delete default VAT rate' },
				{ status: 400 }
			)
		}

		await prisma.vATRate.delete({
			where: { id },
		})

		logger.info('✅ Deleted VAT rate')
		return NextResponse.json({ success: true })
	} catch (error) {
		logger.error('❌ Error deleting VAT rate:', error || undefined)
		return NextResponse.json(
			{ error: 'Failed to delete VAT rate' },
			{ status: 500 }
		)
	}
}
