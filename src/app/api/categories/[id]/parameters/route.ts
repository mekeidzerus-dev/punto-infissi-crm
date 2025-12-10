
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiError, parseJson, success, withApiHandler } from '@/lib/api-handler'
import { syncParameterGlobalStatus } from '@/lib/parameter-utils'
import {
	categoryParameterLinkBodySchema,
	ensureCategoryId,
	ensureParameterId,
} from '@/app/api/category-parameters/helpers'

type CategoryRouteParams = { id: string }

type CategoryRouteParamsInput =
	| CategoryRouteParams
	| Record<string, string | string[]>
	| undefined

type CategoryParamsOrPromise =
	| CategoryRouteParamsInput
	| Promise<CategoryRouteParamsInput>

async function resolveCategoryId(params: CategoryParamsOrPromise) {
	const resolved = await params
	const idValue = resolved?.id
	if (!idValue) {
		throw new ApiError(400, 'Category id is required')
	}
	const id = Array.isArray(idValue) ? idValue[0] : idValue
	return ensureCategoryId(id)
}

export const POST = withApiHandler(async (request: NextRequest, { params }) => {
	const categoryId = await resolveCategoryId(params)
	const payload = await parseJson(request, categoryParameterLinkBodySchema)

	const existingLink = await prisma.categoryParameter.findFirst({
		where: { categoryId, parameterId: payload.parameterId },
	})

	if (existingLink) {
		throw new ApiError(400, 'Parameter already linked to category')
	}

	const categoryParameter = await prisma.categoryParameter.create({
		data: {
			categoryId,
			parameterId: payload.parameterId,
			isRequired: payload.isRequired ?? false,
			isVisible: payload.isVisible ?? true,
			order: payload.order ?? 0,
		},
	})

	await syncParameterGlobalStatus(payload.parameterId)

	return success(categoryParameter)
})

export const DELETE = withApiHandler(async (request: NextRequest, { params }) => {
	const categoryId = await resolveCategoryId(params)
	const parameterId = ensureParameterId(request.nextUrl.searchParams.get('parameterId'))

	await prisma.categoryParameter.deleteMany({
		where: { categoryId, parameterId },
	})

	await syncParameterGlobalStatus(parameterId)

	return success({ success: true })
})
