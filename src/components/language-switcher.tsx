'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'

export function LanguageSwitcher() {
	const { locale, setLocale } = useLanguage()

	return (
		<div className='flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5'>
			<button
				onClick={() => setLocale('it')}
				className={`px-2 py-1 rounded-md transition-all ${
					locale === 'it' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
				}`}
				title='Italiano'
			>
				<span className='text-lg'>🇮🇹</span>
			</button>
			<button
				onClick={() => setLocale('ru')}
				className={`px-2 py-1 rounded-md transition-all ${
					locale === 'ru' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
				}`}
				title='Русский'
			>
				<span className='text-lg'>🇷🇺</span>
			</button>
		</div>
	)
}
