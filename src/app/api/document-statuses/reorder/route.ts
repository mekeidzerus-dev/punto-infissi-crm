import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiError, parseJson, success, withApiHandler } from '@/lib/api-handler'
import { z } from 'zod'

const reorderBodySchema = z.object({
	items: z.array(
		z.object({
			id: z.number().int().positive(),
			globalOrder: z.number().int().min(0),
		})
	),
})

export const POST = withApiHandler(async (request: NextRequest) => {
	const payload = await parseJson(request, reorderBodySchema)

	const statusIds = payload.items.map(item => item.id)
	const statuses = await prisma.documentStatus.findMany({
		where: { id: { in: statusIds } },
	})

	if (statuses.length !== payload.items.length) {
		throw new ApiError(404, 'Some statuses not found')
	}

	await prisma.$transaction(
		payload.items.map(item =>
			prisma.documentStatus.update({
				where: { id: item.id },
				data: { globalOrder: item.globalOrder },
			})
		)
	)

	return success({ success: true })
})

