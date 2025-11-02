import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { syncParameterGlobalStatus } from '@/lib/parameter-utils'

// POST /api/categories/[id]/parameters - привязать параметр к категории
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id: categoryId } = await params
		const body = await request.json()
		const {
			parameterId,
			isRequired = false,
			isVisible = true,
			order = 0,
		} = body

		// Проверяем, существует ли уже связь
		const existingLink = await prisma.categoryParameter.findFirst({
			where: {
				categoryId,
				parameterId,
			},
		})

		if (existingLink) {
			return NextResponse.json(
				{ error: 'Parameter already linked to category' },
				{ status: 400 }
			)
		}

		// Создаем связь
		const categoryParameter = await prisma.categoryParameter.create({
			data: {
				categoryId,
				parameterId,
				isRequired,
				isVisible,
				order,
			},
		})

		// Синхронизируем статус isGlobal параметра после привязки
		await syncParameterGlobalStatus(parameterId)

		return NextResponse.json(categoryParameter)
	} catch (error) {
		logger.error('Error linking parameter to category:', error)
		return NextResponse.json(
			{ error: 'Failed to link parameter to category' },
			{ status: 500 }
		)
	}
}

// DELETE /api/categories/[id]/parameters - отвязать параметр от категории
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id: categoryId } = await params
		const { searchParams } = new URL(request.url)
		const parameterId = searchParams.get('parameterId')

		if (!parameterId) {
			return NextResponse.json(
				{ error: 'Parameter ID is required' },
				{ status: 400 }
			)
		}

		// Удаляем связь
		await prisma.categoryParameter.deleteMany({
			where: {
				categoryId,
				parameterId,
			},
		})

		// Синхронизируем статус isGlobal параметра после отвязки
		await syncParameterGlobalStatus(parameterId)

		return NextResponse.json({ success: true })
	} catch (error) {
		logger.error('Error unlinking parameter from category:', error)
		return NextResponse.json(
			{ error: 'Failed to unlink parameter from category' },
			{ status: 500 }
		)
	}
}
