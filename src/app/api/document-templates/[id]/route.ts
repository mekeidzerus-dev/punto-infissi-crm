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
		const { name, type, contentRu, contentIt, isDefault, isActive } = body

		// Если устанавливаем как дефолтный, снимаем дефолт с других
		if (isDefault) {
			await prisma.documentTemplate.updateMany({
				where: {
					type,
					isDefault: true,
					NOT: { id: params.id },
				},
				data: { isDefault: false },
			})
		}

		const template = await prisma.documentTemplate.update({
			where: { id },
			data: {
				...(name && { name }),
				...(type && { type }),
				...(contentRu !== undefined && { contentRu }),
				...(contentIt !== undefined && { contentIt }),
				...(isDefault !== undefined && { isDefault }),
				...(isActive !== undefined && { isActive }),
			},
		})

		logger.info(`✅ Updated template: ${template.name}`)
		return NextResponse.json(template)
	} catch (error) {
		logger.error('❌ Error updating template:', error)
		return NextResponse.json(
			{ error: 'Failed to update template', details: String(error) },
			{ status: 500 }
		)
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		await prisma.documentTemplate.delete({
			where: { id: params.id },
		})

		logger.info(`✅ Deleted template: ${params.id}`)
		return NextResponse.json({ success: true })
	} catch (error) {
		logger.error('❌ Error deleting template:', error)
		return NextResponse.json(
			{ error: 'Failed to delete template', details: String(error) },
			{ status: 500 }
		)
	}
}
