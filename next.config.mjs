/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		// Улучшенная обработка webpack chunks
		optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
	},
	// Обеспечиваем стабильность имен chunks и правильную генерацию всех chunks
	webpack: (config, { isServer, dev }) => {
		if (!isServer) {
			config.optimization = {
				...config.optimization,
				moduleIds: 'deterministic',
				chunkIds: 'deterministic',
			}
		}
		return config
	},
	// Отключаем оптимизацию которая может удалять неиспользуемые chunks
	onDemandEntries: {
		maxInactiveAge: 25 * 1000,
		pagesBufferLength: 2,
	},
}

export default nextConfig
