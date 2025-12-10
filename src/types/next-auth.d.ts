import type { UserRole } from '@prisma/client'

declare module 'next-auth' {
	interface Session {
		user: {
			id: string
			name?: string | null
			email?: string | null
			image?: string | null
			role?: UserRole | null
			organizationId?: string | null
		}
	}

	interface User {
		id: string
		name?: string | null
		email?: string | null
		image?: string | null
		role?: UserRole | null
		organizationId?: string | null
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		id: string
		role?: UserRole | null
		organizationId?: string | null
	}
}
