/**
 * Интеграционные тесты базы данных
 * Проверка CRUD операций, фильтрации по organizationId, связей между таблицами
 */

import { test, expect } from '@playwright/test'
import { createAuthenticatedApiContext } from './helpers/api-auth'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

test.describe('База данных: Интеграционное тестирование', () => {
	test.describe('CRUD операции', () => {
		test('Создание категории - должна быть сохранена в БД', async ({ browser }) => {
			const { apiRequest, context } = await createAuthenticatedApiContext(browser)
			const categoryName = `Test Category ${Date.now()}`

			// Создаем категорию
			const createResponse = await apiRequest.post(`${BASE_URL}/api/categories`, {
				data: {
					name: categoryName,
					icon: 'tag',
					description: 'Test description',
				},
			})
			expect(createResponse.status()).toBe(201)
			const created = await createResponse.json()
			expect(created).toHaveProperty('id')
			expect(created.name).toBe(categoryName)

			// Проверяем, что категория есть в списке
			const listResponse = await apiRequest.get(`${BASE_URL}/api/categories`)
			const categories = await listResponse.json()
			const found = categories.find((c: any) => c.id === created.id)
			expect(found).toBeDefined()
			expect(found.name).toBe(categoryName)

			await context.close()
		})

		test('Обновление категории - изменения должны сохраниться', async ({ browser }) => {
			const { apiRequest, context } = await createAuthenticatedApiContext(browser)
			const categoryName = `Test Category ${Date.now()}`
			const updatedName = `Updated ${categoryName}`

			// Создаем категорию
			const createResponse = await apiRequest.post(`${BASE_URL}/api/categories`, {
				data: {
					name: categoryName,
					icon: 'tag',
				},
			})
			const created = await createResponse.json()

			// Обновляем категорию
			const updateResponse = await apiRequest.put(`${BASE_URL}/api/categories`, {
				data: {
					id: created.id,
					name: updatedName,
				},
			})
			expect(updateResponse.status()).toBe(200)
			const updated = await updateResponse.json()
			expect(updated.name).toBe(updatedName)

			await context.close()
		})

		test('Удаление категории - должна быть удалена из БД', async ({ browser }) => {
			const { apiRequest, context } = await createAuthenticatedApiContext(browser)
			const categoryName = `Test Category ${Date.now()}`

			// Создаем категорию
			const createResponse = await apiRequest.post(`${BASE_URL}/api/categories`, {
				data: {
					name: categoryName,
					icon: 'tag',
				},
			})
			const created = await createResponse.json()

			// Удаляем категорию
			const deleteResponse = await apiRequest.delete(`${BASE_URL}/api/categories/${created.id}`)
			expect(deleteResponse.status()).toBe(200)

			// Проверяем, что категории нет в списке
			const listResponse = await apiRequest.get(`${BASE_URL}/api/categories`)
			const categories = await listResponse.json()
			const found = categories.find((c: any) => c.id === created.id)
			expect(found).toBeUndefined()

			await context.close()
		})
	})

	test.describe('Фильтрация по organizationId', () => {
		test('Категории должны фильтроваться по organizationId', async ({ browser }) => {
			const { apiRequest } = await createAuthenticatedApiContext(browser)
			const response = await apiRequest.get(`${BASE_URL}/api/categories`)
			const categories = await response.json()

			if (Array.isArray(categories) && categories.length > 0) {
				// Все категории должны принадлежать одной организации
				const organizationIds = new Set(
					categories.map((c: any) => c.organizationId).filter(Boolean)
				)
				expect(organizationIds.size).toBeLessThanOrEqual(1)

				// Проверяем, что organizationId установлен
				categories.forEach((category: any) => {
					if (category.organizationId) {
						expect(typeof category.organizationId).toBe('string')
						expect(category.organizationId.length).toBeGreaterThan(0)
					}
				})
			}
		})

		test('Клиенты должны фильтроваться по organizationId', async ({ browser }) => {
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

		test('Новая категория должна получить organizationId автоматически', async ({ browser }) => {
			const { apiRequest, context } = await createAuthenticatedApiContext(browser)
			const categoryName = `Test Category ${Date.now()}`

			// Создаем категорию без явного указания organizationId
			const createResponse = await apiRequest.post(`${BASE_URL}/api/categories`, {
				data: {
					name: categoryName,
					icon: 'tag',
				},
			})
			const created = await createResponse.json()

			// Проверяем, что organizationId установлен
			expect(created).toHaveProperty('organizationId')
			expect(created.organizationId).toBeTruthy()
			expect(typeof created.organizationId).toBe('string')

			await context.close()
		})
	})

	test.describe('Связи между таблицами', () => {
		test('Предложение должно содержать связанного клиента', async ({ browser }) => {
			const { apiRequest } = await createAuthenticatedApiContext(browser)
			const response = await apiRequest.get(`${BASE_URL}/api/proposals`)
			const proposals = await response.json()

			if (Array.isArray(proposals) && proposals.length > 0) {
				const proposal = proposals[0]
				expect(proposal).toHaveProperty('client')
				expect(proposal.client).toBeDefined()
				expect(proposal.client).toHaveProperty('id')
			}
		})

		test('Предложение должно содержать группы и позиции', async ({ browser }) => {
			const { apiRequest } = await createAuthenticatedApiContext(browser)
			const response = await apiRequest.get(`${BASE_URL}/api/proposals`)
			const proposals = await response.json()

			if (Array.isArray(proposals) && proposals.length > 0) {
				const proposal = proposals[0]
				if (proposal.groups && Array.isArray(proposal.groups)) {
					proposal.groups.forEach((group: any) => {
						expect(group).toHaveProperty('positions')
						if (Array.isArray(group.positions)) {
							group.positions.forEach((position: any) => {
								expect(position).toHaveProperty('quantity')
								expect(position).toHaveProperty('unitPrice')
							})
						}
					})
				}
			}
		})
	})

	test.describe('Транзакции и целостность данных', () => {
		test('Удаление категории не должно нарушать связи', async ({ browser }) => {
			const { apiRequest, context } = await createAuthenticatedApiContext(browser)
			const categoryName = `Test Category ${Date.now()}`

			// Создаем категорию
			const createResponse = await apiRequest.post(`${BASE_URL}/api/categories`, {
				data: {
					name: categoryName,
					icon: 'tag',
				},
			})
			const created = await createResponse.json()

			// Удаляем категорию
			const deleteResponse = await apiRequest.delete(`${BASE_URL}/api/categories/${created.id}`)
			expect(deleteResponse.status()).toBe(200)

			// Проверяем, что список категорий все еще работает
			const listResponse = await apiRequest.get(`${BASE_URL}/api/categories`)
			expect(listResponse.status()).toBe(200)
			const categories = await listResponse.json()
			expect(Array.isArray(categories)).toBe(true)

			await context.close()
		})
	})
})



