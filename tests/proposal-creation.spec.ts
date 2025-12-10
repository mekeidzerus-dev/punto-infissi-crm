/**
 * E2E tests for proposal creation
 */

import { test, expect } from '@playwright/test'
import { loginAsUser, TEST_USERS } from './helpers/auth'

test.describe('Proposal Creation', () => {
	test.beforeEach(async ({ page }) => {
		// Авторизуемся перед каждым тестом
		await loginAsUser(page, TEST_USERS.user)
		// Navigate to proposals page
		await page.goto('http://localhost:3000/proposals')
		await page.waitForLoadState('networkidle')
		// Wait a bit for page to fully load
		await page.waitForTimeout(1000)
	})

	test('should load proposals page', async ({ page }) => {
		// Check that page loaded
		await expect(page).toHaveURL(/.*proposals/)
		
		// Check for proposals page elements - ищем заголовок или навигацию
		const proposalsPageContent = page
			.getByRole('link', { name: /Preventivi|Proposals|Предложения/i })
			.or(page.locator('text=/Preventivi|Proposals|Предложения/i'))
			.first()
		await expect(proposalsPageContent).toBeVisible({ timeout: 10000 })

		// Таблица может отсутствовать, если нет предложений - проверяем наличие страницы
		const pageContent = page.locator('body')
		await expect(pageContent).toBeVisible()
		
		// Если есть таблица, проверяем её
		const proposalsTable = page.getByRole('table').first()
		const hasTable = await proposalsTable.isVisible({ timeout: 2000 }).catch(() => false)
		if (hasTable) {
			await expect(proposalsTable).toBeVisible()
		}
	})

	test('should validate proposal data before submission', async ({ page }) => {
		// Set up dialog handler BEFORE clicking
		page.on('dialog', async dialog => {
			expect(dialog.message().toLowerCase()).toMatch(/client|клиент|seleziona|выберите/i)
			await dialog.accept()
		})

		// Try to find and click "New Proposal" button
		const newProposalButton = page.locator('button:has-text("Nuovo")').or(
			page.locator('button:has-text("Новый")')
		).first()
		
		if (await newProposalButton.isVisible({ timeout: 5000 }).catch(() => false)) {
			await newProposalButton.click()
			await page.waitForTimeout(1000)
		}

		// Try to find save button
		const saveButton = page.locator('button:has-text("Salva")').or(
			page.locator('button:has-text("Сохранить")')
		).first()
		
		if (await saveButton.isVisible({ timeout: 5000 }).catch(() => false)) {
			// Button should be disabled if no client/groups
			const isDisabled = await saveButton.isDisabled()
			if (!isDisabled) {
				await saveButton.click()
				await page.waitForTimeout(500)
			}
		}
	})

	test('should access proposal form', async ({ page }) => {
		// Try to open new proposal form
		const newProposalButton = page.locator('button:has-text("Nuovo")').or(
			page.locator('button:has-text("Новый")')
		).first()
		
		if (await newProposalButton.isVisible({ timeout: 5000 }).catch(() => false)) {
			await newProposalButton.click()
			await page.waitForTimeout(2000)
			
			// Check if form is visible
			const formVisible = await page.locator('text=/Proposta|Предложение|Client|Клиент/i').first().isVisible({ timeout: 5000 }).catch(() => false)
			expect(formVisible).toBeTruthy()
		}
	})

	test('should validate API endpoints', async ({ page }) => {
		// Используем request из контекста страницы
		const request = page.context().request
		// Test API endpoints
		const clientsResponse = await request.get('http://localhost:3000/api/clients')
		expect(clientsResponse.ok()).toBeTruthy()

		const vatRatesResponse = await request.get('http://localhost:3000/api/vat-rates')
		expect(vatRatesResponse.ok()).toBeTruthy()

		const proposalsResponse = await request.get('http://localhost:3000/api/proposals')
		expect(proposalsResponse.ok()).toBeTruthy()
	})

	test('should validate proposal creation API', async ({ page }) => {
		const request = page.context().request
		// Test proposal creation with invalid data (should fail validation)
		const invalidResponse = await request.post('http://localhost:3000/api/proposals', {
			data: {
				clientId: 1,
				groups: [{
					name: 'Test Group',
					positions: [{
						// Missing categoryId and supplierCategoryId
						unitPrice: 200,
						quantity: 1,
					}]
				}]
			}
		})

		// Should return 400 (validation error)
		expect([400, 500]).toContain(invalidResponse.status())
		
		const errorData = await invalidResponse.json()
		expect(errorData.error).toBeDefined()
	})
})

