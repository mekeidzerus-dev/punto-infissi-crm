/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		// Улучшенная обработка webpack chunks
		optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
	},
	// Обеспечиваем стабильность имен chunks
	webpack: (config, { isServer }) => {
		if (!isServer) {
			config.optimization = {
				...config.optimization,
				moduleIds: 'deterministic',
			}
		}
		return config
	},
}

export default nextConfig
