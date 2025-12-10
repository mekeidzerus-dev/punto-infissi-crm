import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { ApiError, parseJson, success, withApiHandler } from '@/lib/api-handler'
import { z } from 'zod'
import { authOptions } from '@/lib/auth-options'

export const dynamic = 'force-dynamic'

const updateProfileSchema = z.object({
	name: z.string().trim().min(1).max(255).optional(),
})

export const GET = withApiHandler(async () => {
	const session = await getServerSession(authOptions)

	if (!session?.user?.id) {
		throw new ApiError(401, 'Unauthorized')
	}

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: {
			id: true,
			name: true,
			email: true,
			emailVerified: true,
			image: true,
			role: true,
			organizationId: true,
			createdAt: true,
			updatedAt: true,
			lastLoginAt: true,
			lastActivityAt: true,
			organization: {
				select: {
					id: true,
					name: true,
					slug: true,
				},
			},
		},
	})

	if (!user) {
		throw new ApiError(404, 'User not found')
	}

	return success(user)
})

export const PUT = withApiHandler(async (request: NextRequest) => {
	const session = await getServerSession(authOptions)

	if (!session?.user?.id) {
		throw new ApiError(401, 'Unauthorized')
	}

	const payload = await parseJson(request, updateProfileSchema)

	const user = await prisma.user.update({
		where: { id: session.user.id },
		data: {
			...(payload.name !== undefined && { name: payload.name }),
		},
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			organizationId: true,
		},
	})

	return success(user)
})
