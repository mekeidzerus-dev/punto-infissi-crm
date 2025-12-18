import { test, expect } from '@playwright/test'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

test.describe('Backend API Security Tests', () => {
	test('GET /api/parameters - должен требовать аутентификацию', async ({ request }) => {
		const response = await request.get(`${BASE_URL}/api/parameters`)
		
		expect(response.status()).toBe(401)
		const body = await response.json()
		expect(body.error).toContain('Authentication')
	})

	test('GET /api/dictionaries - должен требовать аутентификацию', async ({ request }) => {
		const response = await request.get(`${BASE_URL}/api/dictionaries`)
		
		expect(response.status()).toBe(401)
		const body = await response.json()
		expect(body.error).toContain('Authentication')
	})

	test('GET /api/categories/with-counts - должен требовать аутентификацию', async ({ request }) => {
		const response = await request.get(`${BASE_URL}/api/categories/with-counts`)
		
		expect(response.status()).toBe(401)
		const body = await response.json()
		expect(body.error).toContain('Authentication')
	})

	test('GET /api/categories/[id] - должен требовать аутентификацию', async ({ request }) => {
		const response = await request.get(`${BASE_URL}/api/categories/test-id`)
		
		expect(response.status()).toBe(401)
		const body = await response.json()
		expect(body.error).toContain('Authentication')
	})

	test('GET /api/categories - должен фильтровать по organizationId', async ({ browser }) => {
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
		const categories = await response.json()
		
		// Проверяем, что все категории принадлежат одной организации
		if (categories.length > 0) {
			const organizationIds = new Set(categories.map((c: any) => c.organizationId).filter(Boolean))
			expect(organizationIds.size).toBeLessThanOrEqual(1)
		}

		await context.close()
	})

	test('POST /api/categories - должен устанавливать organizationId при создании', async ({ browser }) => {
		if (!browser) {
			test.skip()
			return
		}

		const context = await browser.newContext({
			storageState: 'playwright/.auth/user.json',
		})
		const page = await context.newPage()

		const categoryData = {
			name: `Test Category ${Date.now()}`,
			icon: 'tag',
			description: 'Test description',
		}

		const response = await page.request.post(`${BASE_URL}/api/categories`, {
			data: categoryData,
		})
		
		expect(response.status()).toBe(201)
		const category = await response.json()
		expect(category.organizationId).toBeTruthy()

		await context.close()
	})
})

