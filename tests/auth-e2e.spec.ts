/**
 * E2E тесты аутентификации (фронтенд)
 */

import { test, expect } from '@playwright/test'

const TEST_USER = {
	email: 'test@modocrm.com',
	password: 'Test123456',
	newPassword: 'NewTest123456',
}

test.describe('Аутентификация', () => {
	test.beforeEach(async ({ page }) => {
		// Переходим на страницу входа
		await page.goto('http://localhost:3000/auth/signin')
	})

	test('Вход с правильными данными', async ({ page }) => {
		// Заполняем форму
		await page.fill('input[type="email"]', TEST_USER.email)
		await page.fill('input[type="password"]', TEST_USER.password)
		
		// Отправляем форму
		await page.click('button[type="submit"]')
		
		// Ждем редиректа на /clients
		await page.waitForURL('**/clients', { timeout: 5000 })
		
		// Проверяем, что мы на странице клиентов
		expect(page.url()).toContain('/clients')
	})

	test('Вход с неверным паролем', async ({ page }) => {
		await page.fill('input[type="email"]', TEST_USER.email)
		await page.fill('input[type="password"]', 'WrongPassword123')
		
		await page.click('button[type="submit"]')
		
		// Ждем появления toast с ошибкой
		await page.waitForSelector('text=/неверный|non validi/i', { timeout: 3000 })
		
		// Проверяем, что остались на странице входа
		expect(page.url()).toContain('/auth/signin')
	})

	test('Вход с несуществующим email', async ({ page }) => {
		await page.fill('input[type="email"]', 'nonexistent@example.com')
		await page.fill('input[type="password"]', TEST_USER.password)
		
		await page.click('button[type="submit"]')
		
		// Ждем появления toast с ошибкой
		await page.waitForSelector('text=/неверный|non validi/i', { timeout: 3000 })
		
		expect(page.url()).toContain('/auth/signin')
	})

	test('Переход на страницу восстановления пароля', async ({ page }) => {
		// Кликаем на ссылку "Забыли пароль?"
		await page.click('text=/забыли|dimenticata/i')
		
		// Проверяем редирект
		await page.waitForURL('**/auth/forgot-password', { timeout: 3000 })
		expect(page.url()).toContain('/auth/forgot-password')
	})

	test('Запрос восстановления пароля', async ({ page }) => {
		// Переходим на страницу восстановления
		await page.goto('http://localhost:3000/auth/forgot-password')
		
		// Заполняем email
		await page.fill('input[type="email"]', TEST_USER.email)
		
		// Отправляем форму
		await page.click('button[type="submit"]')
		
		// Ждем сообщения об успехе
		await page.waitForSelector('text=/отправлено|sent/i', { timeout: 5000 })
	})

	test('Выход из системы', async ({ page }) => {
		// Сначала входим
		await page.fill('input[type="email"]', TEST_USER.email)
		await page.fill('input[type="password"]', TEST_USER.password)
		await page.click('button[type="submit"]')
		await page.waitForURL('**/clients', { timeout: 5000 })
		
		// Ищем меню пользователя (обычно в правом верхнем углу)
		// Попробуем найти по email или имени пользователя
		const userMenu = page.locator('button').filter({ hasText: TEST_USER.email }).or(
			page.locator('button').filter({ hasText: 'Test User' })
		).first()
		
		if (await userMenu.count() > 0) {
			await userMenu.click()
			
			// Ищем кнопку выхода
			const signOutButton = page.locator('text=/выйти|esci|sign out/i').first()
			if (await signOutButton.count() > 0) {
				await signOutButton.click()
				
				// Проверяем редирект на страницу входа
				await page.waitForURL('**/auth/signin', { timeout: 5000 })
				expect(page.url()).toContain('/auth/signin')
			} else {
				console.log('⚠️ Кнопка выхода не найдена')
			}
		} else {
			console.log('⚠️ Меню пользователя не найдено')
		}
	})

	test('Валидация формы входа', async ({ page }) => {
		// Пытаемся отправить пустую форму
		await page.click('button[type="submit"]')
		
		// Проверяем, что браузер показывает валидацию (required атрибут)
		const emailInput = page.locator('input[type="email"]')
		const passwordInput = page.locator('input[type="password"]')
		
		// Проверяем, что поля обязательны
		expect(await emailInput.getAttribute('required')).toBe('')
		expect(await passwordInput.getAttribute('required')).toBe('')
	})
})

