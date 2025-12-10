#!/usr/bin/env tsx
/**
 * Скрипт для генерации комплексных тестовых данных для MODOCRM
 * Создает: поставщиков, клиентов, монтажников, партнёров, категории, параметры, значения, предложения
 */

import { PrismaClient, ParameterType } from '@prisma/client'
import { hexToRAL } from '@/lib/hex-to-ral'

const prisma = new PrismaClient()

interface TestData {
	suppliers: Array<{ id: number; name: string }>
	clients: Array<{ id: string; name: string }>
	installers: Array<{ id: number; name: string }>
	partners: Array<{ id: number; name: string }>
	categories: Array<{ id: string; name: string }>
	parameters: Array<{ id: string; name: string; type: ParameterType }>
}

async function getOrCreateOrganization() {
	let org = await prisma.organization.findFirst()
	if (!org) {
		org = await prisma.organization.create({
			data: {
				name: 'Test Organization',
				slug: 'test-org',
				email: 'test@modocrm.com',
				phone: '+39 123 456 7890',
			},
		})
	}
	return org
}

async function createSuppliers(orgId: string): Promise<TestData['suppliers']> {
	console.log('📦 Создание поставщиков...')
	const suppliersData = [
		{
			name: 'Fornitore Porte SRL',
			shortName: 'FP',
			shortNameIt: 'FP',
			email: 'info@fornitoreporte.it',
			phone: '+39 02 1234 5678',
			contactPerson: 'Mario Rossi',
			address: 'Via Roma 1, Milano',
			organizationId: orgId,
		},
		{
			name: 'Finestre Premium SPA',
			shortName: 'FP',
			shortNameIt: 'FP',
			email: 'sales@finestrepremium.it',
			phone: '+39 06 9876 5432',
			contactPerson: 'Luigi Bianchi',
			address: 'Via Garibaldi 10, Roma',
			organizationId: orgId,
		},
		{
			name: 'Serramenti Moderni',
			shortName: 'SM',
			shortNameIt: 'SM',
			email: 'info@serramentimoderni.it',
			phone: '+39 055 1111 2222',
			contactPerson: 'Giuseppe Verdi',
			address: 'Via Dante 5, Firenze',
			organizationId: orgId,
		},
		{
			name: 'Porte Design Italia',
			shortName: 'PDI',
			shortNameIt: 'PDI',
			email: 'contact@portedesign.it',
			phone: '+39 041 3333 4444',
			contactPerson: 'Anna Neri',
			address: 'Calle Grande 20, Venezia',
			organizationId: orgId,
		},
		{
			name: 'Windows & Doors Pro',
			shortName: 'WDP',
			shortNameIt: 'WDP',
			email: 'info@windowsdoorspro.it',
			phone: '+39 081 5555 6666',
			contactPerson: 'Francesco Esposito',
			address: 'Via Partenope 15, Napoli',
			organizationId: orgId,
		},
	]

	const suppliers = []
	for (const data of suppliersData) {
		const existing = await prisma.supplier.findFirst({
			where: { name: data.name, organizationId: orgId },
		})
		if (existing) {
			suppliers.push(existing)
			console.log(`   ✓ Поставщик уже существует: ${data.name}`)
		} else {
			const supplier = await prisma.supplier.create({ data })
			suppliers.push(supplier)
			console.log(`   ✓ Создан поставщик: ${data.name}`)
		}
	}
	return suppliers.map((s) => ({ id: s.id, name: s.name }))
}

