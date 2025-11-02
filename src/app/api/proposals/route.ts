import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function GET() {
	try {
		logger.info('🔍 Fetching proposals...')

		const proposals = await prisma.proposalDocument.findMany({
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
			orderBy: { createdAt: 'desc' },
		})

		logger.info(`✅ Found ${proposals.length} proposals`)
		return NextResponse.json(proposals)
	} catch (error) {
		logger.error('❌ Error fetching proposals:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch proposals', details: String(error) },
			{ status: 500 }
		)
	}
}

export async function POST(request: NextRequest) {
	try {
		logger.info('📝 Creating proposal...')

		const body = await request.json()
		const {
			clientId,
			groups,
			vatRate,
			proposalDate,
			validUntil,
			responsibleManager,
			status,
			notes,
		} = body

		if (!clientId) {
			return NextResponse.json(
				{ error: 'Client ID is required' },
				{ status: 400 }
			)
		}

		// Генерируем номер предложения
		const count = await prisma.proposalDocument.count()
		const number = `PROP-${String(count + 1).padStart(3, '0')}`

		// Создаем предложение
		const proposal = await prisma.proposalDocument.create({
			data: {
				number,
				proposalDate: proposalDate ? new Date(proposalDate) : new Date(),
				validUntil: validUntil ? new Date(validUntil) : null,
				clientId: parseInt(clientId),
				responsibleManager: responsibleManager || 'Администратор',
				status: status || 'draft',
				vatRate: vatRate || 22.0,
				notes,
				groups: {
					create: groups?.map((group: Record<string, unknown>, groupIndex: number) => ({
						name: group.name,
						description: group.description,
						sortOrder: groupIndex,
						positions: {
							create: group.positions?.map(
								(position: Record<string, unknown>, positionIndex: number) => ({
									categoryId: position.categoryId,
									supplierCategoryId: position.supplierCategoryId,
									// Расширенная configuration с данными для локализации
									configuration: {
										...position.configuration,
										// Сохраняем локализованные данные для последующего использования
										_metadata: {
											categoryNameRu: position.categoryNameRu,
											categoryNameIt: position.categoryNameIt,
											supplierShortNameRu: position.supplierShortNameRu,
											supplierShortNameIt: position.supplierShortNameIt,
											supplierFullName: position.supplier?.name,
											modelValueRu: position.modelValueRu,
											modelValueIt: position.modelValueIt,
											parameters: position.parameters || [],
											customNotes: position.customNotes,
										},
									},
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

		logger.info(`✅ Created proposal: ${proposal.number}`)
		return NextResponse.json(proposal, { status: 201 })
	} catch (error) {
		logger.error('❌ Error creating proposal:', error)
		return NextResponse.json(
			{ error: 'Failed to create proposal', details: String(error) },
			{ status: 500 }
		)
	}
}

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

		// Пересчитываем общие итоги (НДС уже посчитан на уровне позиций)
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
