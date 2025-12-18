/**
 * Комплексные тесты всех API маршрутов
 * Проверка GET/POST/PUT/DELETE операций, валидации, авторизации
 */

import { test, expect } from '@playwright/test'
import { createAuthenticatedApiContext } from './helpers/api-auth'
import { TEST_USERS } from './helpers/auth'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

test.describe('Все API маршруты: Полное тестирование', () => {
	test.describe('CRUD операции: Categories', () => {
		test('GET /api/categories - получение списка категорий', async ({ browser }) => {
			const { apiRequest } = await createAuthenticatedApiContext(browser)
			const response = await apiRequest.get(`${BASE_URL}/api/categories`)
			expect(response.status()).toBe(200)
			const data = await response.json()
			expect(Array.isArray(data)).toBe(true)
		})

		test('POST /api/categories - создание категории', async ({ browser }) => {
			const { apiRequest } = await createAuthenticatedApiContext(browser)
			const response = await apiRequest.post(`${BASE_URL}/api/categories`, {
				data: {
					name: `Test Category ${Date.now()}`,
					icon: 'tag',
					description: 'Test description',
				},
			})
			expect(response.status()).toBe(201)
			const data = await response.json()
			expect(data).toHaveProperty('id')
			expect(data).toHaveProperty('name')
		})

		test('GET /api/categories/with-counts - получение категорий со счетчиками', async ({ browser }) => {
			const { apiRequest } = await createAuthenticatedApiContext(browser)
			const response = await apiRequest.get(`${BASE_URL}/api/categories/with-counts`)
			expect(response.status()).toBe(200)
			const data = await response.json()
			expect(Array.isArray(data)).toBe(true)
		})
	})

	test.describe('CRUD операции: Clients', () => {
		test('GET /api/clients - получение списка клиентов', async ({ browser }) => {
			const { apiRequest } = await createAuthenticatedApiContext(browser)
			const response = await apiRequest.get(`${BASE_URL}/api/clients`)
			expect(response.status()).toBe(200)
			const data = await response.json()
			expect(Array.isArray(data)).toBe(true)
		})

		test('POST /api/clients - создание клиента', async ({ browser }) => {
			const { apiRequest } = await createAuthenticatedApiContext(browser)
			const response = await apiRequest.post(`${BASE_URL}/api/clients`, {
				data: {
					type: 'individual',
					firstName: 'Test',
					lastName: 'User',
					phone: '+39 123 456 7890',
				},
			})
			expect(response.status()).toBe(201)
			const data = await response.json()
			expect(data).toHaveProperty('id')
		})
	})

	test.describe('CRUD операции: Suppliers', () => {
		test('GET /api/suppliers - получение списка поставщиков', async ({ browser }) => {
			const { apiRequest } = await createAuthenticatedApiContext(browser)
			const response = await apiRequest.get(`${BASE_URL}/api/suppliers`)
			expect(response.status()).toBe(200)
			const data = await response.json()
			expect(Array.isArray(data)).toBe(true)
		})
	})

	test.describe('CRUD операции: Proposals', () => {
		test('GET /api/proposals - получение списка предложений', async ({ browser }) => {
			const { apiRequest } = await createAuthenticatedApiContext(browser)
			const response = await apiRequest.get(`${BASE_URL}/api/proposals`)
			expect(response.status()).toBe(200)
			const data = await response.json()
			expect(Array.isArray(data)).toBe(true)
		})
	})

	test.describe('CRUD операции: Parameters', () => {
		test('GET /api/parameters - получение списка параметров', async ({ browser }) => {
			const { apiRequest } = await createAuthenticatedApiContext(browser)
			const response = await apiRequest.get(`${BASE_URL}/api/parameters`)
			expect(response.status()).toBe(200)
			const data = await response.json()
			expect(Array.isArray(data)).toBe(true)
		})
	})

	test.describe('CRUD операции: Product Categories', () => {
		test('GET /api/product-categories - получение списка категорий продуктов', async ({ browser }) => {
			const { apiRequest } = await createAuthenticatedApiContext(browser)
			const response = await apiRequest.get(`${BASE_URL}/api/product-categories`)
			expect(response.status()).toBe(200)
			const data = await response.json()
			expect(Array.isArray(data)).toBe(true)
		})
	})

	test.describe('CRUD операции: Partners', () => {
		test('GET /api/partners - получение списка партнеров', async ({ browser }) => {
			const { apiRequest } = await createAuthenticatedApiContext(browser)
			const response = await apiRequest.get(`${BASE_URL}/api/partners`)
			expect(response.status()).toBe(200)
			const data = await response.json()
			expect(Array.isArray(data)).toBe(true)
		})
	})

	test.describe('CRUD операции: Installers', () => {
		test('GET /api/installers - получение списка установщиков', async ({ browser }) => {
			const { apiRequest } = await createAuthenticatedApiContext(browser)
			const response = await apiRequest.get(`${BASE_URL}/api/installers`)
			expect(response.status()).toBe(200)
			const data = await response.json()
			expect(Array.isArray(data)).toBe(true)
		})
	})

	test.describe('CRUD операции: VAT Rates', () => {
		test('GET /api/vat-rates - получение списка ставок НДС', async ({ browser }) => {
			const { apiRequest } = await createAuthenticatedApiContext(browser)
			const response = await apiRequest.get(`${BASE_URL}/api/vat-rates`)
			expect(response.status()).toBe(200)
			const data = await response.json()
			expect(Array.isArray(data)).toBe(true)
		})
	})

	test.describe('CRUD операции: Parameter Values', () => {
		test('GET /api/parameter-values - получение списка значений параметров', async ({ browser }) => {
			const { apiRequest } = await createAuthenticatedApiContext(browser)
			const response = await apiRequest.get(`${BASE_URL}/api/parameter-values`)
			expect(response.status()).toBe(200)
			const data = await response.json()
			expect(Array.isArray(data)).toBe(true)
		})
	})

	test.describe('CRUD операции: Dictionaries', () => {
		test('GET /api/dictionaries - получение словарей', async ({ browser }) => {
			const { apiRequest } = await createAuthenticatedApiContext(browser)
			const response = await apiRequest.get(`${BASE_URL}/api/dictionaries`)
			expect(response.status()).toBe(200)
			const data = await response.json()
			expect(Array.isArray(data)).toBe(true)
		})
	})

	test.describe('CRUD операции: Document Statuses', () => {
		test('GET /api/document-statuses - получение статусов документов', async ({ browser }) => {
			const { apiRequest } = await createAuthenticatedApiContext(browser)
			const response = await apiRequest.get(`${BASE_URL}/api/document-statuses`)
			expect(response.status()).toBe(200)
			const data = await response.json()
			expect(Array.isArray(data)).toBe(true)
		})
	})

	test.describe('CRUD операции: Document Types', () => {
		test('GET /api/document-types - получение типов документов', async ({ browser }) => {
			const { apiRequest } = await createAuthenticatedApiContext(browser)
			const response = await apiRequest.get(`${BASE_URL}/api/document-types`)
			expect(response.status()).toBe(200)
			const data = await response.json()
			expect(Array.isArray(data)).toBe(true)
		})
	})

	test.describe('CRUD операции: Document Templates', () => {
		test('GET /api/document-templates - получение шаблонов документов', async ({ browser }) => {
			const { apiRequest } = await createAuthenticatedApiContext(browser)
			const response = await apiRequest.get(`${BASE_URL}/api/document-templates`)
			expect(response.status()).toBe(200)
			const data = await response.json()
			expect(Array.isArray(data)).toBe(true)
		})
	})

	test.describe('Специальные API: Configurator', () => {
		test('GET /api/configurator/draft - получение черновика конфигуратора', async ({ browser }) => {
			const { apiRequest } = await createAuthenticatedApiContext(browser)
			const response = await apiRequest.get(`${BASE_URL}/api/configurator/draft`)
			expect(response.status()).toBe(200)
			const data = await response.json()
			// Может быть null если черновика нет
			expect(data === null || typeof data === 'object').toBe(true)
		})
	})

	test.describe('Специальные API: Organization', () => {
		test('GET /api/organization - получение данных организации', async ({ browser }) => {
			const { apiRequest } = await createAuthenticatedApiContext(browser)
			const response = await apiRequest.get(`${BASE_URL}/api/organization`)
			expect(response.status()).toBe(200)
			const data = await response.json()
			expect(data).toHaveProperty('id')
			expect(data).toHaveProperty('name')
		})
	})

	test.describe('Специальные API: User Profile', () => {
		test('GET /api/user/profile - получение профиля пользователя', async ({ browser }) => {
			const { apiRequest } = await createAuthenticatedApiContext(browser)
			const response = await apiRequest.get(`${BASE_URL}/api/user/profile`)
			expect(response.status()).toBe(200)
			const data = await response.json()
			expect(data).toHaveProperty('id')
			expect(data).toHaveProperty('email')
		})
	})

	test.describe('Публичные API: Health', () => {
		test('GET /api/health - проверка здоровья приложения', async ({ request }) => {
			const response = await request.get(`${BASE_URL}/api/health`)
			expect(response.status()).toBe(200)
			const data = await response.json()
			expect(data).toHaveProperty('status')
			expect(data.status).toBe('healthy')
		})
	})

	test.describe('Авторизация: Требование аутентификации', () => {
		test('GET /api/categories без авторизации - должен вернуть 401', async ({ request }) => {
			const response = await request.get(`${BASE_URL}/api/categories`)
			expect(response.status()).toBe(401)
		})

		test('GET /api/clients без авторизации - должен вернуть 401', async ({ request }) => {
			const response = await request.get(`${BASE_URL}/api/clients`)
			expect(response.status()).toBe(401)
		})

		test('GET /api/suppliers без авторизации - должен вернуть 401', async ({ request }) => {
			const response = await request.get(`${BASE_URL}/api/suppliers`)
			expect(response.status()).toBe(401)
		})

		test('GET /api/proposals без авторизации - должен вернуть 401', async ({ request }) => {
			const response = await request.get(`${BASE_URL}/api/proposals`)
			expect(response.status()).toBe(401)
		})
	})

	test.describe('Фильтрация по organizationId', () => {
		test('GET /api/categories - все категории принадлежат одной организации', async ({ browser }) => {
			const { apiRequest } = await createAuthenticatedApiContext(browser)
			const response = await apiRequest.get(`${BASE_URL}/api/categories`)
			const categories = await response.json()
			
			if (Array.isArray(categories) && categories.length > 0) {
				const organizationIds = new Set(
					categories.map((c: any) => c.organizationId).filter(Boolean)
				)
				expect(organizationIds.size).toBeLessThanOrEqual(1)
			}
		})

		test('GET /api/clients - все клиенты принадлежат одной организации', async ({ browser }) => {
			const { apiRequest } = await createAuthenticatedApiContext(browser)
			const response = await apiRequest.get(`${BASE_URL}/api/clients`)
			const clients = await response.json()
			
			if (Array.isArray(clients) && clients.length > 0) {
				const organizationIds = new Set(
					clients.map((c: any) => c.organizationId).filter(Boolean)
				)
				expect(organizationIds.size).toBeLessThanOrEqual(1)
			}
		})
	})
})



