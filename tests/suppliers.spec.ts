import { test, expect } from '@playwright/test'
import { loginAsUser, TEST_USERS } from './helpers/auth'

const translations = {
  add: [/Добавить/, /Aggiungi/],
  createTitle: [/Создать поставщика/, /Crea fornitore/],
  editTitle: [/Редактировать поставщика/, /Modifica fornitore/],
  createAction: [/Создать/, /Crea/],
  saveAction: [/Сохранить/, /Salva/],
  statusActive: [/Активен/, /Attivo/],
  statusInactive: [/Неактивен/, /Inattivo/],
  suppliersNav: [/Поставщики/, /Fornitori/],
}

const matchAny = (textPatterns: RegExp[]) =>
  new RegExp(textPatterns.map(p => p.source).join('|'))

test.use({ browserName: 'chromium' })

test.describe('Suppliers CRUD (chromium)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page, TEST_USERS.user)
  })

  test('should create, update and delete supplier via UI', async ({ page }) => {
    const uniqueSuffix = Date.now()
    const supplierName = `Playwright Supplier ${uniqueSuffix}`
    const email = `playwright-supplier-${uniqueSuffix}@example.com`
    const updatedStatus = translations.statusInactive

    await page.goto('/suppliers', { waitUntil: 'networkidle' })

    await expect(
      page.getByText(matchAny(translations.suppliersNav)).first()
    ).toBeVisible({ timeout: 15000 })

    await page.getByRole('button', { name: matchAny(translations.add) }).click()

    const modal = page.locator('[role="dialog"]')

    await expect(
      modal.getByRole('heading', { name: matchAny(translations.createTitle) })
    ).toBeVisible()

    await modal
      .getByPlaceholder(/Название компании \*|Nome azienda \*/)
      .fill(supplierName)
    await modal
      .getByPlaceholder(/Телефон \*|Telefono \*/)
      .fill('3381234567')
    await modal.getByPlaceholder(/Email/).fill(email)

    const createResponse = page.waitForResponse(response => {
      return (
        response.url().includes('/api/suppliers') &&
        response.request().method() === 'POST' &&
        response.status() === 201
      )
    })
    const refreshAfterCreate = page.waitForResponse(response => {
      return (
        response.url().includes('/api/suppliers') &&
        response.request().method() === 'GET' &&
        response.ok()
      )
    })

    await modal
      .getByRole('button', { name: matchAny(translations.createAction) })
      .click()

    await createResponse
    await refreshAfterCreate

    await expect(modal).toBeHidden({ timeout: 10000 })

    const createdRow = page
      .locator('table tbody tr')
      .filter({ hasText: supplierName })
    await expect(createdRow).toBeVisible({ timeout: 10000 })
    await expect(createdRow).toContainText(email)
    await expect(createdRow).toContainText(matchAny(translations.statusActive))

    await createdRow.locator('button').first().click()

    await expect(
      modal.getByRole('heading', { name: matchAny(translations.editTitle) })
    ).toBeVisible({ timeout: 5000 })

    await modal.getByTestId('supplier-status-trigger').click()
    await page
      .getByRole('option', { name: matchAny(updatedStatus) })
      .click()

    const updateResponse = page.waitForResponse(response => {
      return (
        response.url().includes('/api/suppliers') &&
        response.request().method() === 'PUT' &&
        response.ok()
      )
    })
    const refreshAfterUpdate = page.waitForResponse(response => {
      return (
        response.url().includes('/api/suppliers') &&
        response.request().method() === 'GET' &&
        response.ok()
      )
    })

    await modal
      .getByRole('button', { name: matchAny(translations.saveAction) })
      .click()

    await updateResponse
    await refreshAfterUpdate

    await expect(modal).toBeHidden({ timeout: 10000 })

    await expect(createdRow).toContainText(matchAny(updatedStatus))

    page.once('dialog', dialog => dialog.accept())

    const deleteResponse = page.waitForResponse(response => {
      return (
        response.url().includes('/api/suppliers') &&
        response.request().method() === 'DELETE' &&
        response.ok()
      )
    })

    await createdRow.locator('button').nth(1).click()
    await deleteResponse

    await expect(createdRow).toHaveCount(0, { timeout: 10000 })
  })

  test('should create supplier without email', async ({ page }) => {
    const uniqueSuffix = Date.now()
    const supplierName = `No Email Supplier ${uniqueSuffix}`

    await page.goto('/suppliers', { waitUntil: 'networkidle' })
    await expect(
      page.getByText(matchAny(translations.suppliersNav)).first()
    ).toBeVisible({ timeout: 15000 })

    await page.getByRole('button', { name: matchAny(translations.add) }).click()

    const modal = page.locator('[role="dialog"]')
    await expect(
      modal.getByRole('heading', { name: matchAny(translations.createTitle) })
    ).toBeVisible()

    await modal
      .getByPlaceholder(/Название компании \*|Nome azienda \*/)
      .fill(supplierName)
    await modal
      .getByPlaceholder(/Телефон \*|Telefono \*/)
      .fill('3387654321')

    const createResponse = page.waitForResponse(response => {
      return (
        response.url().includes('/api/suppliers') &&
        response.request().method() === 'POST' &&
        response.status() === 201
      )
    })
    const refreshAfterCreate = page.waitForResponse(response => {
      return (
        response.url().includes('/api/suppliers') &&
        response.request().method() === 'GET' &&
        response.ok()
      )
    })

    await modal
      .getByRole('button', { name: matchAny(translations.createAction) })
      .click()

    await createResponse
    await refreshAfterCreate
    await expect(modal).toBeHidden({ timeout: 10000 })

    const createdRow = page
      .locator('table tbody tr')
      .filter({ hasText: supplierName })
    await expect(createdRow).toBeVisible({ timeout: 10000 })
    await expect(createdRow.locator('td').nth(3)).toHaveText('')

    // Настраиваем обработчик диалога и ожидание ответа ПЕРЕД кликом
    page.once('dialog', dialog => dialog.accept())
    const deleteResponse = page.waitForResponse(response => {
      return (
        response.url().includes('/api/suppliers') &&
        response.request().method() === 'DELETE' &&
        response.ok()
      )
    })
    
    // Ищем кнопку удаления более надежным способом
    const deleteButton = createdRow.getByRole('button', { name: /удалить|delete|elimina/i }).or(
      createdRow.locator('button[aria-label*="delete"], button[aria-label*="удалить"]')
    ).first()
    await deleteButton.click()
    await deleteResponse
  })
})
