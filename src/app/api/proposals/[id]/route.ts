import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiError, parseJson, success, withApiHandler } from '@/lib/api-handler'
import {
	buildProposalUpdateData,
	recalculateProposalTotals,
	proposalUpdateBodySchema,
	ensureProposalId,
} from '../helpers'
import { getCurrentOrganizationId } from '@/lib/organization-context'

function serializeProposal(
	proposal: Awaited<ReturnType<typeof prisma.proposalDocument.findUniqueOrThrow>>
) {
	return {
		...proposal,
		createdAt: proposal.createdAt.toISOString(),
		updatedAt: proposal.updatedAt.toISOString(),
		proposalDate: proposal.proposalDate.toISOString(),
		validUntil: proposal.validUntil?.toISOString() ?? null,
		signedAt: proposal.signedAt?.toISOString() ?? null,
		deliveryDate: proposal.deliveryDate?.toISOString() ?? null,
	}
}

const proposalInclude = {
	client: true,
	statusRef: true,
	groups: {
		include: {
			positions: {
				include: {
					category: true,
					supplierCategory: { include: { supplier: true } },
				},
				orderBy: { sortOrder: 'asc' },
			},
		},
		orderBy: { sortOrder: 'asc' },
	},
	templates: { include: { template: true } },
} as const

export const GET = withApiHandler(async (_request, { params }) => {
	const id = ensureProposalId(params?.id as string)
	const organizationId = await getCurrentOrganizationId()

	const proposal = await prisma.proposalDocument.findFirst({
		where: {
			id,
			...(organizationId ? { organizationId } : {}),
		},
		include: proposalInclude,
	})

	if (!proposal) {
		throw new ApiError(404, 'Proposal not found')
	}

	return success(serializeProposal(proposal))
})

export const PUT = withApiHandler(async (request: NextRequest, { params }) => {
	const id = ensureProposalId(params?.id as string)
	const organizationId = await getCurrentOrganizationId()
	const payload = await parseJson(request, proposalUpdateBodySchema)

	// Проверяем принадлежность записи к организации
	const existing = await prisma.proposalDocument.findFirst({
		where: {
			id,
			...(organizationId ? { organizationId } : {}),
		},
	})

	if (!existing) {
		throw new ApiError(404, 'Proposal not found')
	}

	// Валидация связанных данных: проверяем, что Client принадлежит той же организации
	if (payload.clientId !== undefined) {
		const client = await prisma.client.findFirst({
			where: {
				id: payload.clientId,
				...(organizationId ? { organizationId } : {}),
			},
		})

		if (!client) {
			throw new ApiError(400, 'Client not found or does not belong to your organization')
		}
	}

	if (payload.groups) {
		await prisma.proposalGroup.deleteMany({ where: { proposalId: id } })
	}

	const updateData = await buildProposalUpdateData(payload)

	const proposal = await prisma.proposalDocument.update({
		where: { id },
		data: updateData,
		include: proposalInclude,
	})

	await recalculateProposalTotals(proposal.id)

	const reloaded = await prisma.proposalDocument.findUniqueOrThrow({
		where: { id },
		include: proposalInclude,
	})

	return success(serializeProposal(reloaded))
})

export const DELETE = withApiHandler(async (_request, { params }) => {
	const id = ensureProposalId(params?.id as string)
	const organizationId = await getCurrentOrganizationId()

	// Проверяем принадлежность записи к организации
	const existing = await prisma.proposalDocument.findFirst({
		where: {
			id,
			...(organizationId ? { organizationId } : {}),
		},
	})

	if (!existing) {
		throw new ApiError(404, 'Proposal not found')
	}

	await prisma.proposalDocument.delete({ where: { id } })

	return success({ success: true })
})
