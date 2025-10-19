/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false, // Отключаем strict mode
	turbopack: {
		root: __dirname,
	},
}

module.exports = nextConfig
