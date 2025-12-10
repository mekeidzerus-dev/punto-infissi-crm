
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { ApiError } from '@/lib/api-handler'
import {
	configuratorDraftCreateSchema,
	configuratorDraftQuerySchema,
	type ConfiguratorDraftCreateInput,
	type ConfiguratorDraftQueryInput,
} from '@/lib/validation/configurator'

export const configuratorDraftCreateBodySchema = configuratorDraftCreateSchema
export const configuratorDraftQueryParamsSchema = configuratorDraftQuerySchema

const toNullableJson = (
	value: ConfiguratorDraftCreateInput['configuration']
): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue => {
	if (value === null || value === undefined) {
		return Prisma.JsonNull
	}
	return value as Prisma.InputJsonValue
}

export function parseDraftQuery(params: URLSearchParams): ConfiguratorDraftQueryInput {
	return configuratorDraftQueryParamsSchema.parse({
		userId: params.get('userId'),
		sessionId: params.get('sessionId'),
	})
}

export function ensureDraftTarget(query: ConfiguratorDraftQueryInput) {
	if (!query.userId && !query.sessionId) {
		throw new ApiError(400, 'Either userId or sessionId is required')
	}
}

export async function findLatestDraft(query: ConfiguratorDraftQueryInput) {
	return prisma.configuratorDraft.findFirst({
		where: {
			OR: [
				...(query.userId ? [{ userId: query.userId }] : []),
				...(query.sessionId ? [{ sessionId: query.sessionId }] : []),
			],
		},
		include: {
			category: true,
			supplier: true,
		},
		orderBy: { updatedAt: 'desc' },
	})
}

export async function upsertDraft(
	query: ConfiguratorDraftQueryInput,
	payload: ConfiguratorDraftCreateInput
) {
	const existing = await findLatestDraft(query)

	if (existing) {
		const data: Parameters<typeof prisma.configuratorDraft.update>[0]['data'] = {
			currentStep: payload.currentStep ?? existing.currentStep,
			selectedCategoryId:
				payload.selectedCategoryId ?? existing.selectedCategoryId,
			selectedSupplierId:
				payload.selectedSupplierId ?? existing.selectedSupplierId,
			updatedAt: new Date(),
		}

		if (payload.configuration !== undefined) {
			data.configuration = toNullableJson(payload.configuration)
		}

		return prisma.configuratorDraft.update({
			where: { id: existing.id },
			data,
			include: {
				category: true,
				supplier: true,
			},
		})
	}

	return prisma.configuratorDraft.create({
		data: {
			userId: payload.userId ?? null,
			sessionId: payload.sessionId ?? null,
			currentStep: payload.currentStep ?? 1,
			selectedCategoryId: payload.selectedCategoryId ?? null,
			selectedSupplierId: payload.selectedSupplierId ?? null,
			configuration: toNullableJson(payload.configuration ?? null),
		},
		include: {
			category: true,
			supplier: true,
		},
	})
}

export async function deleteDrafts(query: ConfiguratorDraftQueryInput) {
	return prisma.configuratorDraft.deleteMany({
		where: {
			OR: [
				...(query.userId ? [{ userId: query.userId }] : []),
				...(query.sessionId ? [{ sessionId: query.sessionId }] : []),
			],
		},
	})
}
