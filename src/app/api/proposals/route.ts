import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseJson, success, withApiHandler } from '@/lib/api-handler'
import { requireAuth } from '@/lib/auth-helpers'
import { updateUserActivity } from '@/lib/activity-tracker'
import {
	buildProposalCreateData,
	recalculateProposalTotals,
	proposalCreateBodySchema,
} from './helpers'

function serializeProposal(
	proposal: Awaited<ReturnType<typeof prisma.proposalDocument.findMany>>[number]
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

export const GET = withApiHandler(async () => {
	const user = await requireAuth()
	await updateUserActivity(user.id)
	const { getCurrentOrganizationId } = await import('@/lib/organization-context')
	const organizationId = await getCurrentOrganizationId()

	const proposals = await prisma.proposalDocument.findMany({
		where: organizationId ? { organizationId } : undefined,
		include: {
			client: true,
			statusRef: true,
			groups: {
				include: {
					positions: {
						include: {
							category: true,
							supplierCategory: {
								include: { supplier: true },
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

	return success(proposals.map(serializeProposal))
})

export const POST = withApiHandler(async (request: NextRequest) => {
	const user = await requireAuth()
	await updateUserActivity(user.id)
	const payload = await parseJson(request, proposalCreateBodySchema)

	const createData = await buildProposalCreateData(payload as any)

	const proposal = await prisma.proposalDocument.create({
		data: createData,
		include: {
			client: true,
			groups: {
				include: {
					positions: {
						include: {
							category: true,
							supplierCategory: {
								include: { supplier: true },
							},
						},
						orderBy: { sortOrder: 'asc' },
					},
				},
				orderBy: { sortOrder: 'asc' },
			},
		},
	})

	await recalculateProposalTotals(proposal.id)

	const reloaded = await prisma.proposalDocument.findUniqueOrThrow({
		where: { id: proposal.id },
		include: {
			client: true,
			groups: {
				include: {
					positions: {
						include: {
							category: true,
							supplierCategory: {
								include: { supplier: true },
							},
						},
						orderBy: { sortOrder: 'asc' },
					},
				},
				orderBy: { sortOrder: 'asc' },
			},
		},
	})

	return success(serializeProposal(reloaded), 201)
})
