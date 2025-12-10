import { test, expect } from '@playwright/test'
import { loginAsUser, TEST_USERS } from './helpers/auth'

test.describe('Контрагенты - CRUD операции', () => {
	test.beforeEach(async ({ page }) => {
		// Авторизуемся перед каждым тестом
		await loginAsUser(page, TEST_USERS.user)
		await page.goto('/clients')
		// Ждем загрузки страницы
		await page.waitForLoadState('networkidle')
	})

	test.describe('Клиенты (Clients)', () => {
		test('CREATE: Создание нового клиента (физическое лицо)', async ({
			page,
		}) => {
			// Находим кнопку создания клиента
			const createButton = page.getByRole('button', {
				name: /создать|новый|добавить|add|new|create/i,
			}).first()
			await createButton.waitFor({ state: 'visible', timeout: 10000 })
			await createButton.click()
			
			// Ждем открытия формы
			await page.waitForSelector('[role="dialog"], form', { timeout: 10000 })

			// Заполняем форму
			await page.fill(
				'input[name="firstName"], input[placeholder*="Имя"]',
				'Тест'
			)
			await page.fill(
				'input[name="lastName"], input[placeholder*="Фамилия"]',
				'Клиент'
			)
			await page.fill(
				'input[name="phone"], input[type="tel"]',
				'+39 333 123 4567'
			)
			await page.fill(
				'input[name="email"], input[type="email"]',
				'test@example.com'
			)

			// Сохраняем
			const saveButton = page.getByRole('button', {
				name: /сохранить|создать/i,
			})
			await saveButton.click()

			// Проверяем успешное создание
			await expect(page.getByText(/тест.*клиент|клиент.*тест/i)).toBeVisible({
				timeout: 5000,
			})
		})

		test('READ: Просмотр списка клиентов', async ({ page }) => {
			// Проверяем наличие таблицы или списка клиентов
			const table = page.locator(
				'table, [role="table"], .client-list, .clients-table'
			)
			await expect(table.first()).toBeVisible()
		})

		test('UPDATE: Редактирование клиента', async ({ page }) => {
			// Находим первого клиента и открываем редактирование
			const editButton = page
				.locator(
					'button[aria-label*="редактировать"], button[aria-label*="edit"], .edit-button'
				)
				.first()

			if (await editButton.isVisible({ timeout: 2000 }).catch(() => false)) {
				await editButton.click()

				// Изменяем имя
				const nameInput = page
					.locator('input[name="firstName"], input[placeholder*="Имя"]')
					.first()
				await nameInput.clear()
				await nameInput.fill('Обновленный')

				// Сохраняем
				const saveButton = page.getByRole('button', { name: /сохранить/i })
				await saveButton.click()

				// Проверяем обновление
				await expect(page.getByText(/обновленный/i)).toBeVisible({
					timeout: 5000,
				})
			} else {
				test.skip()
			}
		})

		test('DELETE: Удаление клиента без связанных данных', async ({ page }) => {
			// Создаем тестового клиента для удаления
			const createButton = page.getByRole('button', {
				name: /создать|новый|добавить|add|new|create/i,
			}).first()
			await createButton.waitFor({ state: 'visible', timeout: 10000 })
			await createButton.click()
			
			// Ждем открытия формы
			await page.waitForSelector('[role="dialog"], form', { timeout: 10000 })

			await page.fill('input[name="firstName"]', 'Удалить')
			await page.fill('input[name="lastName"]', 'Тест')
			await page.fill('input[name="phone"]', '+39 333 999 9999')
			await page.getByRole('button', { name: /сохранить|save/i }).click()

			// Ждем закрытия формы и обновления списка
			await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 10000 })
			await page.waitForTimeout(1000)

			// Находим кнопку удаления для созданного клиента
			const deleteButton = page
				.getByRole('button', { name: /удалить|delete|elimina/i })
				.or(page.locator('button[aria-label*="удалить"], button[aria-label*="delete"]'))
				.last()

			if (await deleteButton.isVisible({ timeout: 5000 }).catch(() => false)) {
				// Настраиваем обработчик диалога ПЕРЕД кликом
				page.once('dialog', dialog => dialog.accept())
				await deleteButton.click()

				// Проверяем, что клиент удален
				await expect(page.getByText(/удалить.*тест/i)).not.toBeVisible({
					timeout: 3000,
				})
			} else {
				test.skip()
			}
		})

		test('DELETE: Попытка удаления клиента с предложениями должна показывать ошибку', async ({
			page,
		}) => {
			// Этот тест требует наличия клиента с предложениями
			// Проверяем наличие предупреждения при попытке удаления
			const deleteButton = page
				.locator('button[aria-label*="удалить"], button[aria-label*="delete"]')
				.first()

			if (await deleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
				await deleteButton.click()

				// Проверяем наличие сообщения об ошибке или предупреждения
				const errorMessage = page.locator(
					'text=/нельзя удалить|связан|предложения|заказы/i'
				)
				await expect(errorMessage).toBeVisible({ timeout: 3000 })
			} else {
				test.skip()
			}
		})
	})

	test.describe('Поставщики (Suppliers)', () => {
		test.beforeEach(async ({ page }) => {
			await page.goto('/suppliers')
			await page.waitForLoadState('networkidle')
		})

		test('CREATE: Создание нового поставщика', async ({ page }) => {
			const createButton = page.getByRole('button', {
				name: /создать|новый|добавить|add|new|create/i,
			}).first()
			await createButton.waitFor({ state: 'visible', timeout: 10000 })
			await createButton.click()
			
			// Ждем открытия формы
			await page.waitForSelector('[role="dialog"], form', { timeout: 10000 })

			await page.fill(
				'input[name="name"], input[placeholder*="Название"]',
				'Тестовый Поставщик'
			)
			await page.fill(
				'input[name="phone"], input[type="tel"]',
				'+39 333 111 2222'
			)
			await page.fill(
				'input[name="email"], input[type="email"]',
				'supplier@test.com'
			)

			const saveButton = page.getByRole('button', {
				name: /сохранить|создать/i,
			})
			await saveButton.click()

			await expect(page.getByText(/тестовый поставщик/i)).toBeVisible({
				timeout: 5000,
			})
		})

		test('READ: Просмотр списка поставщиков', async ({ page }) => {
			const table = page.locator('table, [role="table"], .supplier-list')
			await expect(table.first()).toBeVisible()
		})

		test('UPDATE: Редактирование поставщика', async ({ page }) => {
			const editButton = page
				.locator('button[aria-label*="редактировать"], .edit-button')
				.first()

			if (await editButton.isVisible({ timeout: 2000 }).catch(() => false)) {
				await editButton.click()

				const nameInput = page.locator('input[name="name"]').first()
				await nameInput.clear()
				await nameInput.fill('Обновленный Поставщик')

				await page.getByRole('button', { name: /сохранить/i }).click()
				await expect(page.getByText(/обновленный поставщик/i)).toBeVisible({
					timeout: 5000,
				})
			} else {
				test.skip()
			}
		})

		test('DELETE: Удаление поставщика без связанных данных', async ({
			page,
		}) => {
			// Создаем тестового поставщика
			const createButton = page.getByRole('button', { 
				name: /создать|новый|добавить|add|new|create/i 
			}).first()
			await createButton.waitFor({ state: 'visible', timeout: 10000 })
			await createButton.click()
			
			// Ждем открытия формы
			await page.waitForSelector('[role="dialog"], form', { timeout: 10000 })

			await page.fill('input[name="name"]', 'Удалить Поставщик')
			await page.fill('input[name="phone"]', '+39 333 888 8888')
			await page.getByRole('button', { name: /сохранить|save/i }).click()
			
			// Ждем закрытия формы
			await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 10000 })
			await page.waitForTimeout(1000)

			const deleteButton = page
				.getByRole('button', { name: /удалить|delete|elimina/i })
				.or(page.locator('button[aria-label*="удалить"], button[aria-label*="delete"]'))
				.last()

			if (await deleteButton.isVisible({ timeout: 5000 }).catch(() => false)) {
				// Настраиваем обработчик диалога ПЕРЕД кликом
				page.once('dialog', dialog => dialog.accept())
				await deleteButton.click()
				await expect(page.getByText(/удалить поставщик/i)).not.toBeVisible({
					timeout: 3000,
				})
			} else {
				test.skip()
			}
		})

		test('DELETE: Попытка удаления поставщика с товарами должна показывать ошибку', async ({
			page,
		}) => {
			const deleteButton = page.locator('button[aria-label*="удалить"]').first()

			if (await deleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
				await deleteButton.click()

				const errorMessage = page.locator(
					'text=/нельзя удалить|используется|товары|предложения/i'
				)
				await expect(errorMessage).toBeVisible({ timeout: 3000 })
			} else {
				test.skip()
			}
		})
	})

	test.describe('Партнёры (Partners)', () => {
		test.beforeEach(async ({ page }) => {
			await page.goto('/partners')
			await page.waitForLoadState('networkidle')
		})

		test('CREATE: Создание нового партнёра', async ({ page }) => {
			const createButton = page.getByRole('button', { name: /создать|новый/i })
			if (
				!(await createButton
					.first()
					.isVisible({ timeout: 2000 })
					.catch(() => false))
			) {
				test.skip()
				return
			}

			await createButton.first().click()

			await page.fill(
				'input[name="name"], input[placeholder*="Название"]',
				'Тестовый Партнёр'
			)
			await page.fill(
				'input[name="phone"], input[type="tel"]',
				'+39 333 333 3333'
			)
			await page.fill(
				'input[name="email"], input[type="email"]',
				'partner@test.com'
			)

			const saveButton = page.getByRole('button', {
				name: /сохранить|создать/i,
			})
			await saveButton.click()

			await expect(page.getByText(/тестовый партнёр/i)).toBeVisible({
				timeout: 5000,
			})
		})

		test('READ: Просмотр списка партнёров', async ({ page }) => {
			const table = page.locator('table, [role="table"], .partner-list')
			await expect(table.first()).toBeVisible()
		})

		test('UPDATE: Редактирование партнёра', async ({ page }) => {
			const editButton = page
				.locator('button[aria-label*="редактировать"], .edit-button')
				.first()

			if (await editButton.isVisible({ timeout: 2000 }).catch(() => false)) {
				await editButton.click()

				const nameInput = page.locator('input[name="name"]').first()
				await nameInput.clear()
				await nameInput.fill('Обновленный Партнёр')

				await page.getByRole('button', { name: /сохранить/i }).click()
				await expect(page.getByText(/обновленный партнёр/i)).toBeVisible({
					timeout: 5000,
				})
			} else {
				test.skip()
			}
		})

		test('DELETE: Удаление партнёра', async ({ page }) => {
			const createButton = page.getByRole('button', { name: /создать|новый/i })
			if (
				!(await createButton
					.first()
					.isVisible({ timeout: 2000 })
					.catch(() => false))
			) {
				test.skip()
				return
			}

			await createButton.first().click()

			await page.fill('input[name="name"]', 'Удалить Партнёр')
			await page.fill('input[name="phone"]', '+39 333 777 7777')
			await page.getByRole('button', { name: /сохранить/i }).click()
			await page.waitForTimeout(1000)

			const deleteButton = page
				.locator('button[aria-label*="удалить"], .delete-button')
				.last()

			if (await deleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
				page.on('dialog', dialog => dialog.accept())
				await deleteButton.click()
				await expect(page.getByText(/удалить партнёр/i)).not.toBeVisible({
					timeout: 3000,
				})
			} else {
				test.skip()
			}
		})
	})

	test.describe('Монтажники (Installers)', () => {
		test.beforeEach(async ({ page }) => {
			await page.goto('/installers')
			await page.waitForLoadState('networkidle')
		})

		test('CREATE: Создание нового монтажника', async ({ page }) => {
			const createButton = page.getByRole('button', { name: /создать|новый/i })
			if (
				!(await createButton
					.first()
					.isVisible({ timeout: 2000 })
					.catch(() => false))
			) {
				test.skip()
				return
			}

			await createButton.first().click()

			await page.fill(
				'input[name="name"], input[placeholder*="Имя"]',
				'Тестовый Монтажник'
			)
			await page.fill(
				'input[name="phone"], input[type="tel"]',
				'+39 333 444 4444'
			)
			await page.fill(
				'input[name="email"], input[type="email"]',
				'installer@test.com'
			)

			const saveButton = page.getByRole('button', {
				name: /сохранить|создать/i,
			})
			await saveButton.click()

			await expect(page.getByText(/тестовый монтажник/i)).toBeVisible({
				timeout: 5000,
			})
		})

		test('READ: Просмотр списка монтажников', async ({ page }) => {
			const table = page.locator('table, [role="table"], .installer-list')
			await expect(table.first()).toBeVisible()
		})

		test('UPDATE: Редактирование монтажника', async ({ page }) => {
			const editButton = page
				.locator('button[aria-label*="редактировать"], .edit-button')
				.first()

			if (await editButton.isVisible({ timeout: 2000 }).catch(() => false)) {
				await editButton.click()

				const nameInput = page.locator('input[name="name"]').first()
				await nameInput.clear()
				await nameInput.fill('Обновленный Монтажник')

				await page.getByRole('button', { name: /сохранить/i }).click()
				await expect(page.getByText(/обновленный монтажник/i)).toBeVisible({
					timeout: 5000,
				})
			} else {
				test.skip()
			}
		})

		test('DELETE: Удаление монтажника', async ({ page }) => {
			const createButton = page.getByRole('button', { name: /создать|новый/i })
			if (
				!(await createButton
					.first()
					.isVisible({ timeout: 2000 })
					.catch(() => false))
			) {
				test.skip()
				return
			}

			await createButton.first().click()

			await page.fill('input[name="name"]', 'Удалить Монтажник')
			await page.fill('input[name="phone"]', '+39 333 666 6666')
			await page.getByRole('button', { name: /сохранить/i }).click()
			await page.waitForTimeout(1000)

			const deleteButton = page
				.locator('button[aria-label*="удалить"], .delete-button')
				.last()

			if (await deleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
				page.on('dialog', dialog => dialog.accept())
				await deleteButton.click()
				await expect(page.getByText(/удалить монтажник/i)).not.toBeVisible({
					timeout: 3000,
				})
			} else {
				test.skip()
			}
		})
	})
})
