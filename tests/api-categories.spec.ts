import { test, expect } from '@playwright/test'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

test.describe('API Categories Tests', () => {
	let authCookie: string | null = null

	test.beforeAll(async ({ request }) => {
		// Попытка авторизации для получения cookie
		const loginResponse = await request.post(`${BASE_URL}/api/auth/callback/credentials`, {
			data: {
				email: 'admin@modocrm.com',
				password: 'admin123',
			},
		})

		if (loginResponse.ok()) {
			const cookies = loginResponse.headers()['set-cookie']
			if (cookies) {
				authCookie = cookies
			}
		}
	})

	test('GET /api/categories - должен требовать аутентификацию', async ({ request }) => {
		const response = await request.get(`${BASE_URL}/api/categories`)
		
		expect(response.status()).toBe(401)
		const body = await response.json()
		expect(body.error).toContain('Authentication')
	})

	test('GET /api/categories - должен возвращать категории для авторизованного пользователя', async ({ browser }) => {
		if (!browser) {
			test.skip()
			return
		}

		const context = await browser.newContext({
			storageState: 'playwright/.auth/user.json',
		})
		const page = await context.newPage()
		const response = await page.request.get(`${BASE_URL}/api/categories`)
		
		expect(response.status()).toBe(200)
		const body = await response.json()
		expect(Array.isArray(body)).toBe(true)

		await context.close()
	})

	test('GET /api/product-categories - должен требовать аутентификацию', async ({ request }) => {
		const response = await request.get(`${BASE_URL}/api/product-categories`)
		
		expect(response.status()).toBe(401)
		const body = await response.json()
		expect(body.error).toContain('Authentication')
	})

	test('GET /api/product-categories - должен возвращать категории для авторизованного пользователя', async ({ browser }) => {
		if (!browser) {
			test.skip()
			return
		}

		const context = await browser.newContext({
			storageState: 'playwright/.auth/user.json',
		})
		const page = await context.newPage()
		const response = await page.request.get(`${BASE_URL}/api/product-categories`)
		
		expect(response.status()).toBe(200)
		const body = await response.json()
		expect(Array.isArray(body)).toBe(true)

		await context.close()
	})

	test('POST /api/categories - должен требовать аутентификацию', async ({ request }) => {
		const response = await request.post(`${BASE_URL}/api/categories`, {
			data: {
				name: 'Test Category',
				icon: 'tag',
			},
		})
		
		expect(response.status()).toBe(401)
	})

	test('POST /api/categories - должен создавать категорию с organizationId', async ({ browser }) => {
		if (!browser) {
			test.skip()
			return
		}

		const context = await browser.newContext({
			storageState: 'playwright/.auth/user.json',
		})
		const page = await context.newPage()

		const response = await page.request.post(`${BASE_URL}/api/categories`, {
			data: {
				name: `Test Category ${Date.now()}`,
				icon: 'tag',
				description: 'Test description',
			},
		})
		
		expect(response.status()).toBe(201)
		const body = await response.json()
		expect(body.name).toBeTruthy()
		expect(body.organizationId).toBeTruthy()

		await context.close()
	})
})

