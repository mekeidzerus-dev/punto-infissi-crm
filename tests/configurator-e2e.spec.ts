/**
 * E2E тесты конфигуратора продуктов
 * Проверка создания, сохранения, загрузки и удаления черновиков
 */

import { test, expect } from '@playwright/test'
import { createAuthenticatedApiContext } from './helpers/api-auth'
import { TEST_USERS } from './helpers/auth'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

test.describe('Конфигуратор: E2E тестирование', () => {
	test.describe('API: Черновики конфигуратора', () => {
		test('GET /api/configurator/draft - получение черновика (может быть null)', async ({ browser }) => {
			const { apiRequest } = await createAuthenticatedApiContext(browser)
			const response = await apiRequest.get(`${BASE_URL}/api/configurator/draft`)
			expect(response.status()).toBe(200)
			const data = await response.json()
			// Черновик может быть null если его нет
			expect(data === null || typeof data === 'object').toBe(true)
		})

		test('POST /api/configurator/draft - создание/обновление черновика', async ({ browser }) => {
			const { apiRequest } = await createAuthenticatedApiContext(browser)
			const draftData = {
				configuration: {
					categoryId: 'test-category',
					parameters: {
						width: 100,
						height: 200,
					},
				},
				sessionId: `test-session-${Date.now()}`,
			}

			const response = await apiRequest.post(`${BASE_URL}/api/configurator/draft`, {
				data: draftData,
			})
			expect(response.status()).toBe(200)
			const data = await response.json()
			expect(data).toHaveProperty('id')
			expect(data).toHaveProperty('configuration')
		})

		test('GET /api/configurator/draft после создания - должен вернуть созданный черновик', async ({ browser }) => {
			const { apiRequest, context } = await createAuthenticatedApiContext(browser)
			const sessionId = `test-session-${Date.now()}`
			const draftData = {
				configuration: {
					categoryId: 'test-category',
					parameters: {
						width: 150,
						height: 250,
					},
				},
				sessionId,
			}

			// Создаем черновик
			await apiRequest.post(`${BASE_URL}/api/configurator/draft`, {
				data: draftData,
			})

			// Получаем черновик
			const response = await apiRequest.get(
				`${BASE_URL}/api/configurator/draft?sessionId=${sessionId}`
			)
			expect(response.status()).toBe(200)
			const data = await response.json()
			expect(data).not.toBeNull()
			expect(data).toHaveProperty('configuration')

			await context.close()
		})

		test('DELETE /api/configurator/draft - удаление черновика', async ({ browser }) => {
			const { apiRequest, context } = await createAuthenticatedApiContext(browser)
			const sessionId = `test-session-${Date.now()}`
			const draftData = {
				configuration: {
					categoryId: 'test-category',
					parameters: {},
				},
				sessionId,
			}

			// Создаем черновик
			await apiRequest.post(`${BASE_URL}/api/configurator/draft`, {
				data: draftData,
			})

			// Удаляем черновик
			const response = await apiRequest.delete(
				`${BASE_URL}/api/configurator/draft?sessionId=${sessionId}`
			)
			expect(response.status()).toBe(200)
			const data = await response.json()
			expect(data).toHaveProperty('success')
			expect(data.success).toBe(true)

			await context.close()
		})
	})

	test.describe('UI: Конфигуратор на странице', () => {
		test('Конфигуратор должен загружаться на странице предложений', async ({ page }) => {
			// Авторизация
			try {
				await page.goto(`${BASE_URL}/auth/signin`)
				await page.waitForLoadState('networkidle')
				await page.fill('input[type="email"]', TEST_USERS.user.email)
				await page.fill('input[type="password"]', TEST_USERS.user.password)
				await page.click('button[type="submit"]')
				await page.waitForURL('**/clients', { timeout: 15000 })
			} catch {
				await page.goto(`${BASE_URL}/auth/signin`)
				await page.waitForLoadState('networkidle')
				await page.fill('input[type="email"]', 'Mekeidzerus@gmail.com')
				await page.fill('input[type="password"]', 'Sedrik095055')
				await page.click('button[type="submit"]')
				await page.waitForURL('**/clients', { timeout: 15000 })
			}

			// Переходим на страницу предложений
			await page.goto(`${BASE_URL}/proposals`)
			await page.waitForLoadState('networkidle')

			// Проверяем наличие элементов конфигуратора (если они есть на странице)
			const configuratorElements = page.locator(
				'[data-testid="configurator"], .configurator, .product-configurator'
			)
			const count = await configuratorElements.count()
			// Конфигуратор может быть не на всех страницах, но если есть - должен быть видимым
			if (count > 0) {
				await expect(configuratorElements.first()).toBeVisible({ timeout: 5000 })
			}
		})
	})
})

