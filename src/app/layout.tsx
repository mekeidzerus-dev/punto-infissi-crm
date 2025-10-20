import { Inter } from 'next/font/google'
import './globals.css'
import { FaviconUpdater } from '@/components/favicon-updater'
import { LogoUpdater } from '@/components/logo-updater'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { Footer } from '@/components/footer'

const inter = Inter({ subsets: ['latin'] })

// НЕ экспортируем metadata, чтобы Next.js не добавлял статический фавикон

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang='ru' suppressHydrationWarning>
			<head>
				<title>PUNTO INFISSI CRM</title>
				<meta
					name='description'
					content='Система управления продажами окон и дверей'
				/>
				{/* Фавикон будет управляться динамически через FaviconUpdater */}
			</head>
			<body
				className={`${inter.className} flex flex-col min-h-screen`}
				suppressHydrationWarning
			>
				<LanguageProvider>
					<FaviconUpdater />
					<LogoUpdater />
					<div className='flex-grow'>{children}</div>
					<Footer />
				</LanguageProvider>
			</body>
		</html>
	)
}
