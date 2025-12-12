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

	// #region agent log
	useEffect(() => {
		console.log(
			'[DEBUG AuthGuard] Status:',
			status,
			'Pathname:',
			pathname,
			'Has session:',
			!!session
		)
		fetch('http://127.0.0.1:7242/ingest/218ca7f0-e3d7-4389-a1b6-4602048211d4', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				location: 'auth-guard.tsx:20',
				message: 'AuthGuard render',
				data: { status, pathname, hasSession: !!session },
				timestamp: Date.now(),
				sessionId: 'debug-session',
				runId: 'run2',
				hypothesisId: 'B',
			}),
		}).catch(() => {})
	}, [status, pathname, session])
	// #endregion

	useEffect(() => {
		// #region agent log
		console.log('[DEBUG AuthGuard useEffect] Checking auth:', {
			pathname,
			status,
			isPublic: publicPaths.includes(pathname || ''),
		})
		fetch('http://127.0.0.1:7242/ingest/218ca7f0-e3d7-4389-a1b6-4602048211d4', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				location: 'auth-guard.tsx:24',
				message: 'AuthGuard useEffect triggered',
				data: {
					pathname,
					status,
					isPublic: publicPaths.includes(pathname || ''),
				},
				timestamp: Date.now(),
				sessionId: 'debug-session',
				runId: 'run2',
				hypothesisId: 'B',
			}),
		}).catch(() => {})
		// #endregion

		// Разрешаем доступ к публичным путям
		if (
			pathname &&
			(publicPaths.includes(pathname) ||
				pathname.startsWith('/auth/invite/') ||
				pathname.startsWith('/auth/reset-password/'))
		) {
			return
		}

		if (status === 'loading') {
			// #region agent log
			console.log('[DEBUG AuthGuard] Still loading session')
			// #endregion
			return // Still loading
		}

		if (status === 'unauthenticated') {
			// #region agent log
			console.log('[DEBUG AuthGuard] Unauthenticated, redirecting to signin')
			fetch(
				'http://127.0.0.1:7242/ingest/218ca7f0-e3d7-4389-a1b6-4602048211d4',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						location: 'auth-guard.tsx:37',
						message: 'AuthGuard redirecting to signin',
						data: { pathname, status },
						timestamp: Date.now(),
						sessionId: 'debug-session',
						runId: 'run2',
						hypothesisId: 'B',
					}),
				}
			).catch(() => {})
			// #endregion
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
		// #region agent log
		console.log('[DEBUG AuthGuard] Rendering loading state')
		// #endregion
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<p className='text-gray-600'>Loading...</p>
			</div>
		)
	}

	if (status === 'unauthenticated') {
		// Показываем Loading вместо null чтобы избежать белого экрана
		// useEffect уже обработает редирект на /auth/signin
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<p className='text-gray-600'>Loading...</p>
			</div>
		)
	}

	// #region agent log
	console.log('[DEBUG AuthGuard] Rendering children (authenticated)')
	fetch('http://127.0.0.1:7242/ingest/218ca7f0-e3d7-4389-a1b6-4602048211d4', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			location: 'auth-guard.tsx:64',
			message: 'AuthGuard rendering children',
			data: { pathname, status, hasSession: !!session },
			timestamp: Date.now(),
			sessionId: 'debug-session',
			runId: 'run2',
			hypothesisId: 'B',
		}),
	}).catch(() => {})
	// #endregion

	return <>{children}</>
}
