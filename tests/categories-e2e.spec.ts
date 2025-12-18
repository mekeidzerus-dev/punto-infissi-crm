import { test, expect } from '@playwright/test'

test.describe('Categories E2E Tests', () => {
	test.beforeEach(async ({ page }) => {
		// Переход на страницу категорий
		await page.goto('/categories')
	})

	test('должен отображать страницу категорий без ошибок', async ({ page }) => {
		// Проверяем, что страница загрузилась
		await page.waitForLoadState('networkidle')

		// Проверяем отсутствие ошибок в консоли
		const errors: string[] = []
		page.on('console', msg => {
			if (msg.type() === 'error') {
				errors.push(msg.text())
			}
		})

		// Ждем немного для загрузки данных
		await page.waitForTimeout(2000)

		// Проверяем, что нет ошибок 400 Bad Request
		const errorMessages = errors.filter(err => 
			err.includes('400') || 
			err.includes('Bad Request') || 
			err.includes('Database error')
		)

		expect(errorMessages.length).toBe(0)
	})

	test('должен загружать категории через API', async ({ page }) => {
		// Перехватываем запросы к API
		const apiRequests: any[] = []
		
		page.on('response', response => {
			if (response.url().includes('/api/categories')) {
				apiRequests.push({
					url: response.url(),
					status: response.status(),
					ok: response.ok(),
				})
			}
		})

		await page.goto('/categories')
		await page.waitForLoadState('networkidle')
		await page.waitForTimeout(2000)

		// Проверяем, что был запрос к API
		expect(apiRequests.length).toBeGreaterThan(0)

		// Проверяем, что запрос был успешным (200 или 401 если не авторизован)
		const categoriesRequest = apiRequests.find(r => r.url.includes('/api/categories'))
		if (categoriesRequest) {
			// Если пользователь не авторизован, ожидаем 401
			// Если авторизован, ожидаем 200
			expect([200, 401]).toContain(categoriesRequest.status)
		}
	})

	test('должен показывать сообщение при отсутствии категорий', async ({ page }) => {
		await page.goto('/categories')
		await page.waitForLoadState('networkidle')

		// Проверяем наличие кнопки добавления первой категории или списка категорий
		const addButton = page.locator('button:has-text("Aggiungi"), button:has-text("Add"), button:has-text("Добавить")')
		const categoryList = page.locator('[data-testid="category-list"], .category-item')

		// Должна быть либо кнопка добавления, либо список категорий
		const hasAddButton = await addButton.count() > 0
		const hasCategoryList = await categoryList.count() > 0

		expect(hasAddButton || hasCategoryList).toBe(true)
	})

	test('не должен показывать ошибки в консоли при загрузке', async ({ page }) => {
		const consoleErrors: string[] = []
		
		page.on('console', msg => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text())
			}
		})

		await page.goto('/categories')
		await page.waitForLoadState('networkidle')
		await page.waitForTimeout(3000)

		// Фильтруем только критические ошибки (игнорируем предупреждения)
		const criticalErrors = consoleErrors.filter(err => 
			err.includes('400') || 
			err.includes('500') ||
			err.includes('Database error') ||
			err.includes('Failed to fetch')
		)

		expect(criticalErrors.length).toBe(0)
	})
})