async function createClients(orgId: string): Promise<TestData['clients']> {
	console.log('👥 Создание клиентов...')
	const clientsData = [
		// Физические лица
		{
			type: 'individual' as const,
			firstName: 'Mario',
			lastName: 'Rossi',
			phone: '+39 333 111 2222',
			email: 'mario.rossi@example.com',
			address: 'Via Roma 10, Milano',
			organizationId: orgId,
		},
		{
			type: 'individual' as const,
			firstName: 'Luigi',
			lastName: 'Bianchi',
			phone: '+39 333 222 3333',
			email: 'luigi.bianchi@example.com',
			address: 'Via Garibaldi 20, Roma',
			organizationId: orgId,
		},
		{
			type: 'individual' as const,
			firstName: 'Giuseppe',
			lastName: 'Verdi',
			phone: '+39 333 333 4444',
			email: 'giuseppe.verdi@example.com',
			address: 'Via Dante 30, Firenze',
			organizationId: orgId,
		},
		{
			type: 'individual' as const,
			firstName: 'Anna',
			lastName: 'Neri',
			phone: '+39 333 444 5555',
			email: 'anna.neri@example.com',
			address: 'Calle Grande 40, Venezia',
			organizationId: orgId,
		},
		{
			type: 'individual' as const,
			firstName: 'Francesco',
			lastName: 'Esposito',
			phone: '+39 333 555 6666',
			email: 'francesco.esposito@example.com',
			address: 'Via Partenope 50, Napoli',
			organizationId: orgId,
		},
		// Юридические лица
		{
			type: 'company' as const,
			companyName: 'Azienda Test SRL',
			phone: '+39 02 9999 8888',
			email: 'info@aziendatest.it',
			address: 'Via Commerciale 100, Milano',
			partitaIVA: 'IT12345678901',
			codiceFiscale: 'AZTST12345678901',
			organizationId: orgId,
		},
		{
			type: 'company' as const,
			companyName: 'Costruzioni Moderne SPA',
			phone: '+39 06 8888 7777',
			email: 'info@costruzionimoderne.it',
			address: 'Via Industriale 200, Roma',
			partitaIVA: 'IT98765432109',
			codiceFiscale: 'CMSPA98765432109',
			organizationId: orgId,
		},
		{
			type: 'company' as const,
			companyName: 'Edilizia Premium',
			phone: '+39 055 7777 6666',
			email: 'info@ediliziapremium.it',
			address: 'Via Cantiere 300, Firenze',
			partitaIVA: 'IT11111111111',
			codiceFiscale: 'EDPRM11111111111',
			organizationId: orgId,
		},
	]

	const clients = []
	for (const data of clientsData) {
		const existing = await prisma.client.findFirst({
			where:
				data.type === 'individual'
					? {
							firstName: data.firstName,
							lastName: data.lastName,
							organizationId: orgId,
						}
					: {
							companyName: data.companyName,
							organizationId: orgId,
						},
		})
		if (existing) {
			clients.push(existing)
			const name =
				data.type === 'individual'
					? `${data.firstName} ${data.lastName}`
					: data.companyName
			console.log(`   ✓ Клиент уже существует: ${name}`)
		} else {
			const client = await prisma.client.create({ data })
			clients.push(client)
			const name =
				data.type === 'individual'
					? `${data.firstName} ${data.lastName}`
					: data.companyName
			console.log(`   ✓ Создан клиент: ${name}`)
		}
	}
	return clients.map((c) => ({
		id: String(c.id),
		name: c.type === 'individual' ? `${c.firstName} ${c.lastName}` : c.companyName!,
	}))
}

async function createInstallers(orgId: string): Promise<TestData['installers']> {
	console.log('🔧 Создание монтажников...')
	const installersData = [
		{
			type: 'individual' as const,
			name: 'Giovanni Montatore',
			phone: '+39 333 777 8888',
			email: 'giovanni.montatore@example.com',
			specialization: 'Porte e finestre',
			experience: 10,
			hasTools: true,
			hasTransport: true,
			organizationId: orgId,
		},
		{
			type: 'individual' as const,
			name: 'Marco Installatore',
			phone: '+39 333 888 9999',
			email: 'marco.installatore@example.com',
			specialization: 'Serramenti',
			experience: 5,
			hasTools: true,
			hasTransport: false,
			organizationId: orgId,
		},
		{
			type: 'company' as const,
			name: 'Squadra Installazioni Pro',
			phone: '+39 02 6666 5555',
			email: 'info@squadrainstallazioni.it',
			specialization: 'Installazioni complete',
			experience: 15,
			hasTools: true,
			hasTransport: true,
			organizationId: orgId,
		},
	]

	const installers = []
	for (const data of installersData) {
		const existing = await prisma.installer.findFirst({
			where: { name: data.name, organizationId: orgId },
		})
		if (existing) {
			installers.push(existing)
			console.log(`   ✓ Монтажник уже существует: ${data.name}`)
		} else {
			const installer = await prisma.installer.create({ data })
			installers.push(installer)
			console.log(`   ✓ Создан монтажник: ${data.name}`)
		}
	}
	return installers.map((i) => ({ id: i.id, name: i.name }))
}

