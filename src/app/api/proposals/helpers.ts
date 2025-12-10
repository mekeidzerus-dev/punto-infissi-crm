import type { Prisma } from '@prisma/client'
import {
	proposalCreateSchema,
	proposalUpdateSchema,
	type ProposalCreateInput,
	type ProposalUpdateInput,
	ProposalGroupInput,
	ProposalPositionInput,
} from '@/lib/validation/proposal'
import { getDefaultVatRate } from '@/lib/vat-utils'
import { getDefaultDocumentStatus } from '@/lib/document-status-utils'
import { prisma } from '@/lib/prisma'
import { ApiError } from '@/lib/api-handler'
import { ensureOrganizationId } from '@/lib/organization-context'

export const proposalCreateBodySchema = proposalCreateSchema
export const proposalUpdateBodySchema = proposalUpdateSchema

export function ensureProposalId(value: string | null): string {
	if (!value) {
		throw new ApiError(400, 'id is required')
	}
	const trimmed = value.trim()
	if (!trimmed) {
		throw new ApiError(400, 'id must be a non-empty string')
	}
	return trimmed
}

export async function resolveStatusId(
	statusId: string | null | undefined,
	statusName: string | null | undefined
): Promise<number | null> {
	if (statusId) {
		const parsed = Number(statusId)
		if (!Number.isNaN(parsed)) {
			return parsed
		}
	}
	if (statusName) {
		const status = await prisma.documentStatus.findUnique({
			where: { name: statusName },
		})
		if (status) return status.id
	}

	return getDefaultDocumentStatus('proposal')
}

export async function buildProposalCreateData(
	input: ProposalCreateInput & { proposalDate?: string | null; validUntil?: string | null }
): Promise<Prisma.ProposalDocumentCreateInput> {
	const statusId = await resolveStatusId(input.statusId, input.status || undefined)
	const defaultVatRate = await getDefaultVatRate()
	const organizationId = await ensureOrganizationId()

	// Валидация связанных данных: проверяем, что Client принадлежит той же организации
	const client = await prisma.client.findFirst({
		where: {
			id: input.clientId,
			organizationId,
		},
	})

	if (!client) {
		throw new ApiError(400, 'Client not found or does not belong to your organization')
	}

	return {
		number: await nextProposalNumber(),
		proposalDate: input.proposalDate ? new Date(input.proposalDate) : new Date(),
		validUntil: input.validUntil ? new Date(input.validUntil) : null,
		client: { connect: { id: input.clientId } },
		responsibleManager: input.responsibleManager ?? 'Администратор',
		status: (input.status ?? 'draft') as Prisma.ProposalDocumentCreateInput['status'],
		statusRef: statusId !== null ? { connect: { id: statusId } } : undefined,
		vatRate: input.vatRate ?? defaultVatRate,
		notes: input.notes ?? null,
		organizationId,
		groups: {
			create: input.groups.map((group, groupIndex) =>
				buildGroupCreateData(group, groupIndex, defaultVatRate, organizationId)
			),
		},
	} as Prisma.ProposalDocumentCreateInput
}

export async function buildProposalUpdateData(
	input: ProposalUpdateInput,
	defaultVatRate?: number
): Promise<Prisma.ProposalDocumentUpdateInput> {
	const shouldResolveStatus =
		input.statusId !== undefined || input.status !== undefined
	const statusId = shouldResolveStatus
		? await resolveStatusId(input.statusId ?? null, input.status || undefined)
		: undefined
	const vatRate = defaultVatRate ?? (await getDefaultVatRate())

	const data: Prisma.ProposalDocumentUpdateInput = {}

	if (input.clientId !== undefined) {
		data.client = { connect: { id: input.clientId } }
	}
	if (input.proposalDate !== undefined)
		data.proposalDate = input.proposalDate ? new Date(input.proposalDate) : new Date()
	if (input.validUntil !== undefined)
		data.validUntil = input.validUntil ? new Date(input.validUntil) : null
	if (input.responsibleManager !== undefined)
		data.responsibleManager = input.responsibleManager ?? null
	if (input.status !== undefined) {
		data.status = (input.status ?? 'draft') as Prisma.ProposalDocumentUpdateInput['status']
	}
	if (statusId !== undefined) {
		data.statusRef =
			statusId !== null ? { connect: { id: statusId } } : { disconnect: true }
	}
	if (input.notes !== undefined) data.notes = input.notes ?? null
	if (input.vatRate !== undefined) data.vatRate = input.vatRate ?? vatRate

	if (input.groups) {
		const organizationId = await ensureOrganizationId()
		data.groups = {
			create: input.groups.map((group, groupIndex) =>
				buildGroupCreateData(group, groupIndex, vatRate, organizationId)
			),
		}
	}

	return data
}

