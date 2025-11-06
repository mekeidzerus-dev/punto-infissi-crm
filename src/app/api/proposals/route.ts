import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { getDefaultVatRate } from '@/lib/vat-utils'
import { getDefaultDocumentStatus } from '@/lib/document-status-utils'

export async function GET() {
	try {
		logger.info('🔍 Fetching proposals...')

		// Безопасный запрос с обработкой возможных null значений
		const proposals = await prisma.proposalDocument.findMany({
			include: {
				client: true,
				statusRef: true, // Может быть null если statusId не установлен
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
		
		// Безопасная сериализация - убираем возможные циклические ссылки
		const safeProposals = proposals.map(proposal => ({
			...proposal,
			// Убеждаемся что все поля сериализуемы
			createdAt: proposal.createdAt.toISOString(),
			updatedAt: proposal.updatedAt.toISOString(),
			proposalDate: proposal.proposalDate.toISOString(),
			validUntil: proposal.validUntil?.toISOString() || null,
			signedAt: proposal.signedAt?.toISOString() || null,
			deliveryDate: proposal.deliveryDate?.toISOString() || null,
		}))
		
		return NextResponse.json(safeProposals)
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		const errorStack = error instanceof Error ? error.stack : undefined
		logger.error('❌ Error fetching proposals:', error || undefined)
		logger.error('Error details:', { errorMessage, errorStack })
		
		// Безопасный ответ без stack trace в production
		const isDev =
			typeof process !== 'undefined' &&
			process.env?.NODE_ENV === 'development'
		return NextResponse.json(
			{
				error: 'Failed to fetch proposals',
				details: isDev ? errorMessage : 'Internal server error',
			},
			{ status: 500 }
		)
	}
}

export async function POST(request: NextRequest) {
	try {
		logger.info('📝 Creating proposal...')

		const body = await request.json()
		logger.info('📦 Received data:', {
			clientId: body.clientId,
			groupsCount: body.groups?.length || 0,
			hasGroups: !!body.groups,
		})

		const {
			clientId,
			groups,
			vatRate,
			proposalDate,
			validUntil,
			responsibleManager,
			status,
			statusId,
			notes,
		} = body

		if (!clientId) {
			logger.error('❌ Client ID missing')
			return NextResponse.json(
				{ error: 'Client ID is required' },
				{ status: 400 }
			)
		}

		if (!groups || groups.length === 0) {
			logger.error('❌ No groups provided')
			return NextResponse.json(
				{ error: 'At least one group with positions is required' },
				{ status: 400 }
			)
		}

		// Валидация позиций
		for (const group of groups as Array<Record<string, unknown>>) {
			const positions = (group.positions as Array<Record<string, unknown>>) || []
			for (const position of positions) {
				if (!position.categoryId || !position.supplierCategoryId) {
					logger.error('❌ Position missing categoryId or supplierCategoryId:', {
						categoryId: position.categoryId,
						supplierCategoryId: position.supplierCategoryId,
						description: position.description,
					})
					return NextResponse.json(
						{
							error: 'Position missing required fields',
							details: `Position "${position.description || 'unknown'}" is missing categoryId or supplierCategoryId`,
						},
						{ status: 400 }
					)
				}
			}
		}

		// Генерируем номер предложения
		const lastProposal = await prisma.proposalDocument.findFirst({
			where: { number: { startsWith: 'PROP-' } },
			orderBy: { number: 'desc' },
		})

		let nextNumber = 1
		if (lastProposal) {
			const lastNumber = parseInt(lastProposal.number.replace('PROP-', ''))
			nextNumber = lastNumber + 1
		}
		const number = `PROP-${String(nextNumber).padStart(3, '0')}`

		// Находим statusId если передан status
		let actualStatusId = statusId
		if (!actualStatusId && status) {
			const statusDoc = await prisma.documentStatus.findUnique({
				where: { name: status },
			})
			actualStatusId = statusDoc?.id
		}

		// Если statusId не передан - используем основной статус для типа "proposal"
		if (!actualStatusId) {
			const defaultStatusId = await getDefaultDocumentStatus('proposal')
			if (defaultStatusId) {
				actualStatusId = defaultStatusId
				logger.info(
					`✅ Using default status for proposal: ${actualStatusId}`
				)
			}
		}

		// Получаем дефолтную ставку НДС из справочника
		const defaultVatRate = await getDefaultVatRate()

		// Создаем предложение
		const proposal = await prisma.proposalDocument.create({
			data: {
				number,
				proposalDate: proposalDate ? new Date(proposalDate) : new Date(),
				validUntil: validUntil ? new Date(validUntil) : null,
				clientId: parseInt(clientId),
				responsibleManager: responsibleManager || 'Администратор',
				status: status || 'draft',
				statusId: actualStatusId || null,
				vatRate: vatRate || defaultVatRate,
				notes,
				groups: groups
					? ({
							create: (groups as Array<Record<string, unknown>>).map(
								(group: Record<string, unknown>, groupIndex: number) => ({
									name: String(group.name),
									description: group.description
										? String(group.description)
										: null,
									sortOrder: groupIndex,
									positions: {
										create: (
											(group.positions as
												| Array<Record<string, unknown>>
												| undefined) || []
										).map(
											(
												position: Record<string, unknown>,
												positionIndex: number
											) => ({
												categoryId: String(position.categoryId),
												supplierCategoryId: String(position.supplierCategoryId),
												// Расширенная configuration с данными для локализации
												configuration: {
													...((position.configuration as Record<
														string,
														unknown
													>) || {}),
													// Сохраняем локализованные данные для последующего использования
													_metadata: {
														categoryNameRu: position.categoryNameRu,
														categoryNameIt: position.categoryNameIt,
														supplierShortNameRu: position.supplierShortNameRu,
														supplierShortNameIt: position.supplierShortNameIt,
														supplierFullName: (
															position.supplier as { name?: string } | undefined
														)?.name,
														modelValueRu: position.modelValueRu,
														modelValueIt: position.modelValueIt,
														parameters:
															(position.parameters as unknown[]) || [],
														customNotes: position.customNotes,
													},
												} as Record<string, unknown>,
												unitPrice: Number(position.unitPrice) || 0,
												quantity: Number(position.quantity) || 1,
												discount: Number(position.discount) || 0,
												vatRate: Number(position.vatRate) || defaultVatRate,
												vatAmount: Number(position.vatAmount) || 0,
												total: Number(position.total) || 0,
												description: position.description
													? String(position.description)
													: null,
												sortOrder: positionIndex,
											})
										),
									},
								})
							),
					  } as any)
					: undefined,
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
		logger.error('❌ Error creating proposal:', error || undefined)
		const errorMessage = error instanceof Error ? error.message : String(error)
		const errorStack = error instanceof Error ? error.stack : undefined
		logger.error('Error details:', { errorMessage, errorStack })
		return NextResponse.json(
			{
				error: 'Failed to create proposal',
				details: errorMessage,
				...(process.env.NODE_ENV === 'development' && { stack: errorStack }),
			},
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
		logger.error('❌ Error recalculating totals:', error || undefined)
	}
}
