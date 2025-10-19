'use client'

import {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from 'react'
import { Locale, t } from '@/lib/i18n'

interface LanguageContextType {
	locale: Locale
	setLocale: (locale: Locale) => void
	t: ReturnType<typeof t>
}

const LanguageContext = createContext<LanguageContextType | undefined>(
	undefined
)

export function LanguageProvider({ children }: { children: ReactNode }) {
	// По умолчанию итальянский (так как приложение для Италии)
	const [locale, setLocaleState] = useState<Locale>('it')

	// Загружаем сохранённый язык из localStorage
	useEffect(() => {
		const saved = localStorage.getItem('locale')
		if (saved === 'ru' || saved === 'it') {
			setLocaleState(saved)
		}
	}, [])

	// Сохраняем язык при изменении
	const setLocale = (newLocale: Locale) => {
		setLocaleState(newLocale)
		localStorage.setItem('locale', newLocale)
	}

	const translate = t(locale)

	return (
		<LanguageContext.Provider value={{ locale, setLocale, t: translate }}>
			{children}
		</LanguageContext.Provider>
	)
}

export function useLanguage() {
	const context = useContext(LanguageContext)
	if (!context) {
		throw new Error('useLanguage must be used within LanguageProvider')
	}
	return context
}
