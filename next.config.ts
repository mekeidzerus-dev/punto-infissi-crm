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
		// Allow production builds to complete even if TypeScript has errors
		ignoreBuildErrors: false,
	},
}

export default nextConfig
