'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { logger } from '@/lib/logger'
import { apiClient, ApiError } from '@/lib/api-client'

const LOGO_STORAGE_KEY = 'modocrm-logo-path'

// Публичные пути, где не нужно загружать логотип из БД
const PUBLIC_PATHS = [
	'/auth/signin',
	'/auth/signup',
	'/auth/forgot-password',
	'/auth/reset-password',
]

export function LogoUpdater() {
	const { data: session, status } = useSession()
	const pathname = usePathname()

	useEffect(() => {
		// Проверяем, является ли текущий путь публичным
		const isPublicPath =
			pathname && PUBLIC_PATHS.some(path => pathname.startsWith(path))

		// Функция для обновления логотипа в DOM
		const updateLogo = () => {
			const logoPath = localStorage.getItem(LOGO_STORAGE_KEY)

			// Находим все элементы с классом 'company-logo'
			const logoElements = document.querySelectorAll(
				'.company-logo'
			) as NodeListOf<HTMLImageElement>
			// Находим все элементы с классом 'default-logo'
			const defaultElements = document.querySelectorAll(
				'.default-logo'
			) as NodeListOf<HTMLElement>

			if (logoElements.length === 0) {
				// Элементы логотипа не найдены - это нормально на некоторых страницах
				return
			}

			if (logoPath) {
				// Показываем логотип, скрываем дефолтный
				logoElements.forEach(element => {
					element.src = logoPath
					element.alt = 'Логотип компании'
					element.style.display = 'block'
				})
				defaultElements.forEach(element => {
					element.style.display = 'none'
				})
			} else {
				// Скрываем логотип, показываем дефолтный
				logoElements.forEach(element => {
					element.style.display = 'none'
				})
				defaultElements.forEach(element => {
					element.style.display = 'block'
				})
			}
		}

		// СЛУЧАЙ 1: Публичная страница - очищаем логотип и выходим
		if (isPublicPath) {
			localStorage.removeItem(LOGO_STORAGE_KEY)
			updateLogo()
			return
		}

		// СЛУЧАЙ 2: Статус loading - ждем, ничего не делаем
		if (status === 'loading') {
			return
		}

		// СЛУЧАЙ 3: Нет сессии или статус unauthenticated - не загружаем из БД
		if (status === 'unauthenticated' || !session) {
			// Очищаем логотип, если нет сессии
			localStorage.removeItem(LOGO_STORAGE_KEY)
			updateLogo()
			return
		}

		// СЛУЧАЙ 4: Есть активная сессия (authenticated) - загружаем логотип из БД
		if (status === 'authenticated' && session) {
			const loadLogoFromDB = async () => {
				try {
					const org = await apiClient.get<{ logoUrl?: string }>(
						'/api/organization'
					)
					if (org.logoUrl) {
						localStorage.setItem(LOGO_STORAGE_KEY, org.logoUrl)
						logger.info('✅ Loaded logo from database', {
							logoUrl: org.logoUrl,
						})
						window.dispatchEvent(new Event('logo-updated'))
					}
				} catch (error) {
					// Тихая обработка ошибок 401 (Unauthorized)
					// Это может произойти, если сессия истекла во время запроса
					if (error instanceof ApiError && error.status === 401) {
						// Очищаем кэш при ошибке авторизации
						localStorage.removeItem(LOGO_STORAGE_KEY)
						updateLogo()
						return
					}
					// Логируем только другие ошибки (сетевые, серверные и т.д.)
					logger.error('❌ Failed to load logo from database:', error)
				}
			}

			// Проверяем, есть ли логотип в localStorage
			const cachedLogo = localStorage.getItem(LOGO_STORAGE_KEY)
			if (!cachedLogo) {
				// Если нет в кэше, загружаем из БД
				loadLogoFromDB()
			} else {
				// Если есть в кэше, просто обновляем DOM
				updateLogo()
			}
		}

		// Слушаем события обновления логотипа (от других компонентов)
		const handleLogoUpdate = () => {
			updateLogo()
		}

		window.addEventListener('logo-updated', handleLogoUpdate)

		// Очистка при размонтировании
		return () => {
			window.removeEventListener('logo-updated', handleLogoUpdate)
		}
	}, [session, status, pathname])

	// Этот компонент не рендерит ничего видимого
	return null
}

// Утилиты для работы с логотипом
export const LogoManager = {
	/**
	 * Устанавливает новый логотип
	 */
	setLogo(path: string) {
		localStorage.setItem(LOGO_STORAGE_KEY, path)
		window.dispatchEvent(new Event('logo-updated'))
	},

	/**
	 * Получает текущий путь к логотипу
	 */
	getCurrentLogo(): string | null {
		return localStorage.getItem(LOGO_STORAGE_KEY)
	},

	/**
	 * Сбрасывает логотип к дефолтному
	 */
	resetLogo() {
		localStorage.removeItem(LOGO_STORAGE_KEY)
		window.dispatchEvent(new Event('logo-updated'))
	},

	/**
	 * Проверяет, есть ли кастомный логотип
	 */
	hasCustomLogo(): boolean {
		return localStorage.getItem(LOGO_STORAGE_KEY) !== null
	},
}

// Хук для работы с логотипом в компонентах
export function useLogo() {
	const currentLogo = LogoManager.getCurrentLogo()
	const hasCustomLogo = LogoManager.hasCustomLogo()

	return {
		currentLogo,
		hasCustomLogo,
		setLogo: LogoManager.setLogo,
		resetLogo: LogoManager.resetLogo,
	}
}
