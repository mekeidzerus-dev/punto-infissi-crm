import { NextRequest } from 'next/server'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { ApiError, parseJson, success, withApiHandler } from '@/lib/api-handler'
import { inviteSchema } from '@/lib/validation/auth'
import { requireAdmin } from '@/lib/auth-helpers'

export const POST = withApiHandler(async (request: NextRequest) => {
	const user = await requireAdmin()
	const payload = await parseJson(request, inviteSchema)

	if (!user.organizationId) {
		throw new ApiError(400, 'User has no organization')
	}

	// Проверяем, не существует ли уже пользователь с таким email
	const existingUser = await prisma.user.findUnique({
		where: { email: payload.email },
	})

	if (existingUser) {
		throw new ApiError(409, 'User with this email already exists')
	}

	// Проверяем лимит пользователей в организации
	const organization = await prisma.organization.findUnique({
		where: { id: user.organizationId },
		include: {
			_count: {
				select: {
					users: true,
				},
			},
		},
	})

	if (!organization) {
		throw new ApiError(404, 'Organization not found')
	}

	if (organization._count.users >= organization.maxUsers) {
		throw new ApiError(403, `Maximum number of users (${organization.maxUsers}) reached`)
	}

	// Проверяем, не было ли уже отправлено приглашение этому email
	const existingInvitation = await prisma.invitation.findFirst({
		where: {
			email: payload.email,
			organizationId: user.organizationId,
			acceptedAt: null,
			expiresAt: {
				gt: new Date(),
			},
		},
	})

	if (existingInvitation) {
		throw new ApiError(409, 'Invitation already sent to this email')
	}

	// Генерируем токен приглашения
	const token = randomBytes(32).toString('hex')
	const expiresAt = new Date()
	expiresAt.setDate(expiresAt.getDate() + 7) // 7 дней

	// Создаем приглашение
	const invitation = await prisma.invitation.create({
		data: {
			email: payload.email,
			token,
			organizationId: user.organizationId,
			invitedBy: user.id,
			expiresAt,
		},
	})

	// TODO: Отправить email с приглашением
	// await sendInvitationEmail(payload.email, token)

	return success(
		{
			invitation: {
				id: invitation.id,
				email: invitation.email,
				token: invitation.token,
				expiresAt: invitation.expiresAt,
			},
			inviteLink: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/invite/${token}`,
		},
		201
	)
})

