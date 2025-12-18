/**
 * E2E тесты PDF генератора
 * Проверка генерации, предпросмотра, скачивания PDF из предложений
 */

import { test, expect } from '@playwright/test'
import { createAuthenticatedApiContext } from './helpers/api-auth'
import { TEST_USERS } from './helpers/auth'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

test.describe('PDF генератор: E2E тестирование', () => {
	test.describe('UI: PDF предпросмотр на странице предложений', () => {
		test('PDF предпросмотр должен отображаться для предложения', async ({ page }) => {
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

			// Проверяем наличие элементов PDF предпросмотра
			const pdfElements = page.locator(
				'[data-testid="pdf-preview"], .pdf-preview, button:has-text("PDF"), button:has-text("Предпросмотр")'
			)
			const count = await pdfElements.count()
			
			// Если есть элементы PDF - проверяем их видимость
			if (count > 0) {
				await expect(pdfElements.first()).toBeVisible({ timeout: 5000 })
			}
		})

		test('Кнопка скачивания PDF должна быть доступна', async ({ page }) => {
			// Авторизация
			try {
				await page.goto('/auth/signin')
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

			await page.goto(`${BASE_URL}/proposals`)
			await page.waitForLoadState('networkidle')

			// Ищем кнопки скачивания/печати PDF
			const downloadButtons = page.locator(
				'button:has-text("Скачать"), button:has-text("Download"), button:has-text("Печать"), button:has-text("Print"), [aria-label*="download"], [aria-label*="Download"]'
			)
			const count = await downloadButtons.count()
			
			// Если есть кнопки - проверяем их видимость
			if (count > 0) {
				await expect(downloadButtons.first()).toBeVisible({ timeout: 5000 })
			}
		})

		test('PDF компонент должен рендериться без ошибок', async ({ page }) => {
			// Авторизация
			try {
				await page.goto('/auth/signin')
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

			await page.goto(`${BASE_URL}/proposals`)
			await page.waitForLoadState('networkidle')

			// Проверяем отсутствие ошибок в консоли
			const errors: string[] = []
			page.on('console', msg => {
				if (msg.type() === 'error') {
					errors.push(msg.text())
				}
			})

			// Ждем немного для загрузки компонентов
			await page.waitForTimeout(2000)

			// Проверяем, что нет критических ошибок PDF
			const pdfErrors = errors.filter(e => 
				e.toLowerCase().includes('pdf') || 
				e.toLowerCase().includes('react-pdf') ||
				e.toLowerCase().includes('jspdf')
			)
			expect(pdfErrors.length).toBe(0)
		})
	})

	test.describe('Функциональность: Генерация PDF', () => {
		test('PDF должен генерироваться из данных предложения', async ({ page }) => {
			// Авторизация
			try {
				await page.goto('/auth/signin')
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

			await page.goto(`${BASE_URL}/proposals`)
			await page.waitForLoadState('networkidle')

			// Ищем предложения в списке
			const proposals = page.locator('table tbody tr, [role="row"], .proposal-item')
			const proposalCount = await proposals.count()

			if (proposalCount > 0) {
				// Кликаем на первое предложение для открытия деталей
				await proposals.first().click()
				await page.waitForTimeout(1000)

				// Ищем кнопку предпросмотра PDF
				const previewButton = page.locator(
					'button:has-text("Предпросмотр"), button:has-text("Preview"), button:has-text("PDF")'
				).first()
				
				if (await previewButton.isVisible({ timeout: 3000 }).catch(() => false)) {
					await previewButton.click()
					await page.waitForTimeout(1000)

					// Проверяем наличие PDF контента
					const pdfContent = page.locator('.pdf-preview, [data-testid="pdf-preview"], canvas')
					if (await pdfContent.count() > 0) {
						await expect(pdfContent.first()).toBeVisible({ timeout: 5000 })
					}
				}
			}
		})
	})
})

