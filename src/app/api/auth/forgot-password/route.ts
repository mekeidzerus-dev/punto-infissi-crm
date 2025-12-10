import { NextRequest } from 'next/server'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { ApiError, parseJson, success, withApiHandler } from '@/lib/api-handler'
import { forgotPasswordSchema } from '@/lib/validation/auth'
import { rateLimiter, RATE_LIMITS } from '@/lib/rate-limiter'

export const POST = withApiHandler(async (request: NextRequest) => {
	// Rate limiting
	const forwardedFor = request.headers.get('x-forwarded-for')
	const realIp = request.headers.get('x-real-ip')
	const cfConnectingIp = request.headers.get('cf-connecting-ip')
	const ip =
		cfConnectingIp || realIp || forwardedFor?.split(',')[0].trim() || 'unknown'

	const identifier = `forgot-password:${ip}`

	const rateLimit = rateLimiter.check(
		identifier,
		RATE_LIMITS.FORGOT_PASSWORD.maxRequests,
		RATE_LIMITS.FORGOT_PASSWORD.windowMs
	)

	if (!rateLimit.allowed) {
		throw new ApiError(
			429,
			'Too many requests. Please try again later.',
			{
				retryAfter: rateLimit.retryAfter,
			}
		)
	}

	const payload = await parseJson(request, forgotPasswordSchema)

	// Ищем пользователя
	const user = await prisma.user.findUnique({
		where: { email: payload.email },
		include: { organization: true },
	})

	// Всегда возвращаем успех (security best practice)
	// Не раскрываем, существует ли email
	if (!user) {
		return success({
			message: 'If the email exists, a password reset link has been sent.',
		})
	}

	// Генерируем токен
	const token = randomBytes(32).toString('hex')
	const expiresAt = new Date()
	expiresAt.setHours(expiresAt.getHours() + 1) // 1 час

	// Сохраняем токен в БД
	await prisma.passwordResetToken.create({
		data: {
			userId: user.id,
			token,
			expiresAt,
		},
	})

	// Отправка email (если настроен email сервис)
	const emailServiceEnabled = process.env.EMAIL_SERVICE_ENABLED === 'true'
	
	if (emailServiceEnabled) {
		// TODO: Реализовать отправку email когда будет настроен email сервис
		// await sendPasswordResetEmail({
		//   email: user.email,
		//   token,
		//   locale: (user.organization?.language as 'ru' | 'it') || 'it',
		// })
	}

	// Возвращаем токен если email сервис не настроен (в любом режиме)
	// Это позволяет использовать восстановление пароля без email сервиса
	const shouldReturnToken = !emailServiceEnabled

	return success({
		message: emailServiceEnabled
			? 'If the email exists, a password reset link has been sent.'
			: 'Password reset token generated. Check the page for the reset link.',
		// Возвращаем токен если email сервис не настроен
		...(shouldReturnToken && { token }),
	})
})

