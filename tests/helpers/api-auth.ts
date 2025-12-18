/**
 * Helper функции для авторизации в API тестах Playwright
 * Правильная работа с cookies через browser context
 */

import { APIRequestContext, Browser, BrowserContext, Page } from '@playwright/test'
import { TEST_USERS, type TestUser } from './auth'

/**
 * Создает авторизованный API request context через browser context
 * Это правильный способ передачи cookies в API запросах Playwright
 */
export async function createAuthenticatedApiContext(
	browser: Browser,
	user: TestUser = TEST_USERS.user
): Promise<{ context: BrowserContext; page: Page; apiRequest: APIRequestContext }> {
	const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
	
	// Создаем новый browser context
	const context = await browser.newContext()
	const page = await context.newPage()

	// Авторизуемся через браузер
	await page.goto(`${baseUrl}/auth/signin`)
	await page.waitForLoadState('networkidle')

	// Заполняем форму авторизации
	await page.fill('input[type="email"]', user.email)
	await page.fill('input[type="password"]', user.password)

	// Нажимаем кнопку входа
	const submitButton = page.locator('button[type="submit"]')
	await submitButton.click()

	// Ждем редиректа после успешной авторизации
	await page.waitForURL('**/clients', { timeout: 15000 })
	await page.waitForLoadState('networkidle')

	// Используем page.request для автоматической передачи cookies
	const apiRequest = page.request

	return { context, page, apiRequest }
}

/**
 * Получает cookies из browser context и преобразует в строку для заголовка Cookie
 */
export async function getCookiesAsString(context: BrowserContext): Promise<string> {
	const cookies = await context.cookies()
	return cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ')
}

/**
 * Выполняет авторизованный API запрос через page.request
 * Автоматически передает cookies из browser context
 */
export async function authenticatedApiRequest<T = unknown>(
	page: Page,
	method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
	url: string,
	data?: unknown
): Promise<{ status: number; data: T }> {
	const options: Parameters<Page['request']['get']>[1] = {
		headers: {
			'Content-Type': 'application/json',
		},
	}

	if (data) {
		options.data = data
	}

	let response
	switch (method) {
		case 'GET':
			response = await page.request.get(url, options)
			break
		case 'POST':
			response = await page.request.post(url, options)
			break
		case 'PUT':
			response = await page.request.put(url, options)
			break
		case 'DELETE':
			response = await page.request.delete(url, options)
			break
		case 'PATCH':
			response = await page.request.patch(url, options)
			break
	}

	const responseData = await response.json()
	return {
		status: response.status(),
		data: responseData as T,
	}
}

