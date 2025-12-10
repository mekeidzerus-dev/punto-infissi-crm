/**
 * Скрипт для очистки и заполнения базы данных тестовыми данными
 * Использование: npx tsx scripts/reset-and-seed-db.ts
 */

import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
	console.log('🗑️  Очистка базы данных...')

	// Удаляем данные в правильном порядке (с учетом foreign keys)
	await prisma.proposalPosition.deleteMany()
	await prisma.proposalGroup.deleteMany()
	await prisma.proposalDocument.deleteMany()
	await prisma.order.deleteMany()
	await prisma.configuratorDraft.deleteMany()
	await prisma.supplierProductCategory.deleteMany()
	await prisma.supplierParameterOverride.deleteMany()
	await prisma.categoryParameter.deleteMany()
	await prisma.parameterValue.deleteMany()
	await prisma.parameterTemplate.deleteMany()
	await prisma.productCategory.deleteMany()
	await prisma.documentStatusType.deleteMany()
	await prisma.documentStatus.deleteMany()
	await prisma.documentTemplate.deleteMany()
	await prisma.documentType.deleteMany()
	await prisma.vATRate.deleteMany()
	await prisma.dictionary.deleteMany()
	await prisma.installer.deleteMany()
	await prisma.partner.deleteMany()
	await prisma.supplier.deleteMany()
	await prisma.client.deleteMany()
	await prisma.passwordResetToken.deleteMany()
	await prisma.user.deleteMany()
	await prisma.organizationSettings.deleteMany()
	await prisma.organization.deleteMany()

	console.log('✅ База данных очищена')

	console.log('📦 Создание тестовых данных...')

	// Создаем организацию
	const organization = await prisma.organization.create({
		data: {
			name: 'MODOCRM Test',
			slug: 'modocrm-test',
			primaryColor: '#dc2626',
			currency: 'EUR',
			timezone: 'Europe/Rome',
			language: 'it',
		},
	})

	console.log(`✅ Организация создана: ${organization.name}`)

	// Создаем настройки организации
	await prisma.organizationSettings.create({
		data: {
			organizationId: organization.id,
		},
	})

	// Создаем тестового пользователя
	const hashedPassword = await hash('Test123456', 10)
	const user = await prisma.user.create({
		data: {
			email: 'test@modocrm.com',
			name: 'Test User',
			password: hashedPassword,
			organizationId: organization.id,
			role: 'admin',
			lastLoginAt: new Date(),
			lastActivityAt: new Date(),
		},
	})

	console.log(`✅ Пользователь создан: ${user.email}`)

	// Создаем тестовых клиентов
	const clients = [
		{
			type: 'individual' as const,
			firstName: 'Иван',
			lastName: 'Иванов',
			phone: '+39 123 456 7890',
			email: 'ivan@example.com',
			address: 'Via Roma 1, Milano',
		},
		{
			type: 'company' as const,
			companyName: 'Test Company SRL',
			phone: '+39 098 765 4321',
			email: 'info@testcompany.com',
			partitaIVA: 'IT12345678901',
			address: 'Via Milano 10, Roma',
		},
	]

	for (const clientData of clients) {
		await prisma.client.create({
			data: {
				...clientData,
				organizationId: organization.id,
			},
		})
	}

	console.log(`✅ Создано ${clients.length} клиентов`)

	// Создаем тестовых поставщиков
	const suppliers = [
		{
			name: 'Test Supplier SRL',
			phone: '+39 111 222 3333',
			email: 'supplier@test.com',
			contactPerson: 'Mario Rossi',
			status: 'active' as const,
		},
		{
			name: 'Another Supplier',
			phone: '+39 444 555 6666',
			email: 'another@supplier.com',
			contactPerson: 'Luigi Bianchi',
			status: 'active' as const,
		},
	]

	for (const supplierData of suppliers) {
		await prisma.supplier.create({
			data: {
				...supplierData,
				organizationId: organization.id,
			},
		})
	}

	console.log(`✅ Создано ${suppliers.length} поставщиков`)

	// Создаем тестовых партнёров
	const partners = [
		{
			name: 'Test Partner',
			phone: '+39 777 888 9999',
			email: 'partner@test.com',
			type: 'dealer' as const,
			status: 'active' as const,
		},
	]

	for (const partnerData of partners) {
		await prisma.partner.create({
			data: {
				...partnerData,
				organizationId: organization.id,
			},
		})
	}

	console.log(`✅ Создано ${partners.length} партнёров`)

	// Создаем тестовых монтажников
	const installers = [
		{
			type: 'individual' as const,
			name: 'Test Installer',
			phone: '+39 333 444 5555',
			email: 'installer@test.com',
			availability: 'available' as const,
			status: 'active' as const,
		},
	]

	for (const installerData of installers) {
		await prisma.installer.create({
			data: {
				...installerData,
				organizationId: organization.id,
			},
		})
	}

	console.log(`✅ Создано ${installers.length} монтажников`)

	// Создаем ставки НДС
	const vatRates = [
		{
			id: 'vat-22',
			name: 'IVA 22%',
			percentage: 22,
			isDefault: true,
			organizationId: organization.id,
		},
		{
			id: 'vat-10',
			name: 'IVA 10%',
			percentage: 10,
			isDefault: false,
			organizationId: organization.id,
		},
	]

	for (const vatData of vatRates) {
		await prisma.vATRate.create({
			data: vatData,
		})
	}

	console.log(`✅ Создано ${vatRates.length} ставок НДС`)

	console.log('\n✅ Все тестовые данные созданы!')
	console.log(`\n📋 Учетные данные для входа:`)
	console.log(`   Email: ${user.email}`)
	console.log(`   Password: Test123456`)
	console.log(`\n🌐 Откройте http://localhost:3000/auth/signin для входа`)
}

main()
	.catch((e) => {
		console.error('❌ Ошибка:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})

