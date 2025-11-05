import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	experimental: {
		// Turbopack configuration
	},
	eslint: {
		// Allow production builds to complete even if ESLint has warnings
		ignoreDuringBuilds: true,
	},
	typescript: {
		// TypeScript errors are now fixed - strict checking enabled
		ignoreBuildErrors: false,
	},
	// Headers для CSP - разрешаем unsafe-eval для html2canvas/jspdf
	async headers() {
		return [
			{
				source: '/:path*',
				headers: [
					{
						key: 'Content-Security-Policy',
						value: [
							"default-src 'self'",
							"script-src 'self' 'unsafe-eval' 'unsafe-inline'",
							"style-src 'self' 'unsafe-inline'",
							"img-src 'self' data: blob: https:",
							"font-src 'self' data:",
							"connect-src 'self'",
							"frame-ancestors 'none'",
						].join('; '),
					},
				],
			},
		]
	},
}

export default nextConfig
