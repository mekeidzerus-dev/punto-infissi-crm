import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiError, parseJson, success, withApiHandler } from '@/lib/api-handler'
import {
	documentStatusTypeOrderBodySchema,
	ensureDocumentStatusTypeId,
	DocumentStatusTypeOrderInput,
} from '../helpers'

async function updateOrderByDirection(
	linkId: number,
	payload: DocumentStatusTypeOrderInput
) {
	const currentLink = await prisma.documentStatusType.findUnique({
		where: { id: linkId },
	})

	if (!currentLink) {
		throw new ApiError(404, 'DocumentStatusType not found')
	}

	const allLinks = await prisma.documentStatusType.findMany({
		where: { documentTypeId: currentLink.documentTypeId },
		orderBy: { order: 'asc' },
	})

	const currentIndex = allLinks.findIndex(link => link.id === currentLink.id)

	if (currentIndex === -1) {
		throw new ApiError(500, 'Current link not found in sorted list')
	}

	let targetIndex: number
	if (payload.direction === 'up') {
		targetIndex = currentIndex - 1
		if (targetIndex < 0) {
			throw new ApiError(400, 'Cannot move up: already first')
		}
	} else {
		targetIndex = currentIndex + 1
		if (targetIndex >= allLinks.length) {
			throw new ApiError(400, 'Cannot move down: already last')
		}
	}

	const targetLink = allLinks[targetIndex]

	await prisma.$transaction([
		prisma.documentStatusType.update({
			where: { id: currentLink.id },
			data: { order: targetLink.order },
		}),
		prisma.documentStatusType.update({
			where: { id: targetLink.id },
			data: { order: currentLink.order },
		}),
	])
}

export const PUT = withApiHandler(async (request: NextRequest, { params }) => {
	const id = ensureDocumentStatusTypeId(params?.id as string)
	const payload = await parseJson(request, documentStatusTypeOrderBodySchema)

	if (payload.order !== undefined && payload.order !== null) {
		await prisma.documentStatusType.update({
			where: { id },
			data: { order: payload.order },
		})

		return success({ success: true })
	}

	if (!payload.direction) {
		throw new ApiError(400, 'Direction must be provided when order not set')
	}

	await updateOrderByDirection(id, payload)

	return success({ success: true })
})

