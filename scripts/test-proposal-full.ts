/**
 * Полное тестирование функционала предложений
 * Проверяет создание, редактирование, удаление через API
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

// Тестовые учетные данные
const TEST_USER = {
	email: 'test@modocrm.com',
	password: 'Test123456',
}

async function login() {
	const response = await fetch(`${BASE_URL}/api/auth/signin`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(TEST_USER),
		credentials: 'include',
	})

	if (!response.ok) {
		throw new Error('Failed to login')
	}

	const cookies = response.headers.get('set-cookie')
	return cookies
}

async function testProposalCreation(cookies: string) {
	console.log('\n📝 Тест 1: Создание предложения\n')

	// Получаем необходимые данные
	const organization = await prisma.organization.findFirst()
	if (!organization) throw new Error('Organization not found')

	const client = await prisma.client.findFirst({
		where: { organizationId: organization.id },
	})
	if (!client) throw new Error('Client not found')

	const category = await prisma.productCategory.findFirst({
		where: { organizationId: organization.id },
	})
	if (!category) throw new Error('Category not found')

	const supplier = await prisma.supplier.findFirst({
		where: { organizationId: organization.id },
	})
	if (!supplier) throw new Error('Supplier not found')

	const supplierCategory = await prisma.supplierProductCategory.findFirst({
		where: {
			supplierId: supplier.id,
			categoryId: category.id,
		},
	})
	if (!supplierCategory) throw new Error('SupplierCategory not found')

	const documentType = await prisma.documentType.findUnique({
		where: { name: 'proposal' },
	})
	const documentStatusType = documentType
		? await prisma.documentStatusType.findFirst({
				where: {
					documentTypeId: documentType.id,
					isDefault: true,
				},
		  })
		: null

	// Тестовые данные предложения (как из формы)
	const proposalData = {
		clientId: client.id,
		groups: [
			{
				name: 'Gruppo Test',
				description: 'Test group description',
				positions: [
					{
						categoryId: category.id,
						supplierCategoryId: supplierCategory.id,
						description: 'Test Product',
						unitPrice: 100,
						quantity: 1,
						discount: 0,
						vatRate: 22,
						total: 122,
						vatAmount: 22,
					},
				],
			},
		],
		vatRate: 22,
		proposalDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
		validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
			.toISOString()
			.split('T')[0], // YYYY-MM-DD
		responsibleManager: 'Test Manager',
		status: 'draft',
		statusId: documentStatusType?.statusId ? String(documentStatusType.statusId) : null,
		notes: 'Test proposal notes',
	}

	console.log('📦 Отправляемые данные:')
	console.log(JSON.stringify(proposalData, null, 2))

	const response = await fetch(`${BASE_URL}/api/proposals`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Cookie: cookies || '',
		},
		body: JSON.stringify(proposalData),
		credentials: 'include',
	})

	const responseText = await response.text()
	console.log(`\n📡 Статус ответа: ${response.status}`)
	console.log(`📄 Ответ: ${responseText}`)

	if (!response.ok) {
		try {
			const error = JSON.parse(responseText)
			console.error('❌ Ошибка:', JSON.stringify(error, null, 2))
		} catch {
			console.error('❌ Ошибка:', responseText)
		}
		return null
	}

	const proposal = JSON.parse(responseText)
	console.log('✅ Предложение создано успешно!')
	console.log(`   ID: ${proposal.id}`)
	console.log(`   Номер: ${proposal.number}`)
	return proposal
}

async function testProposalUpdate(cookies: string, proposalId: string) {
	console.log('\n📝 Тест 2: Обновление предложения\n')

	const updateData = {
		responsibleManager: 'Updated Manager',
		notes: 'Updated notes',
		proposalDate: new Date().toISOString().split('T')[0],
		validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
			.toISOString()
			.split('T')[0],
	}

	console.log('📦 Данные для обновления:')
	console.log(JSON.stringify(updateData, null, 2))

	const response = await fetch(`${BASE_URL}/api/proposals/${proposalId}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			Cookie: cookies || '',
		},
		body: JSON.stringify(updateData),
		credentials: 'include',
	})

	const responseText = await response.text()
	console.log(`\n📡 Статус ответа: ${response.status}`)
	console.log(`📄 Ответ: ${responseText}`)

	if (!response.ok) {
		try {
			const error = JSON.parse(responseText)
			console.error('❌ Ошибка:', JSON.stringify(error, null, 2))
		} catch {
			console.error('❌ Ошибка:', responseText)
		}
		return false
	}

	console.log('✅ Предложение обновлено успешно!')
	return true
}

async function testProposalDeletion(cookies: string, proposalId: string) {
	console.log('\n📝 Тест 3: Удаление предложения\n')

	const response = await fetch(`${BASE_URL}/api/proposals/${proposalId}`, {
		method: 'DELETE',
		headers: {
			Cookie: cookies || '',
		},
		credentials: 'include',
	})

	const responseText = await response.text()
	console.log(`\n📡 Статус ответа: ${response.status}`)
	console.log(`📄 Ответ: ${responseText}`)

	if (!response.ok) {
		try {
			const error = JSON.parse(responseText)
			console.error('❌ Ошибка:', JSON.stringify(error, null, 2))
		} catch {
			console.error('❌ Ошибка:', responseText)
		}
		return false
	}

	console.log('✅ Предложение удалено успешно!')
	return true
}

async function main() {
	console.log('🧪 Полное тестирование функционала предложений\n')
	console.log(`Base URL: ${BASE_URL}\n`)

	try {
		// Авторизация
		console.log('🔐 Авторизация...')
		const cookies = await login()
		if (!cookies) {
			throw new Error('Failed to get cookies from login')
		}
		console.log('✅ Авторизация успешна\n')

		// Тест создания
		const proposal = await testProposalCreation(cookies)
		if (!proposal) {
			console.error('\n❌ Тест создания не прошел')
			return
		}

		// Тест обновления
		const updateSuccess = await testProposalUpdate(cookies, proposal.id)
		if (!updateSuccess) {
			console.error('\n❌ Тест обновления не прошел')
			return
		}

		// Тест удаления
		const deleteSuccess = await testProposalDeletion(cookies, proposal.id)
		if (!deleteSuccess) {
			console.error('\n❌ Тест удаления не прошел')
			return
		}

		console.log('\n✅ Все тесты пройдены успешно!')
	} catch (error: any) {
		console.error('\n❌ Ошибка:', error.message)
		console.error(error.stack)
		process.exit(1)
	}
}

main()
	.catch(e => {
		console.error('❌ Ошибка:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})

