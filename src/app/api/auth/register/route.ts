import { NextRequest } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { ApiError, parseJson, success, withApiHandler } from '@/lib/api-handler'
import { registerSchema } from '@/lib/validation/auth'
import { createStandardVATRatesForOrganization } from '@/lib/vat-rates'

export const POST = withApiHandler(async (request: NextRequest) => {
	const payload = await parseJson(request, registerSchema)

	// Проверяем, не зарегистрирован ли уже пользователь
	const existingUser = await prisma.user.findUnique({
		where: { email: payload.email },
	})

	if (existingUser) {
		throw new ApiError(409, 'User with this email already exists')
	}

	// Хэшируем пароль
	const hashedPassword = await hash(payload.password, 10)

	// Генерируем slug для организации из email
	const emailSlug = payload.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-')
	let orgSlug = emailSlug
	let counter = 1

	// Проверяем уникальность slug
	while (await prisma.organization.findUnique({ where: { slug: orgSlug } })) {
		orgSlug = `${emailSlug}-${counter}`
		counter++
	}

	// Создаем организацию и пользователя в транзакции
	const result = await prisma.$transaction(async (tx) => {
		// Создаем организацию
		const organization = await tx.organization.create({
			data: {
				name: payload.name || `Organization ${payload.email.split('@')[0]}`,
				slug: orgSlug,
				primaryColor: '#dc2626',
				currency: 'EUR',
				timezone: 'Europe/Rome',
				language: 'it',
			},
		})

		// Создаем настройки организации
		await tx.organizationSettings.create({
			data: {
				organizationId: organization.id,
			},
		})

			// Создаем стандартные налоговые ставки для организации
		try {
			await createStandardVATRatesForOrganization(organization.id, tx)
		} catch (vatError) {
			logger.error('Error creating VAT rates:', vatError)
			throw vatError
		}

		// Создаем пользователя с ролью admin
		const user = await tx.user.create({
			data: {
				email: payload.email,
				name: payload.name,
				password: hashedPassword,
				organizationId: organization.id,
				role: 'admin',
				lastLoginAt: new Date(),
				lastActivityAt: new Date(),
			},
		})

		return { user, organization }
	})

	return success(
		{
			user: {
				id: result.user.id,
				email: result.user.email,
				name: result.user.name,
				organizationId: result.user.organizationId,
			},
			organization: {
				id: result.organization.id,
				name: result.organization.name,
				slug: result.organization.slug,
			},
		},
		201
	)
})

