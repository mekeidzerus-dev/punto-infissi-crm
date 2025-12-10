import { NextRequest } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { ApiError, parseJson, success, withApiHandler } from '@/lib/api-handler'
import { acceptInviteSchema } from '@/lib/validation/auth'

export const POST = withApiHandler(async (request: NextRequest) => {
	const payload = await parseJson(request, acceptInviteSchema)

	// Находим приглашение по токену
	const invitation = await prisma.invitation.findUnique({
		where: { token: payload.token },
		include: {
			organization: true,
		},
	})

	if (!invitation) {
		throw new ApiError(404, 'Invitation not found')
	}

	// Проверяем срок действия
	if (invitation.expiresAt < new Date()) {
		throw new ApiError(400, 'Invitation has expired')
	}

	// Проверяем, не было ли уже принято
	if (invitation.acceptedAt) {
		throw new ApiError(400, 'Invitation has already been accepted')
	}

	// Проверяем, что email совпадает
	if (invitation.email !== payload.email) {
		throw new ApiError(400, 'Email does not match invitation')
	}

	// Проверяем, не существует ли уже пользователь
	const existingUser = await prisma.user.findUnique({
		where: { email: payload.email },
	})

	if (existingUser) {
		throw new ApiError(409, 'User with this email already exists')
	}

	// Хэшируем пароль
	const hashedPassword = await hash(payload.password, 10)

	// Создаем пользователя и обновляем приглашение в транзакции
	const result = await prisma.$transaction(async (tx) => {
		// Создаем пользователя
		const user = await tx.user.create({
			data: {
				email: payload.email,
				name: payload.name,
				password: hashedPassword,
				organizationId: invitation.organizationId,
				role: 'user',
				invitedBy: invitation.invitedBy,
				lastLoginAt: new Date(),
				lastActivityAt: new Date(),
			},
		})

		// Отмечаем приглашение как принятое
		await tx.invitation.update({
			where: { id: invitation.id },
			data: { acceptedAt: new Date() },
		})

		return user
	})

	return success(
		{
			user: {
				id: result.id,
				email: result.email,
				name: result.name,
				organizationId: result.organizationId,
			},
		},
		201
	)
})

