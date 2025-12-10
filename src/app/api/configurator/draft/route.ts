import { NextRequest } from 'next/server'
import { parseJson, success, withApiHandler } from '@/lib/api-handler'
import {
	configuratorDraftCreateBodySchema,
	parseDraftQuery,
	findLatestDraft,
	upsertDraft,
	deleteDrafts,
} from './helpers'

export const GET = withApiHandler(async (request: NextRequest) => {
	const query = parseDraftQuery(request.nextUrl.searchParams)

	const draft = await findLatestDraft(query)

	return success(draft)
})

export const POST = withApiHandler(async (request: NextRequest) => {
	const payload = await parseJson(request, configuratorDraftCreateBodySchema)

	const draft = await upsertDraft(
		{ userId: payload.userId ?? null, sessionId: payload.sessionId ?? null },
		payload
	)

	return success(draft)
})

export const DELETE = withApiHandler(async (request: NextRequest) => {
	const query = parseDraftQuery(request.nextUrl.searchParams)

	const result = await deleteDrafts(query)

	return success({ success: true, deletedCount: result.count })
})
