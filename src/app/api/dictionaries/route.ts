import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiError, parseJson, success, withApiHandler } from '@/lib/api-handler'
import {
	buildDictionaryCreateData,
	buildDictionaryUpdateData,
	dictionaryCreateBodySchema,
	dictionaryUpdateBodySchema,
	ensureDictionaryId,
} from './helpers'
import { dictionaryQuerySchema } from '@/lib/validation/dictionary'
import { getCurrentOrganizationId } from '@/lib/organization-context'

export const GET = withApiHandler(async (request: NextRequest) => {
	const query = dictionaryQuerySchema.parse({
		type: request.nextUrl.searchParams.get('type'),
	})
	const organizationId = await getCurrentOrganizationId()

	const dictionaries = await prisma.dictionary.findMany({
		where: {
			...(query.type ? { type: query.type } : {}),
			isActive: true,
			...(organizationId ? { organizationId } : {}),
		},
		orderBy: { name: 'asc' },
	})

	return success(dictionaries)
})

export const POST = withApiHandler(async (request: NextRequest) => {
	const payload = await parseJson(request, dictionaryCreateBodySchema)

	const dictionary = await prisma.dictionary.create({
		data: await buildDictionaryCreateData(payload),
	})

	return success(dictionary, 201)
})

export const PUT = withApiHandler(async (request: NextRequest) => {
	const payload = await parseJson(request, dictionaryUpdateBodySchema)
	const organizationId = await getCurrentOrganizationId()

	// Проверяем принадлежность записи к организации
	const existing = await prisma.dictionary.findFirst({
		where: {
			id: payload.id,
			...(organizationId ? { organizationId } : {}),
		},
	})

	if (!existing) {
		throw new ApiError(404, 'Dictionary not found')
	}

	const dictionary = await prisma.dictionary.update({
		where: { id: payload.id },
		data: buildDictionaryUpdateData(payload),
	})

	return success(dictionary)
})

export const DELETE = withApiHandler(async (request: NextRequest) => {
	const id = ensureDictionaryId(request.nextUrl.searchParams.get('id'))
	const organizationId = await getCurrentOrganizationId()

	// Проверяем принадлежность записи к организации
	const existing = await prisma.dictionary.findFirst({
		where: {
			id,
			...(organizationId ? { organizationId } : {}),
		},
	})

	if (!existing) {
		throw new ApiError(404, 'Dictionary not found')
	}

	await prisma.dictionary.delete({ where: { id } })

	return success({ success: true })
})
