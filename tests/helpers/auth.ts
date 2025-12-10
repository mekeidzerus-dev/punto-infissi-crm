/**
 * Helper функции для авторизации в Playwright тестах
 */

import { Page } from '@playwright/test'

export interface TestUser {
	email: string
	password: string
	name?: string
}

export const TEST_USERS = {
	admin: {
		email: 'admin@modocrm.com',
		password: 'Admin123456',
		name: 'Admin User',
	},
	user: {
		email: 'user@modocrm.com',
		password: 'User123456',
		name: 'Test User',
	},
} as const

/**
 * Выполняет авторизацию пользователя в системе
 * @param page - Playwright page объект
 * @param user - Данные пользователя для входа
 * @returns Promise<void>
 */
export async function loginAsUser(
	page: Page,
	user: TestUser = TEST_USERS.user
): Promise<void> {
	await page.goto('/auth/signin')
	await page.waitForLoadState('networkidle')

	// Заполняем форму авторизации
	await page.fill('input[type="email"]', user.email)
	await page.fill('input[type="password"]', user.password)

	// Нажимаем кнопку входа
	const submitButton = page.locator('button[type="submit"]')
	await submitButton.click()

	// Ждем редиректа после успешной авторизации
	await page.waitForURL('**/clients', { timeout: 10000 })
	await page.waitForLoadState('networkidle')
}

/**
 * Проверяет, авторизован ли пользователь
 * @param page - Playwright page объект
 * @returns Promise<boolean>
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
	const currentUrl = page.url()
	return !currentUrl.includes('/auth/signin') && !currentUrl.includes('/auth/signup')
}

/**
 * Выполняет выход из системы
 * @param page - Playwright page объект
 * @returns Promise<void>
 */
export async function logout(page: Page): Promise<void> {
	// Ищем кнопку выхода в меню пользователя
	const userMenuButton = page.locator('button:has([class*="rounded-full"])').last()
	
	if (await userMenuButton.isVisible({ timeout: 3000 })) {
		await userMenuButton.click()
		
		// Ищем ссылку выхода
		const logoutLink = page.locator('text=Выйти, text=Logout').first()
		if (await logoutLink.isVisible({ timeout: 2000 })) {
			await logoutLink.click()
			await page.waitForURL('**/auth/signin', { timeout: 5000 })
		}
	}
}

/**
 * Создает нового пользователя через API (для тестов)
 * @param baseURL - Базовый URL приложения
 * @param userData - Данные пользователя
 * @returns Promise<{ id: string; email: string }>
 */
export async function createTestUser(
	baseURL: string,
	userData: { email: string; password: string; name?: string }
): Promise<{ id: string; email: string }> {
	const response = await fetch(`${baseURL}/api/auth/register`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			email: userData.email,
			password: userData.password,
			name: userData.name || 'Test User',
		}),
	})

	if (!response.ok) {
		const error = await response.text()
		throw new Error(`Failed to create test user: ${error}`)
	}

	return await response.json()
}