async function createPartners(orgId: string): Promise<TestData['partners']> {
	console.log('🤝 Создание партнёров...')
	const partnersData = [
		{
			name: 'Partner Commerciale SRL',
			type: 'commercial' as const,
			phone: '+39 02 5555 4444',
			email: 'info@partnercommerciale.it',
			address: 'Via Partner 1, Milano',
			organizationId: orgId,
		},
		{
			name: 'Distributore Nazionale',
			type: 'distributor' as const,
			phone: '+39 06 4444 3333',
			email: 'info@distributorenazionale.it',
			address: 'Via Distribuzione 2, Roma',
			organizationId: orgId,
		},
		{
			name: 'Rivenditore Premium',
			type: 'retailer' as const,
			phone: '+39 055 3333 2222',
			email: 'info@rivenditorepremium.it',
			address: 'Via Rivendita 3, Firenze',
			organizationId: orgId,
		},
	]

	const partners = []
	for (const data of partnersData) {
		const existing = await prisma.partner.findFirst({
			where: { name: data.name, organizationId: orgId },
		})
		if (existing) {
			partners.push(existing)
			console.log(`   ✓ Партнёр уже существует: ${data.name}`)
		} else {
			const partner = await prisma.partner.create({ data })
			partners.push(partner)
			console.log(`   ✓ Создан партнёр: ${data.name}`)
		}
	}
	return partners.map((p) => ({ id: p.id, name: p.name }))
}

async function createCategories(orgId: string): Promise<TestData['categories']> {
	console.log('📁 Создание категорий продуктов...')
	const categoriesData = [
		{
			name: 'Porte interne',
			icon: '🚪',
			isActive: true,
		},
		{
			name: 'Porte esterne',
			icon: '🏠',
			isActive: true,
		},
		{
			name: 'Finestre',
			icon: '🪟',
			isActive: true,
		},
		{
			name: 'Porte scorrevoli',
			icon: '↔️',
			isActive: true,
		},
		{
			name: 'Serramenti',
			icon: '🏛️',
			isActive: true,
		},
	]

	const categories = []
	for (const data of categoriesData) {
		const existing = await prisma.productCategory.findFirst({
			where: { name: data.name },
		})
		if (existing) {
			categories.push(existing)
			console.log(`   ✓ Категория уже существует: ${data.name}`)
		} else {
			const category = await prisma.productCategory.create({ data })
			categories.push(category)
			console.log(`   ✓ Создана категория: ${data.name}`)
		}
	}
	return categories.map((c) => ({ id: c.id, name: c.name }))
}

async function createParameters(
	categories: TestData['categories']
): Promise<TestData['parameters']> {
	console.log('⚙️ Создание параметров...')
	const parametersData = [
		{
			name: 'Larghezza',
			nameIt: 'Larghezza',
			type: 'NUMBER' as ParameterType,
			description: 'Ширина изделия',
			unit: 'mm',
			minValue: 600,
			maxValue: 3000,
			step: 10,
			isGlobal: false,
			isActive: true,
		},
		{
			name: 'Altezza',
			nameIt: 'Altezza',
			type: 'NUMBER' as ParameterType,
			description: 'Высота изделия',
			unit: 'mm',
			minValue: 1800,
			maxValue: 2400,
			step: 10,
			isGlobal: false,
			isActive: true,
		},
		{
			name: 'Materiale',
			nameIt: 'Materiale',
			type: 'SELECT' as ParameterType,
			description: 'Материал изготовления',
			isGlobal: false,
			isActive: true,
		},
		{
			name: 'Colore telaio',
			nameIt: 'Colore telaio',
			type: 'COLOR' as ParameterType,
			description: 'Цвет рамы',
			isGlobal: false,
			isActive: true,
		},
		{
			name: 'Tipo apertura',
			nameIt: 'Tipo apertura',
			type: 'SELECT' as ParameterType,
			description: 'Тип открывания',
			isGlobal: false,
			isActive: true,
		},
		{
			name: 'Vetro',
			nameIt: 'Vetro',
			type: 'SELECT' as ParameterType,
			description: 'Тип стекла',
			isGlobal: false,
			isActive: true,
		},
	]

	const parameters = []
	for (const data of parametersData) {
		const existing = await prisma.parameterTemplate.findFirst({
			where: { name: data.name },
		})
		if (existing) {
			parameters.push(existing)
			console.log(`   ✓ Параметр уже существует: ${data.name}`)
		} else {
			const parameter = await prisma.parameterTemplate.create({ data })
			parameters.push(parameter)
			console.log(`   ✓ Создан параметр: ${data.name}`)
		}
	}
	return parameters.map((p) => ({ id: p.id, name: p.name, type: p.type }))
}

