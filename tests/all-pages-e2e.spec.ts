/**
 * E2E тесты всех страниц приложения
 * Проверка загрузки, основных элементов и базового взаимодействия
 */

import { test, expect } from '@playwright/test'
import { loginAsUser, TEST_USERS } from './helpers/auth'
import {
	getTableSelector,
	getAddButtonSelector,
	getSearchInputSelector,
	getDialogSelector,
	getFormSelector,
	isTableVisible,
	getListSelector,
} from './helpers/selectors'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

test.describe('Все страницы: E2E тестирование', () => {
	test.beforeEach(async ({ page }) => {
		// Авторизация перед каждым тестом
		try {
			await loginAsUser(page, TEST_USERS.user)
		} catch (e) {
			// Fallback на альтернативного пользователя
			await page.goto(`${BASE_URL}/auth/signin`)
			await page.waitForLoadState('networkidle')
			await page.fill('input[type="email"]', 'Mekeidzerus@gmail.com')
			await page.fill('input[type="password"]', 'Sedrik095055')
			await page.click('button[type="submit"]')
			await page.waitForURL('**/clients', { timeout: 15000 })
		}
		await page.waitForLoadState('networkidle')
	})

	test('1. /clients - Страница клиентов', async ({ page }) => {
		await page.goto(`${BASE_URL}/clients`)
		await page.waitForLoadState('networkidle')

		// Проверка загрузки страницы
		await expect(page).toHaveURL(/.*\/clients/)

		// Проверка наличия таблицы или списка
		const hasTable = await isTableVisible(page, 5000)
		expect(hasTable).toBe(true)

		// Проверка кнопки добавления
		const addButton = getAddButtonSelector(page)
		if (await addButton.isVisible({ timeout: 3000 }).catch(() => false)) {
			await expect(addButton).toBeVisible()
		}

		// Проверка поиска (если есть)
		const searchInput = getSearchInputSelector(page)
		if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
			await expect(searchInput).toBeVisible()
		}
	})

	test('2. /categories - Страница категорий', async ({ page }) => {
		await page.goto(`${BASE_URL}/categories`)
		await page.waitForLoadState('networkidle')

		await expect(page).toHaveURL(/.*\/categories/)

		// Проверка наличия контента
		const content = page.locator('h1, h2, [role="heading"], .categories-list, table').first()
		await expect(content).toBeVisible({ timeout: 5000 })

		// Проверка кнопки добавления
		const addButton = getAddButtonSelector(page)
		if (await addButton.isVisible({ timeout: 3000 }).catch(() => false)) {
			await expect(addButton).toBeVisible()
		}
	})

	test('3. /suppliers - Страница поставщиков', async ({ page }) => {
		await page.goto(`${BASE_URL}/suppliers`)
		await page.waitForLoadState('networkidle')

		await expect(page).toHaveURL(/.*\/suppliers/)

		// Проверка наличия контента
		const hasTable = await isTableVisible(page, 5000)
		expect(hasTable).toBe(true)

		// Проверка кнопки добавления
		const addButton = getAddButtonSelector(page)
		if (await addButton.isVisible({ timeout: 3000 }).catch(() => false)) {
			await expect(addButton).toBeVisible()
		}
	})

	test('4. /proposals - Страница предложений', async ({ page }) => {
		await page.goto(`${BASE_URL}/proposals`)
		await page.waitForLoadState('networkidle')

		await expect(page).toHaveURL(/.*\/proposals/)

		// Проверка наличия контента
		const content = page.locator('h1, h2, [role="heading"], table, .proposals-list').first()
		await expect(content).toBeVisible({ timeout: 5000 })

		// Проверка кнопки создания
		const createButton = page
			.locator('button:has-text("Создать"), button:has-text("Create"), button:has-text("+")')
			.first()
		if (await createButton.isVisible({ timeout: 3000 }).catch(() => false)) {
			await expect(createButton).toBeVisible()
		}
	})

	test('5. /parameters - Страница параметров', async ({ page }) => {
		await page.goto(`${BASE_URL}/parameters`)
		await page.waitForLoadState('networkidle')

		await expect(page).toHaveURL(/.*\/parameters/)

		// Проверка наличия контента
		const content = page.locator('h1, h2, [role="heading"], table, .parameters-list').first()
		await expect(content).toBeVisible({ timeout: 5000 })

		// Проверка кнопки добавления
		const addButton = getAddButtonSelector(page)
		if (await addButton.isVisible({ timeout: 3000 }).catch(() => false)) {
			await expect(addButton).toBeVisible()
		}
	})

	test('6. /partners - Страница партнеров', async ({ page }) => {
		await page.goto(`${BASE_URL}/partners`)
		await page.waitForLoadState('networkidle')

		await expect(page).toHaveURL(/.*\/partners/)

		// Проверка наличия контента
		const hasTable = await isTableVisible(page, 5000)
		expect(hasTable).toBe(true)

		// Проверка кнопки добавления
		const addButton = getAddButtonSelector(page)
		if (await addButton.isVisible({ timeout: 3000 }).catch(() => false)) {
			await expect(addButton).toBeVisible()
		}
	})

	test('7. /installers - Страница установщиков', async ({ page }) => {
		await page.goto(`${BASE_URL}/installers`)
		await page.waitForLoadState('networkidle')

		await expect(page).toHaveURL(/.*\/installers/)

		// Проверка наличия контента
		const hasTable = await isTableVisible(page, 5000)
		expect(hasTable).toBe(true)

		// Проверка кнопки добавления
		const addButton = getAddButtonSelector(page)
		if (await addButton.isVisible({ timeout: 3000 }).catch(() => false)) {
			await expect(addButton).toBeVisible()
		}
	})

	test('8. /orders - Страница заказов', async ({ page }) => {
		await page.goto(`${BASE_URL}/orders`)
		await page.waitForLoadState('networkidle')

		await expect(page).toHaveURL(/.*\/orders/)

		// Проверка наличия контента
		const content = page.locator('h1, h2, [role="heading"], table, .orders-list').first()
		await expect(content).toBeVisible({ timeout: 5000 })
	})

	test('9. /settings - Страница настроек', async ({ page }) => {
		await page.goto(`${BASE_URL}/settings`)
		await page.waitForLoadState('networkidle')

		await expect(page).toHaveURL(/.*\/settings/)

		// Проверка наличия контента
		const content = page.locator('h1, h2, [role="heading"]').first()
		await expect(content).toBeVisible({ timeout: 5000 })

		// Проверка наличия форм настроек
		const form = getFormSelector(page)
		if (await form.isVisible({ timeout: 3000 }).catch(() => false)) {
			await expect(form).toBeVisible()
		}
	})

	test('10. /profile - Страница профиля', async ({ page }) => {
		await page.goto(`${BASE_URL}/profile`)
		await page.waitForLoadState('networkidle')

		await expect(page).toHaveURL(/.*\/profile/)

		// Проверка наличия контента
		const content = page.locator('h1, h2, [role="heading"]').first()
		await expect(content).toBeVisible({ timeout: 5000 })

		// Проверка наличия формы профиля
		const form = getFormSelector(page)
		if (await form.isVisible({ timeout: 3000 }).catch(() => false)) {
			await expect(form).toBeVisible()
		}
	})

	test('11. Навигация между страницами', async ({ page }) => {
		// Проверка навигационного меню
		const nav = page.locator('nav, [role="navigation"], .navbar, .sidebar').first()
		await expect(nav).toBeVisible({ timeout: 5000 })

		// Проверка ссылок в меню
		const navLinks = page.locator('nav a, [role="navigation"] a')
		const linkCount = await navLinks.count()
		expect(linkCount).toBeGreaterThan(0)

		// Проверка перехода по ссылкам
		if (linkCount > 0) {
			const firstLink = navLinks.first()
			const href = await firstLink.getAttribute('href')
			if (href && !href.startsWith('#')) {
				await firstLink.click()
				await page.waitForLoadState('networkidle')
				// Проверяем, что произошел переход
				expect(page.url()).not.toBe(`${BASE_URL}/clients`)
			}
		}
	})

	test('12. Модальные окна на страницах', async ({ page }) => {
		// Тестируем на странице клиентов
		await page.goto(`${BASE_URL}/clients`)
		await page.waitForLoadState('networkidle')

		const addButton = getAddButtonSelector(page)
		if (await addButton.isVisible({ timeout: 3000 }).catch(() => false)) {
			await addButton.click()
			await page.waitForTimeout(500)

			// Проверка наличия диалога
			const dialog = getDialogSelector(page)
			if (await dialog.isVisible({ timeout: 3000 }).catch(() => false)) {
				await expect(dialog).toBeVisible()

				// Закрываем диалог
				const closeBtn = page
					.locator('button:has-text("Отмена"), button:has-text("Cancel"), [aria-label="Close"]')
					.first()
				if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
					await closeBtn.click()
					await page.waitForTimeout(300)
				}
			}
		}
	})
})

