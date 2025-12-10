import { test, expect, type Page, type Dialog } from '@playwright/test'
import { loginAsUser, TEST_USERS } from './helpers/auth'
import path from 'path'

const TEST_IMAGE = path.join(__dirname, 'fixtures', 'test-favicon.png')

const acceptDialogs = (page: Page) => {
	const handler = (dialog: Dialog) => dialog.accept()
	page.on('dialog', handler)
	return () => page.off('dialog', handler)
}

test.describe('Favicon System', () => {
	test.skip(({ browserName }) => browserName !== 'chromium')

	test.beforeEach(async ({ page }) => {
		// Авторизуемся перед каждым тестом
		await loginAsUser(page, TEST_USERS.user)
		// Очищаем localStorage перед каждым тестом
		await page.goto('/settings')
		await page.evaluate(() => {
			localStorage.removeItem('modocrm-favicon-path')
		})
	})

	test('should load settings page', async ({ page }) => {
		await page.goto('/settings')

		await expect(page.getByText('Настройки')).toBeVisible()
		await expect(page.getByText('Фавикон', { exact: true })).toBeVisible()
	})

	test('should upload favicon successfully', async ({ page }) => {
		await page.goto('/settings')
		const stopDialogListener = acceptDialogs(page)

		const fileInput = page.locator('input#favicon-upload')
		await fileInput.setInputFiles(TEST_IMAGE)

		const preview = page.locator('img[alt="Фавикон"]')
		await expect(preview).toBeVisible({ timeout: 5000 })

		const faviconLink = page.locator('head >> link[rel="icon"]')
		await expect
			.poll(async () => {
				const href = await faviconLink.getAttribute('href')
				return href && href.includes('favicon-')
			})
			.toBeTruthy()

		const storedPath = await page.evaluate(() =>
			localStorage.getItem('modocrm-favicon-path')
		)
		expect(storedPath).toMatch(/\/favicon-/)

		stopDialogListener()
	})

	test('should persist favicon after page reload', async ({ page }) => {
		await page.goto('/settings')
		const stopDialogListener = acceptDialogs(page)

		const fileInput = page.locator('input#favicon-upload')
		await fileInput.setInputFiles(TEST_IMAGE)

		const faviconLink = page.locator('head >> link[rel="icon"]')
		await expect
			.poll(async () => {
				const href = await faviconLink.getAttribute('href')
				return href && href.includes('favicon-')
			})
			.toBeTruthy()

		const hrefBefore = await faviconLink.getAttribute('href')

		await page.reload()
		await expect
			.poll(async () => {
				const hrefAfter = await faviconLink.getAttribute('href')
				return (
					hrefAfter && hrefAfter.split('?')[0] === hrefBefore?.split('?')[0]
				)
			})
			.toBeTruthy()

		stopDialogListener()
	})

	test('should reset favicon to default', async ({ page }) => {
		await page.goto('/settings')
		const stopDialogListener = acceptDialogs(page)

		const fileInput = page.locator('input#favicon-upload')
		await fileInput.setInputFiles(TEST_IMAGE)

		const preview = page.locator('img[alt="Фавикон"]')
		await expect(preview).toBeVisible({ timeout: 5000 })

		// Используем более специфичный селектор для кнопки сброса
		// Ищем все кнопки "Сбросить" и берем ту, которая не disabled
		const resetButtons = page.getByRole('button', { name: /сбросить|reset/i })
		const resetButtonCount = await resetButtons.count()
		
		let resetButton
		if (resetButtonCount > 1) {
			// Если несколько кнопок, берем ту, которая не disabled и видна
			for (let i = 0; i < resetButtonCount; i++) {
				const btn = resetButtons.nth(i)
				const isDisabled = await btn.isDisabled().catch(() => false)
				const isVisible = await btn.isVisible().catch(() => false)
				if (!isDisabled && isVisible) {
					resetButton = btn
					break
				}
			}
			if (!resetButton) {
				resetButton = resetButtons.filter({ hasNotText: /сохранить|save/i }).first()
			}
		} else {
			resetButton = resetButtons.first()
		}
		
		await resetButton.waitFor({ state: 'visible', timeout: 5000 })
		await resetButton.click()

		await expect(preview).not.toBeVisible({ timeout: 5000 })

		const faviconLink = page.locator('head >> link[rel="icon"]')
		await expect
			.poll(async () => {
				const href = await faviconLink.getAttribute('href')
				return href && href.includes('default-favicon.ico')
			})
			.toBeTruthy()

		const storedPath = await page.evaluate(() =>
			localStorage.getItem('modocrm-favicon-path')
		)
		expect(storedPath).toBeNull()

		stopDialogListener()
	})

	test('should reject invalid file types', async ({ page }) => {
		await page.goto('/settings')

		const fileInput = page.locator('input#favicon-upload')
		const acceptAttr = await fileInput.getAttribute('accept')
		expect(acceptAttr).toBe('image/*')
	})
})
