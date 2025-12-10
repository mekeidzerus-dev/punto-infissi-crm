import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiError, parseJson, success, withApiHandler } from '@/lib/api-handler'
import {
	buildInstallerCreateData,
	buildInstallerUpdateData,
	ensureInstallerId,
	installerCreateBodySchema,
	installerUpdateBodySchema,
} from './helpers'

export const GET = withApiHandler(async () => {
	const { requireAuth } = await import('@/lib/auth-helpers')
	const { getCurrentOrganizationId } = await import('@/lib/organization-context')
	const user = await requireAuth()
	const organizationId = await getCurrentOrganizationId()
	
	// Если organizationId есть в сессии, используем его, иначе используем из user
	const finalOrganizationId = organizationId || user.organizationId

	const installers = await prisma.installer.findMany({
		where: finalOrganizationId ? { organizationId: finalOrganizationId } : undefined,
		orderBy: { createdAt: 'desc' },
	})

	return success(installers)
})

export const POST = withApiHandler(async (request: NextRequest) => {
	const { requireAuth } = await import('@/lib/auth-helpers')
	const { updateUserActivity } = await import('@/lib/activity-tracker')
	const user = await requireAuth()
	await updateUserActivity(user.id)
	const payload = await parseJson(request, installerCreateBodySchema)

	const installer = await prisma.installer.create({
		data: await buildInstallerCreateData(payload),
	})

	return success(installer, 201)
})

export const PUT = withApiHandler(async (request: NextRequest) => {
	const payload = await parseJson(request, installerUpdateBodySchema)
	const { getCurrentOrganizationId } = await import('@/lib/organization-context')
	const organizationId = await getCurrentOrganizationId()

	// Проверяем принадлежность записи к организации
	const existing = await prisma.installer.findFirst({
		where: {
			id: payload.id,
			...(organizationId ? { organizationId } : {}),
		},
	})

	if (!existing) {
		throw new ApiError(404, 'Installer not found')
	}

	const installer = await prisma.installer.update({
		where: { id: payload.id },
		data: buildInstallerUpdateData(payload),
	})

	return success(installer)
})

export const DELETE = withApiHandler(async (request: NextRequest) => {
	const id = ensureInstallerId(request.nextUrl.searchParams.get('id'))
	const { getCurrentOrganizationId } = await import('@/lib/organization-context')
	const organizationId = await getCurrentOrganizationId()

	// Проверяем принадлежность записи к организации
	const existing = await prisma.installer.findFirst({
		where: {
			id,
			...(organizationId ? { organizationId } : {}),
		},
	})

	if (!existing) {
		throw new ApiError(404, 'Installer not found')
	}

	await prisma.installer.delete({ where: { id } })

	return success({ success: true })
})
