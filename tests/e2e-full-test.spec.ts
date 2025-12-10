import { test, expect } from '@playwright/test'
import { loginAsUser, TEST_USERS } from './helpers/auth'

/**
 * E2E (End-to-End) тесты для полной проверки функциональности MODOCRM
 * 
 * Типы тестирования:
 * 1. E2E (End-to-End) - тестирование через браузерный интерфейс (этот файл)
 * 2. Integration тесты - тестирование взаимодействия компонентов
 * 3. Unit тесты - тестирование отдельных функций/компонентов
 * 4. API тесты - тестирование только API endpoints
 * 5. Visual regression тесты - сравнение скриншотов UI
 */

test.describe('MODOCRM E2E Full Test Suite', () => {
	test.beforeEach(async ({ page }) => {
		// Авторизуемся перед каждым тестом
		await loginAsUser(page, TEST_USERS.user)
	})

	test.describe('Авторизация', () => {
		test('должен войти в систему', async ({ page }) => {
			// Выходим из системы для теста авторизации
			await page.goto('/auth/signin')
			await page.waitForLoadState('networkidle')
			
			await loginAsUser(page, TEST_USERS.user)
			
			// Проверяем, что мы на странице клиентов
			await expect(page).toHaveURL(/.*\/clients/)
		})
	})

	test.describe('Клиенты (Clients)', () => {
		test('должен создать нового клиента (физическое лицо)', async ({ page }) => {
			await page.goto('/clients')
			await page.waitForLoadState('networkidle')

			// Ищем кнопку создания - пробуем разные варианты
			const addButton = page.getByRole('button', { name: /добавить|add|новый|new|создать|create/i }).first()
			await addButton.waitFor({ state: 'visible', timeout: 10000 })
			await addButton.click()

			// Ждем открытия модального окна или формы
			await page.waitForSelector('[role="dialog"], form', { timeout: 10000 })

			// Заполняем форму для физического лица
			await page.fill('input[name="firstName"]', 'Иван')
			await page.fill('input[name="lastName"]', 'Иванов')
			await page.fill('input[name="phone"]', '+39 123 456 7890')
			await page.fill('input[name="email"]', 'ivan@example.com')
			await page.fill('input[name="address"]', 'Via Roma 1, Milano')

			// Сохраняем
			const saveButton = page.locator('button:has-text("Сохранить"), button:has-text("Save")').last()
			await saveButton.click()

			// Ждем закрытия модального окна и появления уведомления
			await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 10000 })
			
			// Проверяем, что клиент появился в списке
			await page.waitForTimeout(1000) // Даем время на обновление списка
			await expect(page.locator('text=Иван Иванов').or(page.locator('text=Ivan Ivanov'))).toBeVisible({ timeout: 5000 })
		})

		test('должен создать нового клиента (юридическое лицо)', async ({ page }) => {
			await page.goto('/clients')
			await page.waitForLoadState('networkidle')

			// Ищем кнопку создания
			const addButton = page.getByRole('button', { name: /добавить|add|новый|new|создать|create/i }).first()
			await addButton.waitFor({ state: 'visible', timeout: 10000 })
			await addButton.click()

			// Ждем открытия модального окна или формы
			await page.waitForSelector('[role="dialog"], form', { timeout: 10000 })

			// Переключаемся на юридическое лицо
			const companyButton = page.locator('button:has-text("Юридическое лицо"), button:has-text("Company")')
			if (await companyButton.isVisible()) {
				await companyButton.click()
			}

			// Заполняем форму для юридического лица
			await page.fill('input[name="companyName"]', 'Test Company SRL')
			await page.fill('input[name="phone"]', '+39 098 765 4321')
			await page.fill('input[name="email"]', 'info@testcompany.com')
			await page.fill('input[name="partitaIVA"]', 'IT12345678901')

			// Сохраняем
			const saveButton = page.locator('button:has-text("Сохранить"), button:has-text("Save")').last()
			await saveButton.click()

			// Ждем закрытия модального окна
			await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 10000 })
			
			// Проверяем, что клиент появился в списке
			await page.waitForTimeout(1000)
			await expect(page.locator('text=Test Company').or(page.locator('text=Test Company SRL'))).toBeVisible({ timeout: 5000 })
		})

		test('должен отредактировать клиента', async ({ page }) => {
			await page.goto('/clients')
			await page.waitForLoadState('networkidle')

			// Находим первого клиента и нажимаем редактировать
			const editButton = page.locator('button[aria-label*="Edit"], button:has-text("Редактировать")').first()
			if (await editButton.isVisible({ timeout: 3000 })) {
				await editButton.click()
				
				// Ждем открытия модального окна
				await page.waitForSelector('[role="dialog"]', { timeout: 5000 })
				
				// Изменяем имя
				await page.fill('input[name="firstName"]', 'Петр')
				
				// Сохраняем
				const saveButton = page.locator('button:has-text("Сохранить"), button:has-text("Save")').last()
				await saveButton.click()
				
				// Ждем закрытия модального окна
				await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 10000 })
			}
		})
	})

	test.describe('Поставщики (Suppliers)', () => {
		test('должен создать нового поставщика', async ({ page }) => {
			await page.goto('/suppliers')
			await page.waitForLoadState('networkidle')

			// Ищем кнопку создания
			const addButton = page.getByRole('button', { name: /добавить|add|новый|new|создать|create/i }).first()
			await addButton.waitFor({ state: 'visible', timeout: 10000 })
			await addButton.click()

			// Ждем открытия модального окна или формы
			await page.waitForSelector('[role="dialog"], form', { timeout: 10000 })

			// Заполняем форму
			await page.fill('input[name="name"]', 'Test Supplier SRL')
			await page.fill('input[name="phone"]', '+39 111 222 3333')
			await page.fill('input[name="email"]', 'supplier@test.com')
			await page.fill('input[name="contactPerson"]', 'Mario Rossi')

			// Сохраняем
			const saveButton = page.locator('button:has-text("Сохранить"), button:has-text("Save")').last()
			await saveButton.click()

			// Ждем закрытия модального окна
			await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 10000 })
			
			// Проверяем, что поставщик появился в списке
			await page.waitForTimeout(1000)
			await expect(page.locator('text=Test Supplier').or(page.locator('text=Test Supplier SRL'))).toBeVisible({ timeout: 5000 })
		})
	})

	test.describe('Партнёры (Partners)', () => {
		test('должен создать нового партнёра', async ({ page }) => {
			await page.goto('/partners')
			await page.waitForLoadState('networkidle')

			// Ищем кнопку создания
			const addButton = page.getByRole('button', { name: /добавить|add|новый|new|создать|create/i }).first()
			await addButton.waitFor({ state: 'visible', timeout: 10000 })
			await addButton.click()

			// Ждем открытия модального окна или формы
			await page.waitForSelector('[role="dialog"], form', { timeout: 10000 })

			// Заполняем форму
			await page.fill('input[name="name"]', 'Test Partner')
			await page.fill('input[name="phone"]', '+39 444 555 6666')
			await page.fill('input[name="email"]', 'partner@test.com')

			// Сохраняем
			const saveButton = page.locator('button:has-text("Сохранить"), button:has-text("Save")').last()
			await saveButton.click()

			// Ждем закрытия модального окна
			await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 10000 })
			
			// Проверяем, что партнёр появился в списке
			await page.waitForTimeout(1000)
			await expect(page.locator('text=Test Partner')).toBeVisible({ timeout: 5000 })
		})
	})

	test.describe('Монтажники (Installers)', () => {
		test('должен создать нового монтажника', async ({ page }) => {
			await page.goto('/installers')
			await page.waitForLoadState('networkidle')

			// Ищем кнопку создания
			const addButton = page.getByRole('button', { name: /добавить|add|новый|new|создать|create/i }).first()
			await addButton.waitFor({ state: 'visible', timeout: 10000 })
			await addButton.click()

			// Ждем открытия модального окна или формы
			await page.waitForSelector('[role="dialog"], form', { timeout: 10000 })

			// Заполняем форму
			await page.fill('input[name="name"]', 'Test Installer')
			await page.fill('input[name="phone"]', '+39 777 888 9999')
			await page.fill('input[name="email"]', 'installer@test.com')

			// Сохраняем
			const saveButton = page.locator('button:has-text("Сохранить"), button:has-text("Save")').last()
			await saveButton.click()

			// Ждем закрытия модального окна
			await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 10000 })
			
			// Проверяем, что монтажник появился в списке
			await page.waitForTimeout(1000)
			await expect(page.locator('text=Test Installer')).toBeVisible({ timeout: 5000 })
		})
	})

	test.describe('Предложения (Proposals)', () => {
		test('должен открыть страницу предложений', async ({ page }) => {
			await page.goto('/proposals')
			await page.waitForLoadState('networkidle')
			
			// Проверяем, что страница загрузилась - ищем элементы страницы предложений
			const proposalsPage = page.locator('text=/Preventivi|Proposals|Предложения/i').or(
				page.locator('table').or(page.locator('[role="table"]'))
			).first()
			await expect(proposalsPage).toBeVisible({ timeout: 10000 })
		})
	})

	test.describe('Профиль пользователя', () => {
		test('должен открыть страницу профиля', async ({ page }) => {
			// Открываем меню пользователя
			const userMenuButton = page.locator('button:has([class*="rounded-full"])').last()
			if (await userMenuButton.isVisible({ timeout: 3000 })) {
				await userMenuButton.click()
				
				// Нажимаем на "Профиль" или "Profilo"
				const profileLink = page.locator('text=Профиль, text=Profilo').first()
				if (await profileLink.isVisible({ timeout: 2000 })) {
					await profileLink.click()
					
					// Проверяем, что открылась страница профиля
					await page.waitForURL('**/profile', { timeout: 5000 })
					await expect(page).toHaveURL(/.*\/profile/)
				}
			}
		})
	})
})

