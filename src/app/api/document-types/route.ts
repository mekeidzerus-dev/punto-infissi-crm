import { prisma } from '@/lib/prisma'
import { success, withApiHandler } from '@/lib/api-handler'

export const GET = withApiHandler(async () => {
	const types = await prisma.documentType.findMany({
		where: { isActive: true },
		include: {
			statuses: {
				include: {
					status: true,
				},
				orderBy: { order: 'asc' },
			},
		},
		orderBy: { name: 'asc' },
	})

	return success(types)
})

