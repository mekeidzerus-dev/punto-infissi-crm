import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseJson, success, withApiHandler } from '@/lib/api-handler'
import {
	buildCategoryCreateData,
	categoryCreateBodySchema,
	categoryUpdateBodySchema,
	buildCategoryUpdateData,
} from './helpers'

export const GET = withApiHandler(async () => {
	const categories = await prisma.productCategory.findMany({
		orderBy: { name: 'asc' },
	})

	return success(categories)
})

export const POST = withApiHandler(async (request: NextRequest) => {
	const payload = await parseJson(request, categoryCreateBodySchema)

	const category = await prisma.productCategory.create({
		data: buildCategoryCreateData(payload),
	})

	return success(category, 201)
})

export const PUT = withApiHandler(async (request: NextRequest) => {
	const payload = await parseJson(request, categoryUpdateBodySchema)

	const category = await prisma.productCategory.update({
		where: { id: payload.id },
		data: buildCategoryUpdateData(payload),
	})

	return success(category)
})