async function createParameterValues(
	parameters: TestData['parameters']
): Promise<void> {
	console.log('📝 Создание значений параметров...')

	// Значения для Materiale
	const materialeParam = parameters.find((p) => p.name === 'Materiale')
	if (materialeParam) {
		const materialValues = [
			{ value: 'MDF', valueIt: 'MDF', order: 0 },
			{ value: 'Legno massello', valueIt: 'Legno massello', order: 1 },
			{ value: 'PVC', valueIt: 'PVC', order: 2 },
			{ value: 'Alluminio', valueIt: 'Alluminio', order: 3 },
		]
		for (const val of materialValues) {
			const existing = await prisma.parameterValue.findFirst({
				where: {
					parameterId: materialeParam.id,
					value: val.value,
				},
			})
			if (!existing) {
				await prisma.parameterValue.create({
					data: {
						parameterId: materialeParam.id,
						value: val.value,
						valueIt: val.valueIt,
						order: val.order,
						isActive: true,
					},
				})
				console.log(`   ✓ Создано значение: ${val.value}`)
			}
		}
	}

	// Значения для Tipo apertura
	const aperturaParam = parameters.find((p) => p.name === 'Tipo apertura')
	if (aperturaParam) {
		const aperturaValues = [
			{ value: 'Battente', valueIt: 'Battente', order: 0 },
			{ value: 'Scorrevole', valueIt: 'Scorrevole', order: 1 },
			{ value: 'A libro', valueIt: 'A libro', order: 2 },
			{ value: 'Fissa', valueIt: 'Fissa', order: 3 },
		]
		for (const val of aperturaValues) {
			const existing = await prisma.parameterValue.findFirst({
				where: {
					parameterId: aperturaParam.id,
					value: val.value,
				},
			})
			if (!existing) {
				await prisma.parameterValue.create({
					data: {
						parameterId: aperturaParam.id,
						value: val.value,
						valueIt: val.valueIt,
						order: val.order,
						isActive: true,
					},
				})
				console.log(`   ✓ Создано значение: ${val.value}`)
			}
		}
	}

	// Значения для Vetro
	const vetroParam = parameters.find((p) => p.name === 'Vetro')
	if (vetroParam) {
		const vetroValues = [
			{ value: 'Semplice', valueIt: 'Semplice', order: 0 },
			{ value: 'Doppio vetro', valueIt: 'Doppio vetro', order: 1 },
			{ value: 'Triplo vetro', valueIt: 'Triplo vetro', order: 2 },
			{ value: 'Vetro camera', valueIt: 'Vetro camera', order: 3 },
		]
		for (const val of vetroValues) {
			const existing = await prisma.parameterValue.findFirst({
				where: {
					parameterId: vetroParam.id,
					value: val.value,
				},
			})
			if (!existing) {
				await prisma.parameterValue.create({
					data: {
						parameterId: vetroParam.id,
						value: val.value,
						valueIt: val.valueIt,
						order: val.order,
						isActive: true,
					},
				})
				console.log(`   ✓ Создано значение: ${val.value}`)
			}
		}
	}

	// Цвета для Colore telaio
	const coloreParam = parameters.find((p) => p.name === 'Colore telaio')
	if (coloreParam) {
		const colorValues = [
			{
				value: 'Bianco traffico',
				valueIt: 'Bianco traffico',
				hexColor: '#F1F0EA',
				order: 0,
			},
			{
				value: 'Grigio antracite',
				valueIt: 'Grigio antracite',
				hexColor: '#383E42',
				order: 1,
			},
			{
				value: 'Marrone noce',
				valueIt: 'Marrone noce',
				hexColor: '#5A3A29',
				order: 2,
			},
			{
				value: 'Nero',
				valueIt: 'Nero',
				hexColor: '#0E0E10',
				order: 3,
			},
			{
				value: 'Beige',
				valueIt: 'Beige',
				hexColor: '#D1BC8A',
				order: 4,
			},
		]
		for (const val of colorValues) {
			const existing = await prisma.parameterValue.findFirst({
				where: {
					parameterId: coloreParam.id,
					value: val.value,
				},
			})
			if (!existing) {
				const ralCode = hexToRAL(val.hexColor)
				await prisma.parameterValue.create({
					data: {
						parameterId: coloreParam.id,
						value: val.value,
						valueIt: val.valueIt,
						hexColor: val.hexColor,
						ralCode: ralCode,
						order: val.order,
						isActive: true,
					},
				})
				console.log(`   ✓ Создан цвет: ${val.value} (${ralCode})`)
			}
		}
	}
}

