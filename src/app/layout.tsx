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
							// Обработка ошибок загрузки chunks - автоматическая перезагрузка при ошибке
							(function() {
								var chunkErrorHandled = false;
								function handleChunkError() {
									if (chunkErrorHandled) return;
									chunkErrorHandled = true;
									console.error('Chunk loading error detected, reloading page...');
									setTimeout(function() {
										window.location.reload();
									}, 500);
								}
								window.addEventListener('error', function(e) {
									if (e.message && (e.message.includes('chunk') || e.message.includes('ChunkLoadError'))) {
										handleChunkError();
									}
								}, true);
								window.addEventListener('unhandledrejection', function(e) {
									if (e.reason && (e.reason.name === 'ChunkLoadError' || e.reason.message?.includes('chunk'))) {
										e.preventDefault();
										handleChunkError();
									}
								});
							})();
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
						<AuthGuard>{children}</AuthGuard>
						<Footer />
						<Toaster position='top-center' richColors />
					</LanguageProvider>
				</SessionProvider>
			</body>
		</html>
	)
}
