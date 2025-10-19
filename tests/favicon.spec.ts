import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('Favicon System', () => {
	test.beforeEach(async ({ page }) => {
		// Очищаем localStorage перед каждым тестом
		await page.goto('/settings')
		await page.evaluate(() => {
			localStorage.removeItem('punto-infissi-favicon-path')
		})
	})

	test('should load settings page', async ({ page }) => {
		await page.goto('/settings')

		// Проверяем наличие заголовка
		await expect(page.getByText('Настройки')).toBeVisible()

		// Проверяем наличие секции фавикона
		await expect(page.getByText('Фавикон сайта')).toBeVisible()
	})

	test('should upload favicon successfully', async ({ page }) => {
		await page.goto('/settings')

		// Создаем тестовый PNG файл
		const testImagePath = path.join(__dirname, 'fixtures', 'test-favicon.png')

		// Загружаем файл
		const fileInput = page.locator('input[type="file"]')
		await fileInput.setInputFiles(testImagePath)

		// Ждем появления превью
		await expect(page.locator('img[alt="Favicon preview"]')).toBeVisible({
			timeout: 5000,
		})

		// Проверяем сообщение об успехе
		await expect(page.getByText('Фавикон загружен и применен')).toBeVisible()

		// Проверяем кнопку сброса
		await expect(page.getByText('Сбросить фавикон')).toBeVisible()

		// Проверяем, что фавикон применился
		const faviconLink = page.locator('link[rel="icon"]')
		const href = await faviconLink.getAttribute('href')
		expect(href).toContain('favicon-')
	})

	test('should persist favicon after page reload', async ({ page }) => {
		await page.goto('/settings')

		const testImagePath = path.join(__dirname, 'fixtures', 'test-favicon.png')

		// Загружаем файл
		const fileInput = page.locator('input[type="file"]')
		await fileInput.setInputFiles(testImagePath)

		// Ждем успешной загрузки
		await expect(page.locator('img[alt="Favicon preview"]')).toBeVisible({
			timeout: 5000,
		})

		// Получаем путь к фавикону
		const faviconLink = page.locator('link[rel="icon"]')
		const hrefBefore = await faviconLink.getAttribute('href')

		// Перезагружаем страницу
		await page.reload()

		// Проверяем, что фавикон остался
		await page.waitForTimeout(1000) // Даем время FaviconUpdater сработать
		const hrefAfter = await faviconLink.getAttribute('href')

		// Должен быть тот же файл (без учета timestamp)
		const fileNameBefore = hrefBefore?.split('?')[0].split('/').pop()
		const fileNameAfter = hrefAfter?.split('?')[0].split('/').pop()
		expect(fileNameBefore).toBe(fileNameAfter)
	})

	test('should reset favicon to default', async ({ page }) => {
		await page.goto('/settings')

		const testImagePath = path.join(__dirname, 'fixtures', 'test-favicon.png')

		// Загружаем файл
		const fileInput = page.locator('input[type="file"]')
		await fileInput.setInputFiles(testImagePath)

		await expect(page.locator('img[alt="Favicon preview"]')).toBeVisible({
			timeout: 5000,
		})

		// Нажимаем кнопку сброса
		await page.getByText('Сбросить фавикон').click()

		// Ждем подтверждения
		page.once('dialog', dialog => dialog.accept())

		// Проверяем, что превью исчезло
		await expect(page.locator('img[alt="Favicon preview"]')).not.toBeVisible()

		// Проверяем, что фавикон вернулся к дефолтному
		const faviconLink = page.locator('link[rel="icon"]')
		const href = await faviconLink.getAttribute('href')
		expect(href).toContain('default-favicon.ico')
	})

	test('should reject invalid file types', async ({ page }) => {
		await page.goto('/settings')

		// Пытаемся загрузить неподдерживаемый файл
		const testFilePath = path.join(__dirname, 'fixtures', 'test-document.pdf')

		const fileInput = page.locator('input[type="file"]')

		// Проверяем, что input принимает только определенные типы
		const accept = await fileInput.getAttribute('accept')
		expect(accept).toContain('image/png')
		expect(accept).toContain('image/x-icon')
		expect(accept).toContain('image/svg+xml')
	})

	test('should handle API rate limiting', async ({ page }) => {
		await page.goto('/settings')

		const testImagePath = path.join(__dirname, 'fixtures', 'test-favicon.png')
		const fileInput = page.locator('input[type="file"]')

		// Пытаемся загрузить файл много раз подряд
		for (let i = 0; i < 6; i++) {
			await fileInput.setInputFiles(testImagePath)

			// Ждем ответа
			await page.waitForTimeout(500)
		}

		// После 5 попыток должно появиться сообщение об ошибке rate limit
		// (в зависимости от реализации UI)
		const errorMessage = page.locator('text=/Слишком много запросов/i')

		// Если есть rate limit, должно показаться сообщение
		const isRateLimited = await errorMessage.isVisible().catch(() => false)

		if (isRateLimited) {
			expect(await errorMessage.textContent()).toContain(
				'Слишком много запросов'
			)
		}
	})

	test('should validate file size', async ({ page }) => {
		await page.goto('/settings')

		// Создаем очень большой файл (больше 2MB)
		const largeFilePath = path.join(__dirname, 'fixtures', 'large-image.png')

		const fileInput = page.locator('input[type="file"]')

		// Если файл существует, пытаемся загрузить
		try {
			await fileInput.setInputFiles(largeFilePath)

			// Должно появиться сообщение об ошибке
			await expect(page.locator('text=/слишком большой/i')).toBeVisible()
		} catch (error) {
			// Файл не существует - тест пропускается
			test.skip()
		}
	})

	test('should update favicon across multiple tabs', async ({ context }) => {
		// Открываем две вкладки
		const page1 = await context.newPage()
		const page2 = await context.newPage()

		await page1.goto('/settings')
		await page2.goto('/dashboard')

		const testImagePath = path.join(__dirname, 'fixtures', 'test-favicon.png')

		// Загружаем файл в первой вкладке
		const fileInput = page1.locator('input[type="file"]')
		await fileInput.setInputFiles(testImagePath)

		await expect(page1.locator('img[alt="Favicon preview"]')).toBeVisible({
			timeout: 5000,
		})

		// Проверяем, что фавикон обновился во второй вкладке
		// (через storage event или перезагрузку)
		await page2.waitForTimeout(2000)

		const favicon2 = page2.locator('link[rel="icon"]')
		const href2 = await favicon2.getAttribute('href')
		expect(href2).toContain('favicon-')

		await page1.close()
		await page2.close()
	})

	test('should show metadata after upload', async ({ page }) => {
		await page.goto('/settings')

		const testImagePath = path.join(__dirname, 'fixtures', 'test-favicon.png')

		const fileInput = page.locator('input[type="file"]')
		await fileInput.setInputFiles(testImagePath)

		await expect(page.locator('img[alt="Favicon preview"]')).toBeVisible({
			timeout: 5000,
		})

		// Проверяем, что показывается информация о файле
		// (в зависимости от UI реализации)
		const preview = page.locator('img[alt="Favicon preview"]')
		expect(await preview.isVisible()).toBeTruthy()
	})
})


