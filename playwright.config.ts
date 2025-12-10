import { defineConfig, devices, type PlaywrightTestConfig } from '@playwright/test'

/**
 * Playwright configuration для тестирования MODOCRM
 * @see https://playwright.dev/docs/test-configuration
 */
const projects: PlaywrightTestConfig['projects'] = [
	{
		name: 'chromium',
		use: { ...devices['Desktop Chrome'] },
	},
] 

if (process.env.PLAYWRIGHT_ALL_BROWSERS === '1') {
	projects.push(
		{
			name: 'firefox',
			use: { ...devices['Desktop Firefox'] },
		},
		{
			name: 'webkit',
			use: { ...devices['Desktop Safari'] },
		},
		{
			name: 'Mobile Chrome',
			use: { ...devices['Pixel 5'] },
		},
		{
			name: 'Mobile Safari',
			use: { ...devices['iPhone 12'] },
		}
	)
}

export default defineConfig({
	testDir: './tests',
	fullyParallel: true,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: [
		['html'],
		['list'],
		['json', { outputFile: 'test-results/results.json' }],
	],
	use: {
		baseURL: process.env.BASE_URL || 'http://localhost:3000',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure',
		trace: 'on-first-retry',
	},
	projects,
	webServer: {
		command: 'npm run dev',
		url: 'http://localhost:3000',
		reuseExistingServer: !process.env.CI,
		timeout: 120 * 1000,
	},
})


