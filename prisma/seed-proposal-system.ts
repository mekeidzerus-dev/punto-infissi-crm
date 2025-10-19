import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
	console.log('🌱 Seeding proposal system...')

	// 1. Создаем категории продуктов
	console.log('📦 Creating product categories...')

	const doorsCategory = await prisma.productCategory.upsert({
		where: { name: 'Двери' },
		update: {},
		create: {
			name: 'Двери',
			icon: '🚪',
			description: 'Входные и межкомнатные двери',
		},
	})

	const windowsCategory = await prisma.productCategory.upsert({
		where: { name: 'Окна' },
		update: {},
		create: {
			name: 'Окна',
			icon: '🪟',
			description: 'Окна из различных материалов',
		},
	})

	console.log(
		`✅ Created categories: ${doorsCategory.name}, ${windowsCategory.name}`
	)

	// 2. Создаем VAT ставки
	console.log('💰 Creating VAT rates...')

	const vatRates = [
		{ name: 'IVA 22%', percentage: 22.0, isDefault: true },
		{ name: 'IVA 10%', percentage: 10.0 },
		{ name: 'IVA 4%', percentage: 4.0 },
	]

	for (const vat of vatRates) {
		await prisma.vATRate.upsert({
			where: { name: vat.name },
			update: {},
			create: vat,
		})
	}

	console.log(`✅ Created ${vatRates.length} VAT rates`)

	// 3. Создаем связи поставщиков с категориями
	console.log('🔗 Creating supplier-category relationships...')

	// Получаем всех активных поставщиков
	const suppliers = await prisma.supplier.findMany({
		where: { status: 'active' },
	})

	if (suppliers.length > 0) {
		// Для каждого поставщика создаем связи с категориями
		for (const supplier of suppliers) {
			// Параметры для дверей
			const doorParameters = [
				{
					id: 'material',
					name: 'Материал',
					type: 'select',
					options: ['ПВХ', 'Дерево', 'Алюминий'],
					required: true,
					default: 'ПВХ',
				},
				{
					id: 'color',
					name: 'Цвет',
					type: 'select',
					options: [
						'RAL 7011 (Серый)',
						'RAL 9010 (Белый)',
						'RAL 3003 (Красный)',
					],
					required: true,
				},
				{
					id: 'width',
					name: 'Ширина (мм)',
					type: 'number',
					min: 600,
					max: 1200,
					required: true,
				},
				{
					id: 'height',
					name: 'Высота (мм)',
					type: 'number',
					min: 1800,
					max: 2500,
					required: true,
				},
				{
					id: 'opening',
					name: 'Открывание',
					type: 'select',
					options: [
						'Внутрь-влево',
						'Внутрь-вправо',
						'Наружу-влево',
						'Наружу-вправо',
					],
					required: true,
				},
				{
					id: 'handle',
					name: 'Ручка',
					type: 'select',
					options: ['Стандартная', 'Премиум', 'Антивандальная'],
					required: false,
				},
				{
					id: 'lock',
					name: 'Замок',
					type: 'select',
					options: ['Без замка', 'Цилиндровый', 'Мультиблокировка'],
					required: false,
				},
			]

			// Параметры для окон
			const windowParameters = [
				{
					id: 'material',
					name: 'Материал',
					type: 'select',
					options: ['ПВХ', 'Алюминий', 'Дерево'],
					required: true,
					default: 'ПВХ',
				},
				{
					id: 'color',
					name: 'Цвет',
					type: 'select',
					options: [
						'RAL 7011 (Серый)',
						'RAL 9010 (Белый)',
						'RAL 3003 (Красный)',
					],
					required: true,
				},
				{
					id: 'width',
					name: 'Ширина (мм)',
					type: 'number',
					min: 600,
					max: 2400,
					required: true,
				},
				{
					id: 'height',
					name: 'Высота (мм)',
					type: 'number',
					min: 800,
					max: 2200,
					required: true,
				},
				{
					id: 'glass',
					name: 'Стеклопакет',
					type: 'select',
					options: ['Однокамерный', 'Двухкамерный', 'Трехкамерный'],
					required: true,
				},
				{
					id: 'opening',
					name: 'Тип открывания',
					type: 'select',
					options: [
						'Поворотное',
						'Откидное',
						'Поворотно-откидное',
						'Раздвижное',
					],
					required: true,
				},
				{
					id: 'handle',
					name: 'Ручка',
					type: 'select',
					options: ['Стандартная', 'Премиум', 'Антивандальная'],
					required: false,
				},
			]

			// Создаем связь с дверями
			await prisma.supplierProductCategory.upsert({
				where: {
					supplierId_categoryId: {
						supplierId: supplier.id,
						categoryId: doorsCategory.id,
					},
				},
				update: {},
				create: {
					supplierId: supplier.id,
					categoryId: doorsCategory.id,
					parameters: doorParameters,
				},
			})

			// Создаем связь с окнами
			await prisma.supplierProductCategory.upsert({
				where: {
					supplierId_categoryId: {
						supplierId: supplier.id,
						categoryId: windowsCategory.id,
					},
				},
				update: {},
				create: {
					supplierId: supplier.id,
					categoryId: windowsCategory.id,
					parameters: windowParameters,
				},
			})
		}

		console.log(
			`✅ Created supplier-category relationships for ${suppliers.length} suppliers`
		)
	} else {
		console.log(
			'⚠️ No suppliers found, skipping supplier-category relationships'
		)
	}

	console.log('🎉 Proposal system seeded successfully!')
}

main()
	.catch(e => {
		console.error('❌ Error seeding proposal system:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
