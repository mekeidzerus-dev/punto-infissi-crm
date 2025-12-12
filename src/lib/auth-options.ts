import { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(prisma),
	secret: process.env.NEXTAUTH_SECRET,
	session: {
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},
	pages: {
		signIn: '/auth/signin',
		error: '/auth/signin',
	},
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null
				}

				const user = await prisma.user.findUnique({
					where: { email: credentials.email },
					include: { organization: true },
				})

				if (!user || !user.password) {
					return null
				}

				const isValidPassword = await compare(credentials.password, user.password)

				if (!isValidPassword) {
					return null
				}

				// Обновляем lastLoginAt при входе
				await prisma.user.update({
					where: { id: user.id },
					data: {
						lastLoginAt: new Date(),
						lastActivityAt: new Date(),
						deletionScheduledAt: null, // Сбрасываем запланированное удаление
						deletionWarningSentAt: null,
					},
				})

				return {
					id: user.id,
					email: user.email,
					name: user.name,
					role: user.role,
					organizationId: user.organizationId,
				}
			},
		}),
	],
	debug: process.env.NODE_ENV === 'development',
}

