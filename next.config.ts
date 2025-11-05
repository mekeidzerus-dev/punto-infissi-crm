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
	// Убеждаемся что переменные окружения доступны на клиенте
	env: {
		NODE_ENV: process.env.NODE_ENV,
	},
}

export default nextConfig
