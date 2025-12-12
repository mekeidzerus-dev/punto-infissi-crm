import { Inter } from 'next/font/google'
import './globals.css'
import { FaviconUpdater } from '@/components/favicon-updater'
import { LogoUpdater } from '@/components/logo-updater'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { Footer } from '@/components/footer'
import { Toaster } from 'sonner'
import { SessionProvider } from '@/components/auth/session-provider'
import { AuthGuard } from '@/components/auth/auth-guard'

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
				<title>MODOCRM</title>
				<meta
					name='description'
					content='Система управления продажами окон и дверей'
				/>
				{/* Фавикон будет управляться динамически через FaviconUpdater */}
				<script
					dangerouslySetInnerHTML={{
						__html: `
							// Обработка ошибок загрузки chunks - предотвращает белый экран
							window.addEventListener('error', function(e) {
								if (e.message && e.message.includes('chunk') && e.message.includes('failed')) {
									console.error('Chunk loading error detected, reloading page...');
									// При ошибке загрузки chunk - перезагружаем страницу
									setTimeout(() => {
										window.location.reload();
									}, 1000);
								}
							}, true);
							// Обработка ChunkLoadError
							window.addEventListener('unhandledrejection', function(e) {
								if (e.reason && e.reason.name === 'ChunkLoadError') {
									console.error('ChunkLoadError detected, reloading page...');
									e.preventDefault();
									setTimeout(() => {
										window.location.reload();
									}, 1000);
								}
							});
						`,
					}}
				/>
			</head>
			<body
				className={`${inter.className} flex flex-col min-h-screen`}
				suppressHydrationWarning
			>
				<SessionProvider>
					<LanguageProvider>
						<FaviconUpdater />
						<LogoUpdater />
						<AuthGuard>
							{children}
						</AuthGuard>
						<Footer />
						<Toaster position='top-center' richColors />
					</LanguageProvider>
				</SessionProvider>
			</body>
		</html>
	)
}
