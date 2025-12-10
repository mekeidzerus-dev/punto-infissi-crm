/** @type {import('next').NextConfig} */
const nextConfig = {
	// Отключаем кэширование в dev режиме для предотвращения проблем с chunks
	// В production это не влияет, так как всегда чистая сборка
	experimental: {
		// Улучшенная обработка webpack chunks
		optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
	},
	
	// Настройки webpack для стабильной генерации chunks
	webpack: (config, { dev, isServer }) => {
		// В dev режиме отключаем агрессивное кэширование модулей
		if (dev) {
			config.cache = {
				type: 'filesystem',
				buildDependencies: {
					config: [__filename],
				},
				// Очищаем кэш при изменении зависимостей
				cacheDirectory: '.next/cache/webpack',
			}
		}
		
		return config
	},
	
	// Для production деплоя можно использовать standalone (раскомментировать при необходимости)
	// output: 'standalone',
}

export default nextConfig

