import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration для тестирования PUNTO INFISSI CRM
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
	testDir: './tests',

	// Параллельное выполнение тестов
	fullyParallel: true,

	// Повтор упавших тестов
	retries: process.env.CI ? 2 : 0,

	// Количество воркеров
	workers: process.env.CI ? 1 : undefined,

	// Репортеры
	reporter: [
		['html'],
		['list'],
		['json', { outputFile: 'test-results/results.json' }],
	],

	// Общие настройки
	use: {
		// Base URL для тестов
		baseURL: process.env.BASE_URL || 'http://localhost:3000',

		// Скриншоты только при падении теста
		screenshot: 'only-on-failure',

		// Видео только при падении
		video: 'retain-on-failure',

		// Трассировка при первом падении
		trace: 'on-first-retry',
	},

	// Проекты (браузеры)
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},

		{
			name: 'firefox',
			use: { ...devices['Desktop Firefox'] },
		},

		{
			name: 'webkit',
			use: { ...devices['Desktop Safari'] },
		},

		// Мобильные браузеры
		{
			name: 'Mobile Chrome',
			use: { ...devices['Pixel 5'] },
		},
		{
			name: 'Mobile Safari',
			use: { ...devices['iPhone 12'] },
		},
	],

	// Веб-сервер для тестов
	webServer: {
		command: 'npm run dev',
		url: 'http://localhost:3000',
		reuseExistingServer: !process.env.CI,
		timeout: 120 * 1000,
	},
})


