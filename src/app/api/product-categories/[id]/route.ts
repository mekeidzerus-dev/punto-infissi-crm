import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiError, parseJson, success, withApiHandler } from '@/lib/api-handler'
import {
	buildProductCategoryUpdateData,
	productCategoryUpdateBodySchema,
	ensureProductCategoryId,
} from '../helpers'

const updateBodyWithoutId = productCategoryUpdateBodySchema.omit({ id: true })

export const GET = withApiHandler(async (_request, { params }) => {
	const id = ensureProductCategoryId(params?.id as string)

	const category = await prisma.productCategory.findUnique({
		where: { id },
	})

	if (!category) {
		throw new ApiError(404, 'Category not found')
	}

	return success(category)
})

export const PUT = withApiHandler(async (request: NextRequest, { params }) => {
	const id = ensureProductCategoryId(params?.id as string)
	const payload = await parseJson(request, updateBodyWithoutId)

	const category = await prisma.productCategory.update({
		where: { id },
		data: buildProductCategoryUpdateData({ ...payload, id }),
	})

	return success(category)
})

export const DELETE = withApiHandler(async (_request, { params }) => {
	const id = ensureProductCategoryId(params?.id as string)

	await prisma.productCategory.delete({ where: { id } })

	return success({ success: true })
})
