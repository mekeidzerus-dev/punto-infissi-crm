import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiError, success, withApiHandler } from '@/lib/api-handler'

export const GET = withApiHandler(async (
	request: NextRequest,
	{ params }
) => {
	const token = params?.token
	const tokenValue = Array.isArray(token) ? token[0] : token

	if (!tokenValue) {
		throw new ApiError(400, 'Token is required')
	}

	const resetToken = await prisma.passwordResetToken.findUnique({
		where: { token: tokenValue },
		include: { user: true },
	})

	if (!resetToken) {
		throw new ApiError(404, 'Invalid or expired token')
	}

	// Проверяем, не использован ли токен
	if (resetToken.usedAt) {
		throw new ApiError(400, 'Token has already been used')
	}

	// Проверяем срок действия
	if (resetToken.expiresAt < new Date()) {
		throw new ApiError(400, 'Token has expired')
	}

	return success({
		valid: true,
		email: resetToken.user.email,
	})
})

