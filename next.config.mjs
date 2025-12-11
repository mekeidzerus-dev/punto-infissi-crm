/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		// Улучшенная обработка webpack chunks
		optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
	},
}

export default nextConfig

