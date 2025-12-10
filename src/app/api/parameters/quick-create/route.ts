import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseJson, success, withApiHandler } from '@/lib/api-handler'
import { syncParameterGlobalStatus } from '@/lib/parameter-utils'
import {
	buildParameterCreateData,
	parameterCreateBodySchema,
} from '../helpers'

export const POST = withApiHandler(async (request: NextRequest) => {
	const payload = await parseJson(request, parameterCreateBodySchema)

	const parameter = await prisma.parameterTemplate.create({
		data: buildParameterCreateData(payload),
		include: { values: true },
	})

	await syncParameterGlobalStatus(parameter.id)

	return success(parameter, 201)
})
