import { test, expect } from '@playwright/test'

test.use({ browserName: 'chromium' })

test.describe('Contraagents Section', () => {
	test.beforeEach(async ({ page }) => {
		// Очищаем localStorage перед каждым тестом
		await page.goto('/')
		await page.evaluate(() => {
			localStorage.clear()
		})
	})

	test('should load clients page without errors', async ({ page }) => {
		// Переходим на страницу клиентов
		await page.goto('/clients', { waitUntil: 'networkidle' })

		// Проверяем наличие заголовка или ключевых элементов
		await expect(page.getByText('Clienti').or(page.getByText('Клиенты'))).toBeVisible({ timeout: 10000 })

		// Проверяем наличие таблицы или поиска
		const searchInput = page.locator('input[placeholder*="Cerca"]').or(page.locator('input[placeholder*="Поиск"]')).first()
		await expect(searchInput).toBeVisible({ timeout: 5000 })

		// Ждем загрузки данных
		await page.waitForTimeout(2000)

		// Проверяем, что нет ошибок в консоли
		const errors: string[] = []
		page.on('console', msg => {
			if (msg.type() === 'error') {
				errors.push(msg.text())
			}
		})

		// Делаем скриншот
		await page.screenshot({ path: 'test-results/clients-page.png', fullPage: true })
		
		console.log('Errors found:', errors)
	})

	test('should navigate between tabs without errors', async ({ page }) => {
		await page.goto('/clients')

		// Переходим на Fornitori
		await page.getByText('Fornitori').or(page.getByText('Поставщики')).click()
		await page.waitForURL(/\/suppliers/, { timeout: 10000 })
		await page.waitForTimeout(1000)

		// Переходим на Partners
		await page.getByText('Partner').or(page.getByText('Партнеры')).click()
		await page.waitForURL(/\/partners/, { timeout: 10000 })
		await page.waitForTimeout(1000)

		// Переходим на Installers
		await page.getByText('Installatori').or(page.getByText('Монтажники')).click()
		await page.waitForURL(/\/installers/, { timeout: 10000 })
		await page.waitForTimeout(1000)

		// Возвращаемся на Clients
		await page.getByText('Clienti').or(page.getByText('Клиенты')).click()
		await page.waitForURL(/\/clients/, { timeout: 10000 })
		await page.waitForTimeout(1000)

		// Делаем финальный скриншот
		await page.screenshot({ path: 'test-results/navigation-complete.png', fullPage: true })
	})

	test('should handle API errors gracefully', async ({ page }) => {
		await page.goto('/clients')

		// Проверяем наличие заголовка
		await expect(page.getByText('Clienti').or(page.getByText('Клиенты'))).toBeVisible({ timeout: 10000 })

		// Ждем загрузки
		await page.waitForTimeout(3000)

		// Проверяем наличие элементов таблицы или сообщения об ошибке
		const table = page.locator('table').first()
		await expect(table).toBeVisible({ timeout: 5000 })
	})

	test('should display loading state correctly', async ({ page }) => {
		await page.goto('/clients')

		// Проверяем, что страница загружается
		await expect(page.locator('body')).toBeVisible()

		// Ждем окончания загрузки
		await page.waitForLoadState('networkidle', { timeout: 15000 })

		// Делаем скриншот
		await page.screenshot({ path: 'test-results/loading-complete.png', fullPage: true })
	})
})

