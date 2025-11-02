'use client'

import { useEffect } from 'react'
import { logger } from '@/lib/logger'

const LOGO_STORAGE_KEY = 'punto-infissi-logo-path'

export function LogoUpdater() {
	useEffect(() => {
		// Загружаем логотип из БД при первой загрузке
		const loadLogoFromDB = async () => {
			try {
				const response = await fetch('/api/organization')
				if (response.ok) {
					const org = await response.json()
					if (org.logoUrl) {
						localStorage.setItem(LOGO_STORAGE_KEY, org.logoUrl)
						logger.info('✅ Loaded logo from database:', org.logoUrl)
						window.dispatchEvent(new Event('logo-updated'))
					}
				}
			} catch (error) {
				logger.error('❌ Failed to load logo from database:', error)
			}
		}

		// Проверяем, есть ли логотип в localStorage
		const cachedLogo = localStorage.getItem(LOGO_STORAGE_KEY)
		if (!cachedLogo) {
			// Если нет в кэше, загружаем из БД
			loadLogoFromDB()
		}

		// Функция для обновления логотипа
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

			logger.info('🔍 Поиск элементов логотипа:', {
				logoElements: logoElements.length,
				defaultElements: defaultElements.length,
				logoPath,
			})

			if (logoElements.length === 0) {
				logger.info('❌ Элементы логотипа не найдены')
				return
			}

			if (logoPath) {
				// Показываем логотип, скрываем дефолтный
				logoElements.forEach(element => {
					element.src = logoPath
					element.alt = 'Логотип компании'
					element.style.display = 'block'
					logger.info(`✅ Логотип обновлен: ${logoPath}`)
				})
				defaultElements.forEach(element => {
					element.style.display = 'none'
				})
			} else {
				// Скрываем логотип, показываем дефолтный
				logoElements.forEach(element => {
					element.style.display = 'none'
					logger.info('🔄 Логотип сброшен к дефолтному')
				})
				defaultElements.forEach(element => {
					element.style.display = 'block'
				})
			}
		}

		// Обновляем при загрузке
		updateLogo()

		// Слушаем события обновления логотипа
		const handleLogoUpdate = () => {
			updateLogo()
		}

		window.addEventListener('logo-updated', handleLogoUpdate)

		// Очистка при размонтировании
		return () => {
			window.removeEventListener('logo-updated', handleLogoUpdate)
		}
	}, [])

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
