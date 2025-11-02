import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedParameters() {
	console.log('🌱 Seeding parameters...')

	// 1. Материал рамы
	const materialParam = await prisma.parameterTemplate.upsert({
		where: { name: 'Материал рамы' },
		update: {},
		create: {
			name: 'Материал рамы',
			nameIt: 'Materiale telaio',
			type: 'SELECT',
			description: 'Материал из которого изготовлена рама',
			isGlobal: true,
			isActive: true,
			values: {
				create: [
					{
						value: 'Алюминий',
						valueIt: 'Alluminio',
						displayName: 'Алюминий',
						order: 0,
					},
					{ value: 'ПВХ', valueIt: 'PVC', displayName: 'ПВХ', order: 1 },
					{
						value: 'Дерево',
						valueIt: 'Legno',
						displayName: 'Дерево (дуб)',
						order: 2,
					},
					{
						value: 'Дерево-алюминий',
						valueIt: 'Legno-alluminio',
						displayName: 'Комбинированный',
						order: 3,
					},
				],
			},
		},
	})

	// 2. Цвет рамы
	const colorParam = await prisma.parameterTemplate.upsert({
		where: { name: 'Цвет рамы' },
		update: {},
		create: {
			name: 'Цвет рамы',
			nameIt: 'Colore telaio',
			type: 'COLOR',
			description: 'Цвет профиля рамы',
			isGlobal: true,
			isActive: true,
			values: {
				create: [
					{
						value: 'Белый',
						valueIt: 'Bianco',
						hexColor: '#FFFFFF',
						ralCode: 'RAL 9010',
						order: 0,
					},
					{
						value: 'Коричневый',
						valueIt: 'Marrone',
						hexColor: '#8B4513',
						ralCode: 'RAL 8017',
						order: 1,
					},
					{
						value: 'Антрацит',
						valueIt: 'Antracite',
						hexColor: '#36454F',
						ralCode: 'RAL 7016',
						order: 2,
					},
					{
						value: 'Серый',
						valueIt: 'Grigio',
						hexColor: '#808080',
						ralCode: 'RAL 7040',
						order: 3,
					},
					{
						value: 'Черный',
						valueIt: 'Nero',
						hexColor: '#000000',
						ralCode: 'RAL 9005',
						order: 4,
					},
					{
						value: 'Бежевый',
						valueIt: 'Beige',
						hexColor: '#F5F5DC',
						ralCode: 'RAL 1014',
						order: 5,
					},
				],
			},
		},
	})

	// 3. Ширина
	const widthParam = await prisma.parameterTemplate.upsert({
		where: { name: 'Ширина' },
		update: {},
		create: {
			name: 'Ширина',
			nameIt: 'Larghezza',
			type: 'NUMBER',
			description: 'Ширина изделия',
			unit: 'мм',
			minValue: 400,
			maxValue: 3000,
			step: 10,
			isGlobal: true,
			isActive: true,
		},
	})

	// 4. Высота
	const heightParam = await prisma.parameterTemplate.upsert({
		where: { name: 'Высота' },
		update: {},
		create: {
			name: 'Высота',
			nameIt: 'Altezza',
			type: 'NUMBER',
			description: 'Высота изделия',
			unit: 'мм',
			minValue: 400,
			maxValue: 2500,
			step: 10,
			isGlobal: true,
			isActive: true,
		},
	})

	// 5. Тип открытия
	const openingParam = await prisma.parameterTemplate.upsert({
		where: { name: 'Тип открытия' },
		update: {},
		create: {
			name: 'Тип открытия',
			nameIt: 'Tipo di apertura',
			type: 'SELECT',
			description: 'Способ открывания окна',
			isGlobal: true,
			isActive: true,
			values: {
				create: [
					{
						value: 'Глухое',
						valueIt: 'Fisso',
						displayName: 'Глухое (не открывается)',
						order: 0,
					},
					{
						value: 'Поворотное',
						valueIt: 'Battente',
						displayName: 'Поворотное',
						order: 1,
					},
					{
						value: 'Откидное',
						valueIt: 'Vasistas',
						displayName: 'Откидное',
						order: 2,
					},
					{
						value: 'Поворотно-откидное',
						valueIt: 'Ribalta',
						displayName: 'Поворотно-откидное',
						order: 3,
					},
					{
						value: 'Раздвижное',
						valueIt: 'Scorrevole',
						displayName: 'Раздвижное',
						order: 4,
					},
				],
			},
		},
	})

	// 6. Тип стеклопакета
	const glassParam = await prisma.parameterTemplate.upsert({
		where: { name: 'Тип стеклопакета' },
		update: {},
		create: {
			name: 'Тип стеклопакета',
			nameIt: 'Tipo di vetro',
			type: 'SELECT',
			description: 'Конфигурация стеклопакета',
			isGlobal: true,
			isActive: true,
			values: {
				create: [
					{
						value: 'Однокамерный',
						valueIt: 'Singolo',
						displayName: 'Однокамерный (4-16-4)',
						order: 0,
					},
					{
						value: 'Двухкамерный',
						valueIt: 'Doppio',
						displayName: 'Двухкамерный (4-16-4-16-4)',
						order: 1,
					},
					{
						value: 'Энергосберегающий',
						valueIt: 'Basso emissivo',
						displayName: 'Энергосберегающий',
						order: 2,
					},
					{
						value: 'Шумоизоляционный',
						valueIt: 'Insonorizzato',
						displayName: 'Шумоизоляционный',
						order: 3,
					},
				],
			},
		},
	})

	// 7. Фурнитура
	const hardwareParam = await prisma.parameterTemplate.upsert({
		where: { name: 'Фурнитура' },
		update: {},
		create: {
			name: 'Фурнитура',
			nameIt: 'Ferramenta',
			type: 'SELECT',
			description: 'Производитель фурнитуры',
			isGlobal: true,
			isActive: true,
			values: {
				create: [
					{ value: 'Roto', valueIt: 'Roto', displayName: 'Roto', order: 0 },
					{ value: 'Maco', valueIt: 'Maco', displayName: 'Maco', order: 1 },
					{
						value: 'Siegenia',
						valueIt: 'Siegenia',
						displayName: 'Siegenia',
						order: 2,
					},
					{
						value: 'GU',
						valueIt: 'GU',
						displayName: 'GU (Gretsch-Unitas)',
						order: 3,
					},
				],
			},
		},
	})

	// 8. Модель (обязательный параметр для всех продуктов)
	const modelParam = await prisma.parameterTemplate.upsert({
		where: { name: 'Модель' },
		update: {},
		create: {
			name: 'Модель',
			nameIt: 'Modello',
			type: 'TEXT',
			description: 'Название модели продукта',
			isGlobal: true,
			isActive: true,
		},
	})

	console.log('✅ Parameters seeded!')

	// Привязываем параметры к категориям
	console.log('🔗 Linking parameters to categories...')

	// Получаем существующие категории
	const categories = await prisma.productCategory.findMany()

	for (const category of categories) {
		// Для всех категорий добавляем базовые параметры
		const baseParams = [
			{
				parameterId: modelParam.id,
				isRequired: true,
				order: -1, // Модель всегда первая
				displayName: 'Модель',
				displayNameIt: 'Modello',
			},
			{
				parameterId: widthParam.id,
				isRequired: true,
				order: 0,
				displayName: 'Ширина',
				displayNameIt: 'Larghezza',
			},
			{
				parameterId: heightParam.id,
				isRequired: true,
				order: 1,
				displayName: 'Высота',
				displayNameIt: 'Altezza',
			},
		]

		// Для окон и дверей добавляем специфичные параметры
		if (
			category.name.toLowerCase().includes('окн') ||
			category.name.toLowerCase().includes('finestre')
		) {
			baseParams.push(
				{
					parameterId: materialParam.id,
					isRequired: true,
					order: 2,
					displayName: 'Материал рамы',
					displayNameIt: 'Materiale telaio',
				},
				{
					parameterId: colorParam.id,
					isRequired: true,
					order: 3,
					displayName: 'Цвет рамы',
					displayNameIt: 'Colore telaio',
				},
				{
					parameterId: openingParam.id,
					isRequired: true,
					order: 4,
					displayName: 'Тип открытия',
					displayNameIt: 'Tipo di apertura',
				},
				{
					parameterId: glassParam.id,
					isRequired: false,
					order: 5,
					displayName: 'Стеклопакет',
					displayNameIt: 'Vetro',
				},
				{
					parameterId: hardwareParam.id,
					isRequired: false,
					order: 6,
					displayName: 'Фурнитура',
					displayNameIt: 'Ferramenta',
				}
			)
		}

		// Создаем привязки
		for (const param of baseParams) {
			try {
				await prisma.categoryParameter.upsert({
					where: {
						categoryId_parameterId: {
							categoryId: category.id,
							parameterId: param.parameterId,
						},
					},
					update: {},
					create: {
						categoryId: category.id,
						...param,
					},
				})
			} catch (error) {
				// Игнорируем ошибки дублирования
			}
		}

		console.log(`  ✓ Linked parameters to ${category.name}`)
	}

	console.log('✅ All parameters linked to categories!')
}

seedParameters()
	.catch(e => {
		console.error('❌ Error seeding parameters:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