async function linkSuppliersToCategories(
	suppliers: TestData['suppliers'],
	categories: TestData['categories']
): Promise<void> {
	console.log('🔗 Привязка поставщиков к категориям...')
	for (const supplier of suppliers.slice(0, 3)) {
		for (const category of categories.slice(0, 2)) {
			const existing = await prisma.supplierProductCategory.findFirst({
				where: {
					supplierId: supplier.id,
					categoryId: category.id,
				},
			})
			if (!existing) {
				await prisma.supplierProductCategory.create({
					data: {
						supplierId: supplier.id,
						categoryId: category.id,
						parameters: {},
						isActive: true,
					},
				})
				console.log(`   ✓ Привязан ${supplier.name} → ${category.name}`)
			}
		}
	}
}

async function linkParametersToCategories(
	parameters: TestData['parameters'],
	categories: TestData['categories']
): Promise<void> {
	console.log('🔗 Привязка параметров к категориям...')
	const porteInterne = categories.find((c) => c.name === 'Porte interne')
	if (porteInterne) {
		for (const param of parameters) {
			const existing = await prisma.categoryParameter.findFirst({
				where: {
					categoryId: porteInterne.id,
					parameterId: param.id,
				},
			})
			if (!existing) {
				await prisma.categoryParameter.create({
					data: {
						categoryId: porteInterne.id,
						parameterId: param.id,
						isRequired: ['Larghezza', 'Altezza', 'Materiale'].includes(
							param.name
						),
					},
				})
				console.log(`   ✓ Привязан параметр ${param.name} к ${porteInterne.name}`)
			}
		}
	}
}

async function main() {
	console.log('🚀 Генерация тестовых данных для MODOCRM\n')

	try {
		// Получаем или создаем организацию
		const org = await getOrCreateOrganization()
		console.log(`📋 Организация: ${org.name} (${org.id})\n`)

		// Создаем данные
		const suppliers = await createSuppliers(org.id)
		console.log()

		const clients = await createClients(org.id)
		console.log()

		const installers = await createInstallers(org.id)
		console.log()

		const partners = await createPartners(org.id)
		console.log()

		const categories = await createCategories(org.id)
		console.log()

		const parameters = await createParameters(categories)
		console.log()

		await createParameterValues(parameters)
		console.log()

		await linkSuppliersToCategories(suppliers, categories)
		console.log()

		await linkParametersToCategories(parameters, categories)
		console.log()

		console.log('='.repeat(60))
		console.log('✅ Генерация тестовых данных завершена!')
		console.log('='.repeat(60))
		console.log(`\n📊 Создано:`)
		console.log(`   - Поставщиков: ${suppliers.length}`)
		console.log(`   - Клиентов: ${clients.length}`)
		console.log(`   - Монтажников: ${installers.length}`)
		console.log(`   - Партнёров: ${partners.length}`)
		console.log(`   - Категорий: ${categories.length}`)
		console.log(`   - Параметров: ${parameters.length}`)
	} catch (error) {
		console.error('❌ Ошибка при генерации данных:', error)
		throw error
	} finally {
		await prisma.$disconnect()
	}
}

main()

