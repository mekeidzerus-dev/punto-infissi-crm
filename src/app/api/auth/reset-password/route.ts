import { NextRequest } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { ApiError, parseJson, success, withApiHandler } from '@/lib/api-handler'
import { resetPasswordSchema } from '@/lib/validation/auth'

export const POST = withApiHandler(async (request: NextRequest) => {
	const payload = await parseJson(request, resetPasswordSchema)

	// Находим токен
	const resetToken = await prisma.passwordResetToken.findUnique({
		where: { token: payload.token },
		include: { user: true },
	})

	if (!resetToken) {
		throw new ApiError(400, 'Invalid or expired token')
	}

	// Проверяем, не использован ли токен
	if (resetToken.usedAt) {
		throw new ApiError(400, 'Token has already been used')
	}

	// Проверяем срок действия
	if (resetToken.expiresAt < new Date()) {
		throw new ApiError(400, 'Token has expired')
	}

	// Хэшируем новый пароль
	const hashedPassword = await hash(payload.password, 10)

	// Обновляем пароль и помечаем токен как использованный
	await prisma.$transaction(async (tx) => {
		// Обновляем пароль
		await tx.user.update({
			where: { id: resetToken.userId },
			data: { password: hashedPassword },
		})

		// Помечаем токен как использованный
		await tx.passwordResetToken.update({
			where: { id: resetToken.id },
			data: { usedAt: new Date() },
		})
	})

	return success({
		message: 'Password has been reset successfully',
	})
})

