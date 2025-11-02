import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params

		logger.info('🔍 Fetching proposal:', id)

		const proposal = await prisma.proposalDocument.findUnique({
			where: { id },
			include: {
				client: true,
				groups: {
					include: {
						positions: {
							include: {
								category: true,
								supplierCategory: {
									include: {
										supplier: true,
									},
								},
							},
							orderBy: { sortOrder: 'asc' },
						},
					},
					orderBy: { sortOrder: 'asc' },
				},
				templates: {
					include: {
						template: true,
					},
				},
			},
		})

		if (!proposal) {
			return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
		}

		logger.info(`✅ Found proposal: ${proposal.number}`)
		return NextResponse.json(proposal)
	} catch (error) {
		logger.error('❌ Error fetching proposal:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch proposal', details: String(error) },
			{ status: 500 }
		)
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params
		const body = await request.json()

		logger.info('📝 Updating proposal:', id)

		// Удаляем все старые группы и позиции
		await prisma.proposalGroup.deleteMany({
			where: { proposalId: id },
		})

		// Обновляем предложение с новыми данными
		const proposal = await prisma.proposalDocument.update({
			where: { id },
			data: {
				...(body.clientId && { clientId: parseInt(body.clientId) }),
				...(body.proposalDate && {
					proposalDate: new Date(body.proposalDate),
				}),
				...(body.validUntil !== undefined && {
					validUntil: body.validUntil ? new Date(body.validUntil) : null,
				}),
				...(body.responsibleManager && {
					responsibleManager: body.responsibleManager,
				}),
				...(body.status && { status: body.status }),
				...(body.notes !== undefined && { notes: body.notes }),
				...(body.vatRate !== undefined && { vatRate: body.vatRate }),
				groups: {
					create: body.groups?.map((group: Record<string, unknown>, groupIndex: number) => ({
						name: group.name,
						description: group.description,
						sortOrder: groupIndex,
						positions: {
							create: group.positions?.map(
								(position: Record<string, unknown>, positionIndex: number) => ({
									categoryId: position.categoryId,
									supplierCategoryId: position.supplierCategoryId,
									configuration: position.configuration,
									unitPrice: position.unitPrice || 0,
									quantity: position.quantity || 1,
									discount: position.discount || 0,
									vatRate: position.vatRate || 22.0,
									vatAmount: position.vatAmount || 0,
									total: position.total || 0,
									description: position.description,
									sortOrder: positionIndex,
								})
							),
						},
					})),
				},
			},
			include: {
				client: true,
				groups: {
					include: {
						positions: {
							include: {
								category: true,
								supplierCategory: {
									include: {
										supplier: true,
									},
								},
							},
							orderBy: { sortOrder: 'asc' },
						},
					},
					orderBy: { sortOrder: 'asc' },
				},
			},
		})

		// Пересчитываем итоги
		await recalculateProposalTotals(proposal.id)

		logger.info(`✅ Updated proposal: ${proposal.number}`)
		return NextResponse.json(proposal)
	} catch (error) {
		logger.error('❌ Error updating proposal:', error)
		return NextResponse.json(
			{ error: 'Failed to update proposal', details: String(error) },
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

		logger.info('🗑️ Deleting proposal:', id)

		await prisma.proposalDocument.delete({
			where: { id },
		})

		logger.info('✅ Deleted proposal')
		return NextResponse.json({ success: true })
	} catch (error) {
		logger.error('❌ Error deleting proposal:', error)
		return NextResponse.json(
			{ error: 'Failed to delete proposal', details: String(error) },
			{ status: 500 }
		)
	}
}

// Helper function для пересчёта итогов
async function recalculateProposalTotals(proposalId: string) {
	try {
		const proposal = await prisma.proposalDocument.findUnique({
			where: { id: proposalId },
			include: {
				groups: {
					include: {
						positions: true,
					},
				},
			},
		})

		if (!proposal) return

		let totalSubtotal = 0
		let totalDiscount = 0
		let totalVatAmount = 0

		// Пересчитываем итоги групп
		for (const group of proposal.groups) {
			let groupSubtotal = 0
			let groupDiscount = 0

			for (const position of group.positions) {
				const positionSubtotal =
					Number(position.unitPrice) * Number(position.quantity)
				const positionDiscountAmount =
					positionSubtotal * (Number(position.discount) / 100)
				const positionBeforeVat = positionSubtotal - positionDiscountAmount
				const positionVatAmount =
					positionBeforeVat * (Number(position.vatRate) / 100)
				const positionFinalTotal = positionBeforeVat + positionVatAmount

				groupSubtotal += positionSubtotal
				groupDiscount += positionDiscountAmount
				totalVatAmount += positionVatAmount

				// Обновляем позицию
				await prisma.proposalPosition.update({
					where: { id: position.id },
					data: {
						discountAmount: positionDiscountAmount,
						vatAmount: positionVatAmount,
						total: positionFinalTotal,
					},
				})
			}

			// Обновляем группу
			await prisma.proposalGroup.update({
				where: { id: group.id },
				data: {
					subtotal: groupSubtotal,
					discount: groupDiscount,
					total: groupSubtotal - groupDiscount,
				},
			})

			totalSubtotal += groupSubtotal
			totalDiscount += groupDiscount
		}

		// Пересчитываем общие итоги
		const total = totalSubtotal - totalDiscount + totalVatAmount

		await prisma.proposalDocument.update({
			where: { id: proposalId },
			data: {
				subtotal: totalSubtotal,
				discount: totalDiscount,
				vatAmount: totalVatAmount,
				total,
			},
		})

		logger.info(`✅ Recalculated totals for proposal ${proposalId}`)
	} catch (error) {
		logger.error('❌ Error recalculating totals:', error)
	}
}
