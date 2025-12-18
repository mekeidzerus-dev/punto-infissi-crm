'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'

export function SessionProvider({ children }: { children: React.ReactNode }) {
	return (
		<NextAuthSessionProvider
			basePath={process.env.NEXT_PUBLIC_BASE_PATH || '/api/auth'}
		>
			{children}
		</NextAuthSessionProvider>
	)
}

