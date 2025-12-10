import { NextRequest } from 'next/server'
import type { Prisma } from '@prisma/client'
import { Prisma as PrismaClient } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { ApiError, parseJson, success, withApiHandler } from '@/lib/api-handler'
import {
	buildSupplierCreateData,
	buildSupplierUpdateData,
	ensureSupplierId,
	supplierCreateBodySchema,
	supplierUpdateBodySchema,
} from './helpers'

const supplierListSelect = {
	id: true,
	name: true,
	shortName: true,
	shortNameIt: true,
	rating: true,
	notes: true,
	paymentTerms: true,
	deliveryDays: true,
	minOrderAmount: true,
	contactPerson: true,
	email: true,
	phone: true,
	address: true,
	status: true,
	parameterOverrides: {
		select: { id: true },
	},
	productCategories: {
		select: { id: true },
	},
} as const

type SupplierListItem = Prisma.SupplierGetPayload<{ select: typeof supplierListSelect }>

function serializeSupplierList(suppliers: SupplierListItem[]) {
	return suppliers.map(supplier => ({
		id: supplier.id,
		name: supplier.name,
		shortName: supplier.shortName ?? null,
		shortNameIt: supplier.shortNameIt ?? null,
		rating: supplier.rating ?? 0,
		logo: null as string | null,
		notes: supplier.notes ?? '',
		paymentTerms: supplier.paymentTerms ?? '',
		deliveryDays: supplier.deliveryDays ?? 0,
		minOrderAmount: supplier.minOrderAmount ? Number(supplier.minOrderAmount) : 0,
		contactPerson: supplier.contactPerson ?? '',
		email: supplier.email ?? '',
		phone: supplier.phone ?? '',
		address: supplier.address ?? '',
		status: supplier.status ?? 'active',
		parametersCount: supplier.parameterOverrides.length,
		categoriesCount: supplier.productCategories.length,
	}))
}

export const GET = withApiHandler(async () => {
	const { requireAuth } = await import('@/lib/auth-helpers')
	const { getCurrentOrganizationId } = await import('@/lib/organization-context')
	const user = await requireAuth()
	const organizationId = await getCurrentOrganizationId()
	
	// Если organizationId есть в сессии, используем его, иначе используем из user
	const finalOrganizationId = organizationId || user.organizationId
	logger.info('Fetching suppliers for organization:', { finalOrganizationId })

	const suppliers = await prisma.supplier.findMany({
		where: finalOrganizationId ? { organizationId: finalOrganizationId } : undefined,
		select: {
			id: true,
			name: true,
			shortName: true,
			shortNameIt: true,
			rating: true,
			notes: true,
			paymentTerms: true,
			deliveryDays: true,
			minOrderAmount: true,
			contactPerson: true,
			email: true,
			phone: true,
			address: true,
			status: true,
			parameterOverrides: {
				select: { id: true },
			},
			productCategories: {
				select: { id: true },
			},
		},
		orderBy: { name: 'asc' },
	})

	logger.info(`✅ Found ${suppliers.length} suppliers`)
	return success(serializeSupplierList(suppliers))
})

export const POST = withApiHandler(async (request: NextRequest) => {
	const { requireAuth } = await import('@/lib/auth-helpers')
	const { updateUserActivity } = await import('@/lib/activity-tracker')
	const user = await requireAuth()
	await updateUserActivity(user.id)
	const payload = await parseJson(request, supplierCreateBodySchema)
	logger.info('📝 Creating supplier', { name: payload.name })

	const supplier = await prisma.supplier.create({
		data: await buildSupplierCreateData(payload),
	})

	return success(supplier, 201)
})

export const PUT = withApiHandler(async (request: NextRequest) => {
	const payload = await parseJson(request, supplierUpdateBodySchema)
	const { getCurrentOrganizationId } = await import('@/lib/organization-context')
	const organizationId = await getCurrentOrganizationId()
	logger.info('📝 Updating supplier', { id: payload.id, organizationId })

	// Проверяем принадлежность записи к организации
	const existing = await prisma.supplier.findFirst({
		where: {
			id: payload.id,
			...(organizationId ? { organizationId } : {}),
		},
	})

	if (!existing) {
		throw new ApiError(404, 'Supplier not found')
	}

	const supplier = await prisma.supplier.update({
		where: { id: payload.id },
		data: buildSupplierUpdateData(payload),
	})

	return success(supplier)
})

export const DELETE = withApiHandler(async (request: NextRequest) => {
	const id = ensureSupplierId(request.nextUrl.searchParams.get('id'))
	const { getCurrentOrganizationId } = await import('@/lib/organization-context')
	const organizationId = await getCurrentOrganizationId()
	logger.info('🗑️ Deleting supplier', { id, organizationId })

	// Проверяем принадлежность записи к организации
	const existing = await prisma.supplier.findFirst({
		where: {
			id,
			...(organizationId ? { organizationId } : {}),
		},
	})

	if (!existing) {
		throw new ApiError(404, 'Supplier not found')
	}

	// Проверяем наличие связанных категорий продуктов
	const supplierCategories = await prisma.supplierProductCategory.findMany({
		where: {
			supplierId: id,
			...(organizationId ? { organizationId } : {}),
		},
		select: { id: true },
	})

	if (supplierCategories.length > 0) {
		// Проверяем, используются ли эти категории в предложениях (только текущей организации)
		const categoriesIds = supplierCategories.map(c => c.id)
		const positionsCount = await prisma.proposalPosition.count({
			where: {
				supplierCategoryId: {
					in: categoriesIds,
				},
				...(organizationId ? { organizationId } : {}),
			},
		})

		if (positionsCount > 0) {
			const message =
				positionsCount === 1
					? 'Impossibile eliminare il fornitore: i suoi prodotti sono ancora presenti in un preventivo. Elimina o modifica il preventivo prima di procedere.'
					: `Impossibile eliminare il fornitore: i suoi prodotti sono ancora presenti in ${positionsCount} preventivi. Elimina o modifica i preventivi prima di procedere.`
			throw new ApiError(409, message)
		}
	}

	// Проверяем наличие черновиков конфигуратора
	const draftsCount = await prisma.configuratorDraft.count({
		where: { selectedSupplierId: id },
	})

	if (draftsCount > 0) {
		logger.warn(`Supplier ${id} has ${draftsCount} configurator drafts, they will be deleted`)
	}

	// Удаляем связанные записи перед удалением поставщика
	// Используем транзакцию для атомарности
	await prisma.$transaction(async (tx) => {
		// Удаляем переопределения параметров
		await tx.supplierParameterOverride.deleteMany({
			where: { supplierId: id },
		})

		// Удаляем категории продуктов поставщика (если они не используются)
		await tx.supplierProductCategory.deleteMany({
			where: { supplierId: id },
		})

		// Удаляем черновики конфигуратора
		await tx.configuratorDraft.deleteMany({
			where: { selectedSupplierId: id },
		})

		// Удаляем самого поставщика
		await tx.supplier.delete({ where: { id } })
	}).catch((error) => {
		logger.error('Transaction error deleting supplier:', error)
		// Если это ошибка Prisma, обрабатываем её
		if (error instanceof PrismaClient.PrismaClientKnownRequestError) {
			if (error.code === 'P2003') {
				throw new ApiError(
					409,
					'Impossibile eliminare il fornitore: esistono ancora dati collegati che non possono essere rimossi automaticamente.'
				)
			}
			if (error.code === 'P2025') {
				throw new ApiError(404, 'Fornitore non trovato')
			}
		}
		throw error
	})

	return success({ success: true })
})
