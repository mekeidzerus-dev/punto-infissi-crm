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
}

export default nextConfig
