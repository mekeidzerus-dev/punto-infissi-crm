'use client'

import { useEffect } from 'react'

export function FaviconUpdater() {
	useEffect(() => {
		const updateFavicon = () => {
			// Удаляем ВСЕ существующие фавиконы СНАЧАЛА
			const existingLinks = document.querySelectorAll("link[rel*='icon']")
			existingLinks.forEach(link => link.remove())

			// Получаем путь к сохраненному фавикону
			const faviconPath = localStorage.getItem('punto-infissi-favicon-path')

			// Используем кастомный или дефолтный фавикон
			const finalPath = faviconPath || '/default-favicon.ico'

			// Добавляем timestamp чтобы браузер не использовал кеш
			const timestamp = new Date().getTime()

			// Создаем элемент link для icon
			const linkIcon = document.createElement('link')
			linkIcon.rel = 'icon'
			linkIcon.type = 'image/x-icon'
			linkIcon.href = `${finalPath}?v=${timestamp}`
			document.head.appendChild(linkIcon)

			// Создаем элемент link для shortcut icon (для старых браузеров)
			const linkShortcut = document.createElement('link')
			linkShortcut.rel = 'shortcut icon'
			linkShortcut.type = 'image/x-icon'
			linkShortcut.href = `${finalPath}?v=${timestamp}`
			document.head.appendChild(linkShortcut)

			// Для Apple Touch Icon
			const linkApple = document.createElement('link')
			linkApple.rel = 'apple-touch-icon'
			linkApple.href = `${finalPath}?v=${timestamp}`
			document.head.appendChild(linkApple)

			console.log('✅ Фавикон обновлен:', finalPath)
		}

		// Обновляем фавикон при загрузке страницы
		updateFavicon()

		// Слушаем изменения в localStorage (для обновления в других вкладках)
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === 'punto-infissi-favicon-path') {
				updateFavicon()
			}
		}

		// Слушаем кастомное событие (для обновления в текущей вкладке)
		const handleCustomEvent = () => {
			updateFavicon()
		}

		window.addEventListener('storage', handleStorageChange)
		window.addEventListener('favicon-updated', handleCustomEvent)

		return () => {
			window.removeEventListener('storage', handleStorageChange)
			window.removeEventListener('favicon-updated', handleCustomEvent)
		}
	}, [])

	return null
}
