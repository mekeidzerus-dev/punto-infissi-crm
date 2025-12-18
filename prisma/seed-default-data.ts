/**
 * Seed скрипт для создания стандартных данных приложения
 * Выполняется автоматически при первом запуске или деплое
 * Создает стандартные категории, параметры, системных поставщика/покупателя
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Стандартные категории продуктов (нельзя удалить)
const STANDARD_CATEGORIES = [
	{ name: 'Finestre', icon: '🪟', description: 'Окна' },
	{ name: 'Porte', icon: '🚪', description: 'Двери' },
	{ name: 'Porte-finestre', icon: '🚪🪟', description: 'Двери-окна' },
	{ name: 'Tende', icon: '🪟', description: 'Портьеры' },
	{ name: 'Tapparelle', icon: '🪟', description: 'Рольставни' },
	{ name: 'Cancelli', icon: '🚧', description: 'Ворота' },
	{ name: 'Persiane', icon: '🪟', description: 'Жалюзи' },
	{ name: 'Zanzariere', icon: '🪟', description: 'Москитные сетки' },
]

// Стандартные параметры (нельзя удалить)
const STANDARD_PARAMETERS = [
	{
		name: 'Ширина',
		nameIt: 'Larghezza',
		type: 'NUMBER',
		unit: 'мм',
		description: 'Ширина изделия',
		isSystem: true,
		isGlobal: true,
	},
	{
		name: 'Высота',
		nameIt: 'Altezza',
		type: 'NUMBER',
		unit: 'мм',
		description: 'Высота изделия',
		isSystem: true,
		isGlobal: true,
	},
	{
		name: 'Цвет',
		nameIt: 'Colore',
		type: 'COLOR',
		description: 'Цвет изделия',
		isSystem: true,
		isGlobal: true,
	},
	{
		name: 'Материал',
		nameIt: 'Materiale',
		type: 'SELECT',
		description: 'Материал изготовления',
		isSystem: true,
		isGlobal: true,
	},
	{
		name: 'Тип открывания',
		nameIt: 'Tipo di apertura',
		type: 'SELECT',
		description: 'Тип механизма открывания',
		isSystem: true,
		isGlobal: true,
	},
]

async function createStandardCategories(organizationId: string) {
	console.log('📦 Создание стандартных категорий...')

	for (const category of STANDARD_CATEGORIES) {
		const existing = await prisma.productCategory.findFirst({
			where: {
				name: category.name,
				organizationId: organizationId,
			},
		})

		if (!existing) {
			await prisma.productCategory.create({
				data: {
					name: category.name,
					icon: category.icon,
					description: category.description,
					organizationId: organizationId,
					isSystem: true, // Помечаем как системную
				},
			})
			console.log(`  ✅ Создана категория: ${category.name}`)
		} else {
			// Обновляем флаг isSystem если категория уже существует
			if (!existing.isSystem) {
				await prisma.productCategory.update({
					where: { id: existing.id },
					data: { isSystem: true },
				})
				console.log(`  ✅ Обновлена категория: ${category.name} (isSystem=true)`)
			} else {
				console.log(`  ⏭️  Категория уже существует: ${category.name}`)
			}
		}
	}
}

async function createStandardParameters(organizationId: string) {
	console.log('⚙️  Создание стандартных параметров...')

	for (const param of STANDARD_PARAMETERS) {
		const existing = await prisma.parameterTemplate.findFirst({
			where: {
				name: param.name,
				organizationId: organizationId,
			},
		})

		if (!existing) {
			await prisma.parameterTemplate.create({
				data: {
					name: param.name,
					nameIt: param.nameIt,
					type: param.type as any,
					unit: param.unit || null,
					description: param.description,
					organizationId: organizationId,
					isSystem: param.isSystem,
					isGlobal: param.isGlobal,
					isActive: true,
				},
			})
			console.log(`  ✅ Создан параметр: ${param.name}`)
		} else {
			// Обновляем флаги если параметр уже существует
			if (!existing.isSystem || !existing.isGlobal) {
				await prisma.parameterTemplate.update({
					where: { id: existing.id },
					data: {
						isSystem: param.isSystem,
						isGlobal: param.isGlobal,
					},
				})
				console.log(`  ✅ Обновлен параметр: ${param.name}`)
			} else {
				console.log(`  ⏭️  Параметр уже существует: ${param.name}`)
			}
		}
	}
}

async function createSystemSupplier(organizationId: string) {
	console.log('🏭 Создание системного поставщика...')

	const existing = await prisma.supplier.findFirst({
		where: {
			name: 'System Supplier',
			organizationId: organizationId,
			isSystem: true,
		},
	})

	if (!existing) {
		await prisma.supplier.create({
			data: {
				name: 'System Supplier',
				shortName: 'SYS',
				shortNameIt: 'SIS',
				phone: '+39 000 000 0000',
				organizationId: organizationId,
				status: 'active',
				isSystem: true, // Помечаем как системного
				notes: 'Системный поставщик для быстрых операций',
			},
		})
		console.log('  ✅ Создан системный поставщик')
	} else {
		console.log('  ⏭️  Системный поставщик уже существует')
	}
}

async function createSystemBuyer(organizationId: string) {
	console.log('🛒 Создание системного покупателя...')

	const existing = await prisma.client.findFirst({
		where: {
			organizationId: organizationId,
			companyName: 'System Buyer',
		},
	})

	if (!existing) {
		await prisma.client.create({
			data: {
				type: 'company',
				companyName: 'System Buyer',
				phone: '0000000000',
				organizationId: organizationId,
				notes: 'Системный покупатель для быстрых операций без указания данных клиента',
			},
		})
		console.log('  ✅ Создан системный покупатель')
	} else {
		console.log('  ⏭️  Системный покупатель уже существует')
	}
}

async function main() {
	console.log('🌱 Создание стандартных данных для всех организаций...\n')

	try {
		// Получаем все организации
		const organizations = await prisma.organization.findMany()

		if (organizations.length === 0) {
			console.log('⚠️  Организации не найдены. Стандартные данные будут созданы при создании первой организации.')
			return
		}

		for (const org of organizations) {
			console.log(`\n📋 Организация: ${org.name} (${org.id})`)
			console.log('='.repeat(60))

			await createStandardCategories(org.id)
			await createStandardParameters(org.id)
			await createSystemSupplier(org.id)
			await createSystemBuyer(org.id)
		}

		console.log('\n' + '='.repeat(60))
		console.log('✅ Стандартные данные созданы для всех организаций!')
		console.log('='.repeat(60))
	} catch (error: any) {
		console.error('❌ Ошибка при создании стандартных данных:', error)
		throw error
	}
}

main()
	.catch(e => {
		console.error('❌ Критическая ошибка:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})

