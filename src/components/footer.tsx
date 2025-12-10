'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import packageJson from '../../package.json'

export function Footer() {
	const { t } = useLanguage()
	const currentYear = new Date().getFullYear()

	return (
		<footer className='border-t bg-gray-50 mt-auto'>
			<div className='container mx-auto px-4 py-4'>
				<div className='flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-gray-600'>
					{/* Левая часть - Копирайт */}
					<div className='flex items-center gap-2'>
						<span>© {currentYear} MODOCRM</span>
						<span className='hidden md:inline'>•</span>
						<span className='text-xs'>Tutti i diritti riservati</span>
					</div>

					{/* Центр - Версия системы */}
					<div className='flex items-center gap-2'>
						<span className='text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded'>
							v{packageJson.version}
						</span>
						<span className='hidden md:inline text-xs text-gray-400'>
							CRM System
						</span>
					</div>

					{/* Правая часть - Ссылки */}
					<div className='flex items-center gap-4 text-xs'>
						<button
							onClick={() =>
								window.open('/docs/FINAL_DOCUMENTATION.md', '_blank')
							}
							className='hover:text-blue-600 transition-colors'
						>
							Documentazione
						</button>
						<button
							onClick={() => window.open('/api/health', '_blank')}
							className='hover:text-green-600 transition-colors'
						>
							Stato
						</button>
					</div>
				</div>
			</div>
		</footer>
	)
}
