import { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'
import { logger } from '@/lib/logger'
import { UserRole } from '@prisma/client'

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
				logger.info('[Auth] authorize called', {
					email: credentials?.email,
					hasPassword: !!credentials?.password,
				})

				if (!credentials?.email || !credentials?.password) {
					logger.warn('[Auth] Missing credentials', {
						hasEmail: !!credentials?.email,
						hasPassword: !!credentials?.password,
					})
					return null
				}

				const normalizedEmail = credentials.email.toLowerCase().trim()
				logger.info('[Auth] Normalized email', {
					original: credentials.email,
					normalized: normalizedEmail,
				})

				try {
					const user = await prisma.user.findUnique({
						where: { email: normalizedEmail },
						include: { organization: true },
					})

					if (!user) {
						logger.warn(`[Auth] User not found: ${normalizedEmail}`)
						return null
					}

					logger.info(`[Auth] User found`, {
						userId: user.id,
						hasPassword: !!user.password,
						email: user.email,
					})

					if (!user.password) {
						logger.warn(`[Auth] User has no password: ${normalizedEmail}`)
						return null
					}

					const isValidPassword = await compare(
						credentials.password,
						user.password
					)

					logger.info(`[Auth] Password check result`, {
						email: normalizedEmail,
						isValid: isValidPassword,
					})

					if (!isValidPassword) {
						logger.warn(`[Auth] Invalid password for: ${normalizedEmail}`)
						return null
					}

					logger.info(`[Auth] Successful login: ${normalizedEmail}`, {
						userId: user.id,
						organizationId: user.organizationId,
					})

					// Обновляем lastLoginAt при входе
					await prisma.user.update({
						where: { id: user.id },
						data: {
							lastLoginAt: new Date(),
							lastActivityAt: new Date(),
							deletionScheduledAt: null,
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
				} catch (error: any) {
					logger.error('[Auth] Error in authorize:', error, {
						email: normalizedEmail,
						errorMessage: error?.message,
						errorStack: error?.stack,
					})
					return null
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id
				token.role = user.role
				token.organizationId = user.organizationId
			}
			return token
		},
		async session({ session, token }) {
			if (session.user && token) {
				session.user.id = token.id as string
				session.user.role = token.role as UserRole
				session.user.organizationId = token.organizationId as string
			}
			return session
		},
	},
	debug: process.env.NODE_ENV === 'development',
}
