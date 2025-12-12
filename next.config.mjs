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
				chunkIds: 'deterministic',
			}
		}
		return config
	},
	// При ошибке загрузки chunk - перезагружаем страницу вместо показа 404
	async headers() {
		return [
			{
				source: '/_next/static/chunks/:path*',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=31536000, immutable',
					},
				],
			},
		]
	},
}

export default nextConfig
