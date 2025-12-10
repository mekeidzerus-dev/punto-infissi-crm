import { prisma } from '@/lib/prisma'
import { success, withApiHandler } from '@/lib/api-handler'
import { ensureParameterIdFromParams } from '../../helpers'

export const GET = withApiHandler(async (_request, { params }) => {
	const id = ensureParameterIdFromParams(params)

	const values = await prisma.parameterValue.findMany({
		where: { parameterId: id },
		orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
	})

	return success(values)
})
