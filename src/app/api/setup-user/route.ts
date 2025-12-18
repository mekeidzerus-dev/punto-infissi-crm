import { NextRequest } from 'next/server'
import { hash, compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const USER_EMAIL = 'Mekeidzerus@gmail.com'
const USER_PASSWORD = 'Sedrik095055'

export const POST = async (request: NextRequest) => {
	try {
		const normalizedEmail = USER_EMAIL.toLowerCase().trim()

		// Ищем пользователя
		let user = await prisma.user.findUnique({
			where: { email: normalizedEmail },
			include: { organization: true },
		})

		if (!user) {
			logger.info('[Setup] User not found, creating...')

			// Ищем или создаем организацию
			let org = await prisma.organization.findFirst({
				where: {
					name: {
						contains: 'PUNTO INFISSI',
						mode: 'insensitive',
					},
				},
			})

			if (!org) {
				org = await prisma.organization.create({
					data: {
						name: 'PUNTO INFISSI SRL',
						slug: 'punto-infissi',
					},
				})
				logger.info('[Setup] Organization created', { orgName: org.name })
			}

			// Создаем пользователя
			const hashedPassword = await hash(USER_PASSWORD, 10)
			user = await prisma.user.create({
				data: {
					email: normalizedEmail,
					password: hashedPassword,
					name: 'Ruslan Mekeidze',
					role: 'admin',
					organizationId: org.id,
				},
				include: { organization: true },
			})
			logger.info('[Setup] User created', { email: user.email })

			return Response.json({
				success: true,
				action: 'created',
				user: {
					id: user.id,
					email: user.email,
					name: user.name,
					role: user.role,
					organizationId: user.organizationId,
				},
			})
		} else {
			logger.info('[Setup] User found, checking password...')

			// Проверяем пароль
			if (user.password) {
				const isValid = await compare(USER_PASSWORD, user.password)
				if (isValid) {
					return Response.json({
						success: true,
						action: 'exists',
						message: 'User exists with correct password',
						user: {
							id: user.id,
							email: user.email,
							name: user.name,
							role: user.role,
						},
					})
				}
			}

			// Обновляем пароль
			logger.info('[Setup] Updating password...')
			const hashedPassword = await hash(USER_PASSWORD, 10)
			user = await prisma.user.update({
				where: { id: user.id },
				data: { password: hashedPassword },
				include: { organization: true },
			})

			return Response.json({
				success: true,
				action: 'password_updated',
				user: {
					id: user.id,
					email: user.email,
					name: user.name,
					role: user.role,
				},
			})
		}
	} catch (error: any) {
		logger.error('[Setup] Error:', error)
		return Response.json(
			{
				success: false,
				error: error.message,
				stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
			},
			{ status: 500 }
		)
	}
}
