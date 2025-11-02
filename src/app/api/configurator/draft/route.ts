import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// GET - загрузка черновика пользователя
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const userId = searchParams.get('userId')
		const sessionId = searchParams.get('sessionId')

		if (!userId && !sessionId) {
			return NextResponse.json(
				{ error: 'Either userId or sessionId is required' },
				{ status: 400 }
			)
		}

		// Ищем черновик по userId или sessionId
		const draft = await prisma.configuratorDraft.findFirst({
			where: {
				OR: [
					...(userId ? [{ userId }] : []),
					...(sessionId ? [{ sessionId }] : []),
				],
			},
			include: {
				category: true,
				supplier: true,
			},
			orderBy: {
				updatedAt: 'desc', // Берем самый свежий черновик
			},
		})

		if (!draft) {
			return NextResponse.json(null) // Нет черновика
		}

		logger.info(`✅ Loaded configurator draft: ${draft.id}`)
		return NextResponse.json(draft)
	} catch (error) {
		logger.error('❌ Error loading configurator draft:', error)
		return NextResponse.json(
			{ error: 'Failed to load draft', details: String(error) },
			{ status: 500 }
		)
	}
}

// POST - сохранение черновика
export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const {
			userId,
			sessionId,
			currentStep,
			selectedCategoryId,
			selectedSupplierId,
			configuration,
		} = body

		if (!userId && !sessionId) {
			return NextResponse.json(
				{ error: 'Either userId or sessionId is required' },
				{ status: 400 }
			)
		}

		// Ищем существующий черновик
		const existingDraft = await prisma.configuratorDraft.findFirst({
			where: {
				OR: [
					...(userId ? [{ userId }] : []),
					...(sessionId ? [{ sessionId }] : []),
				],
			},
		})

		let draft

		if (existingDraft) {
			// Обновляем существующий черновик
			draft = await prisma.configuratorDraft.update({
				where: { id: existingDraft.id },
				data: {
					currentStep: currentStep || existingDraft.currentStep,
					selectedCategoryId:
						selectedCategoryId || existingDraft.selectedCategoryId,
					selectedSupplierId:
						selectedSupplierId || existingDraft.selectedSupplierId,
					configuration: configuration || existingDraft.configuration,
					updatedAt: new Date(),
				},
				include: {
					category: true,
					supplier: true,
				},
			})
			logger.info(`✅ Updated configurator draft: ${draft.id}`)
		} else {
			// Создаем новый черновик
			draft = await prisma.configuratorDraft.create({
				data: {
					userId: userId || null,
					sessionId: sessionId || null,
					currentStep: currentStep || 1,
					selectedCategoryId: selectedCategoryId || null,
					selectedSupplierId: selectedSupplierId || null,
					configuration: configuration || null,
				},
				include: {
					category: true,
					supplier: true,
				},
			})
			logger.info(`✅ Created configurator draft: ${draft.id}`)
		}

		return NextResponse.json(draft)
	} catch (error) {
		logger.error('❌ Error saving configurator draft:', error)
		return NextResponse.json(
			{ error: 'Failed to save draft', details: String(error) },
			{ status: 500 }
		)
	}
}

// DELETE - удаление черновика
export async function DELETE(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const userId = searchParams.get('userId')
		const sessionId = searchParams.get('sessionId')

		if (!userId && !sessionId) {
			return NextResponse.json(
				{ error: 'Either userId or sessionId is required' },
				{ status: 400 }
			)
		}

		// Удаляем все черновики пользователя
		const result = await prisma.configuratorDraft.deleteMany({
			where: {
				OR: [
					...(userId ? [{ userId }] : []),
					...(sessionId ? [{ sessionId }] : []),
				],
			},
		})

		logger.info(`✅ Deleted ${result.count} configurator drafts`)
		return NextResponse.json({
			success: true,
			deletedCount: result.count,
		})
	} catch (error) {
		logger.error('❌ Error deleting configurator draft:', error)
		return NextResponse.json(
			{ error: 'Failed to delete draft', details: String(error) },
			{ status: 500 }
		)
	}
}
