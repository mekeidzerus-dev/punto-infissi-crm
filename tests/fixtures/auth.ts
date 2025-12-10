/**
 * Playwright fixtures для авторизованного пользователя
 */

import { test as base } from '@playwright/test'
import { loginAsUser, TEST_USERS, type TestUser } from '../helpers/auth'
import type { Page } from '@playwright/test'

type AuthFixtures = {
	authenticatedPage: Page
	adminPage: Page
}

export const test = base.extend<AuthFixtures>({
	// Авторизованный пользователь (обычный)
	authenticatedPage: async ({ page }, use) => {
		await loginAsUser(page, TEST_USERS.user)
		await use(page)
	},

	// Авторизованный администратор
	adminPage: async ({ page }, use) => {
		await loginAsUser(page, TEST_USERS.admin)
		await use(page)
	},
})

export { expect } from '@playwright/test'

