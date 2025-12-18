import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const TEST_EMAIL = 'Mekeidzerus@gmail.com'
const TEST_PASSWORD = 'Sedrik095055'

export const GET = async (request: NextRequest) => {
	try {
		const normalizedEmail = TEST_EMAIL.toLowerCase().trim()

		// Ищем пользователя
		const user = await prisma.user.findUnique({
			where: { email: normalizedEmail },
			select: {
				id: true,
				email: true,
				password: true,
				name: true,
				role: true,
			},
		})

		if (!user) {
			return Response.json({
				success: false,
				error: 'User not found',
				details: {
					searchedEmail: normalizedEmail,
					originalEmail: TEST_EMAIL,
				},
			})
		}

		const hasPassword = !!user.password
		let isValidPassword = false

		if (user.password) {
			isValidPassword = await compare(TEST_PASSWORD, user.password)
		}

		return Response.json({
			success: true,
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				role: user.role,
				hasPassword,
				isValidPassword,
			},
			details: {
				searchedEmail: normalizedEmail,
				originalEmail: TEST_EMAIL,
			},
		})
	} catch (error: any) {
		logger.error('[Diagnose] Error:', error)
		return Response.json(
			{
				success: false,
				error: error.message,
				stack: error.stack,
			},
			{ status: 500 }
		)
	}
}
