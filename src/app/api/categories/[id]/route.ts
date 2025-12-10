import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiError, parseJson, success, withApiHandler } from '@/lib/api-handler'
import {
	buildCategoryUpdateData,
	categoryUpdateBodySchema,
	ensureCategoryId,
} from '../helpers'

type Params = Record<string, string | string[]>

function getId(params?: Params): string {
	const raw = params?.id
	const value = Array.isArray(raw) ? raw[0] ?? null : raw ?? null
	return ensureCategoryId(value)
}

export const GET = withApiHandler(async (_request, { params }) => {
	const id = getId(params)

	const category = await prisma.productCategory.findUnique({
		where: { id },
	})

	if (!category) {
		throw new ApiError(404, 'Category not found')
	}

	return success(category)
})

export const PUT = withApiHandler(async (request: NextRequest, { params }) => {
	const id = getId(params)
	const payload = await parseJson(
		request,
		categoryUpdateBodySchema.omit({ id: true })
	)

	const category = await prisma.productCategory.update({
		where: { id },
		data: buildCategoryUpdateData({ ...payload, id }),
	})

	return success(category)
})

export const DELETE = withApiHandler(async (_request, { params }) => {
	const id = getId(params)

	await prisma.$transaction(async tx => {
		await tx.supplierProductCategory.deleteMany({ where: { categoryId: id } })
		await tx.categoryParameter.deleteMany({ where: { categoryId: id } })
		await tx.productCategory.delete({ where: { id } })
	})

	return success({ success: true })
})