async function nextProposalNumber(): Promise<string> {
	const lastProposal = await prisma.proposalDocument.findFirst({
		where: { number: { startsWith: 'PROP-' } },
		orderBy: { number: 'desc' },
	})

	let nextNumber = 1
	if (lastProposal) {
		const lastNumber = parseInt(lastProposal.number.replace('PROP-', ''), 10)
		if (!Number.isNaN(lastNumber)) {
			nextNumber = lastNumber + 1
		}
	}

	return `PROP-${String(nextNumber).padStart(3, '0')}`
}

function buildGroupCreateData(
	group: ProposalGroupInput,
	groupIndex: number,
	defaultVatRate: number,
	organizationId: string
) {
	return {
		name: group.name,
		description: group.description ?? null,
		sortOrder: groupIndex,
		organizationId,
		positions: {
			create: group.positions.map((position, positionIndex) =>
				buildPositionCreateData(position, positionIndex, defaultVatRate, organizationId)
			),
		},
	}
}

function buildPositionCreateData(
	position: ProposalPositionInput,
	positionIndex: number,
	defaultVatRate: number,
	organizationId: string
) {
	return {
		categoryId: position.categoryId,
		supplierCategoryId: position.supplierCategoryId,
		configuration: buildConfiguration(position),
		unitPrice: Number(position.unitPrice) || 0,
		quantity: Number(position.quantity) || 1,
		discount: Number(position.discount) || 0,
		vatRate: Number(position.vatRate ?? defaultVatRate),
		vatAmount: Number(position.vatAmount) || 0,
		total: Number(position.total) || 0,
		description: position.description ?? null,
		sortOrder: positionIndex,
		organizationId,
	}
}

function buildConfiguration(position: ProposalPositionInput) {
	const configuration = (position.configuration as Record<string, unknown>) ?? {}
	const extra = position as Record<string, unknown>
	const baseMetadata = (position.metadata as Record<string, unknown>) ?? {}

	return {
		...configuration,
		_metadata: {
			...baseMetadata,
			categoryNameRu: extra.categoryNameRu ?? baseMetadata.categoryNameRu ?? null,
			categoryNameIt: extra.categoryNameIt ?? baseMetadata.categoryNameIt ?? null,
			supplierShortNameRu:
				extra.supplierShortNameRu ?? baseMetadata.supplierShortNameRu ?? null,
			supplierShortNameIt:
				extra.supplierShortNameIt ?? baseMetadata.supplierShortNameIt ?? null,
			supplierFullName:
				((extra.supplier as { name?: string } | undefined)?.name ??
					baseMetadata.supplierFullName ??
					null),
			modelValueRu: extra.modelValueRu ?? baseMetadata.modelValueRu ?? null,
			modelValueIt: extra.modelValueIt ?? baseMetadata.modelValueIt ?? null,
			parameters: baseMetadata.parameters ?? extra.parameters ?? [],
			customNotes: position.customNotes ?? baseMetadata.customNotes ?? null,
		},
	}
}

export async function recalculateProposalTotals(proposalId: string) {
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

	for (const group of proposal.groups) {
		let groupSubtotal = 0
		let groupDiscount = 0

		for (const position of group.positions) {
			const unitPrice = Number(position.unitPrice) || 0
			const quantity = Number(position.quantity) || 0
			const discount = Number(position.discount) || 0
			const vatRate = Number(position.vatRate) || 0

			const positionSubtotal = unitPrice * quantity
			const positionDiscountAmount = positionSubtotal * (discount / 100)
			const positionBeforeVat = positionSubtotal - positionDiscountAmount
			const positionVatAmount = positionBeforeVat * (vatRate / 100)
			const positionFinalTotal = positionBeforeVat + positionVatAmount

			await prisma.proposalPosition.update({
				where: { id: position.id },
				data: {
					discountAmount: positionDiscountAmount,
					vatAmount: positionVatAmount,
					total: positionFinalTotal,
				},
			})

			groupSubtotal += positionSubtotal
			groupDiscount += positionDiscountAmount
			totalVatAmount += positionVatAmount
		}

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
}
