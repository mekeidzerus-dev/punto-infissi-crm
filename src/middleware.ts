import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
	function middleware(req) {
		const { pathname } = req.nextUrl
		const token = req.nextauth.token

		// Для API запросов без авторизации возвращаем 401 вместо редиректа
		if (pathname.startsWith('/api/')) {
			const publicApiPaths = ['/api/auth', '/api/health']
			const isPublicApi = publicApiPaths.some((path) => pathname.startsWith(path))

			if (!isPublicApi && !token) {
				return NextResponse.json(
					{ error: 'Authentication required' },
					{ status: 401 }
				)
			}
		}

		return NextResponse.next()
	},
	{
		callbacks: {
			authorized: ({ token, req }) => {
				const { pathname } = req.nextUrl

				// Публичные пути
				const publicPaths = [
					'/',
					'/auth/signin',
					'/auth/signup',
					'/auth/invite',
					'/auth/forgot-password',
				]
				const publicApiPaths = ['/api/auth', '/api/health']

				// Разрешаем доступ к публичным путям
				if (publicPaths.some((path) => pathname === path)) {
					return true
				}

				// Разрешаем доступ к странице сброса пароля с токеном
				if (pathname.startsWith('/auth/reset-password/')) {
					return true
				}

				// Разрешаем доступ к публичным API путям (всегда разрешаем, чтобы middleware мог обработать)
				if (publicApiPaths.some((path) => pathname.startsWith(path))) {
					return true
				}

				// Для API запросов разрешаем прохождение, чтобы middleware мог вернуть 401
				if (pathname.startsWith('/api/')) {
					return true
				}

				// Для всех остальных путей требуется авторизация
				return !!token
			},
		},
		pages: {
			signIn: '/auth/signin',
		},
	}
)

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder
		 */
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
}

