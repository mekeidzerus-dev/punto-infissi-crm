'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'

interface AuthGuardProps {
	children: React.ReactNode
}

const publicPaths = [
	'/',
	'/auth/signin',
	'/auth/signup',
	'/auth/forgot-password',
	'/auth/reset-password',
]

export function AuthGuard({ children }: AuthGuardProps) {
	const { data: session, status } = useSession()
	const router = useRouter()
	const pathname = usePathname()

	useEffect(() => {
		// Разрешаем доступ к публичным путям
		if (
			pathname &&
			(publicPaths.includes(pathname) ||
				pathname.startsWith('/auth/invite/') ||
				pathname.startsWith('/auth/reset-password/'))
		) {
			return
		}

		if (status === 'loading') return // Still loading

		if (status === 'unauthenticated') {
			router.push('/auth/signin')
		}
	}, [status, router, pathname])

	// Разрешаем доступ к публичным путям без проверки авторизации
	if (
		pathname &&
		(publicPaths.includes(pathname) ||
			pathname.startsWith('/auth/invite/') ||
			pathname.startsWith('/auth/reset-password/'))
	) {
		return <>{children}</>
	}

	if (status === 'loading') {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<p className='text-gray-600'>Loading...</p>
			</div>
		)
	}

	if (status === 'unauthenticated') {
		return null
	}

	return <>{children}</>
}

