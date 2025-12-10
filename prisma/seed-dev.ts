import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
	if (process.env.SEED_FORCE !== 'true') {
		console.error('❌ Set SEED_FORCE=true to run seed-dev seeding');
		process.exit(1);
	}
	console.log('🌱 Начинаем заполнение тестовыми данными...')

	// Очистка существующих данных (в правильном порядке, учитывая зависимости)
	console.log('🧹 Очистка старых данных...')

	// 1. Удаляем предложения и связанные данные
	await prisma.proposalTemplateLink.deleteMany()
	await prisma.proposalPosition.deleteMany()
	await prisma.proposalGroup.deleteMany()
	await prisma.proposalDocument.deleteMany()

	// 2. Удаляем заказы
	await prisma.orderItem.deleteMany()
	await prisma.order.deleteMany()

	// 3. Удаляем параметры и связи
	await prisma.categoryParameter.deleteMany()
	await prisma.supplierParameterOverride.deleteMany()
	await prisma.parameterValue.deleteMany()
	await prisma.parameterTemplate.deleteMany()

	// 4. Удаляем связи поставщиков с категориями
	await prisma.supplierProductCategory.deleteMany()

	// 5. Удаляем поставщиков и клиентов
	await prisma.supplier.deleteMany()
	await prisma.client.deleteMany()

	// 6. Удаляем категории
	await prisma.productCategory.deleteMany()

	// 7. Удаляем пользователей и сессии
	await prisma.account.deleteMany()
	await prisma.session.deleteMany()
	await prisma.user.deleteMany()

	// 1. Создание администратора (NextAuth будет управлять аутентификацией)
	console.log('👤 Создание администратора...')
	await prisma.user.create({
		data: {
			email: 'admin@puntoinfissi.it',
			name: 'Amministratore',
			role: 'admin',
			emailVerified: new Date(),
		},
	})

	// 2. Создание категории "Porte Interne"
	console.log('📁 Создание категории "Porte Interne"...')
	const category = await prisma.productCategory.create({
		data: {
			name: 'Porte Interne',
			description: 'Porte per interni di alta qualità',
			icon: '🚪',
			isActive: true,
		},
	})

	// 3. Создание параметров для категории
	console.log('⚙️ Создание параметров...')

	// Параметр: Модель (обязательный для всех продуктов)
	const modelParam = await prisma.parameterTemplate.create({
		data: {
			name: 'Модель',
			nameIt: 'Modello',
			type: 'TEXT',
			description: 'Название модели продукта',
			isGlobal: true,
			isActive: true,
		},
	})

	// Параметр: Материал
	const materialParam = await prisma.parameterTemplate.create({
		data: {
			name: 'Материал',
			nameIt: 'Materiale',
			type: 'SELECT',
			description: 'Материал изготовления двери',
			isGlobal: true,
			isActive: true,
		},
	})

	await prisma.parameterValue.createMany({
		data: [
			{
				parameterId: materialParam.id,
				value: 'Массив дерева',
				valueIt: 'Legno massello',
				order: 1,
			},
			{
				parameterId: materialParam.id,
				value: 'Ламинат',
				valueIt: 'Laminato',
				order: 2,
			},
			{ parameterId: materialParam.id, value: 'МДФ', valueIt: 'MDF', order: 3 },
			{
				parameterId: materialParam.id,
				value: 'Закаленное стекло',
				valueIt: 'Vetro temperato',
				order: 4,
			},
			{
				parameterId: materialParam.id,
				value: 'Алюминий',
				valueIt: 'Alluminio',
				order: 5,
			},
		],
	})

	// Параметр: Размеры
	const sizeParam = await prisma.parameterTemplate.create({
		data: {
			name: 'Размеры',
			nameIt: 'Dimensioni',
			type: 'SELECT',
			description: 'Размеры двери',
			unit: 'см',
			isGlobal: true,
			isActive: true,
		},
	})

	await prisma.parameterValue.createMany({
		data: [
			{
				parameterId: sizeParam.id,
				value: '70x200 см',
				valueIt: '70x200 cm',
				order: 1,
			},
			{
				parameterId: sizeParam.id,
				value: '80x200 см',
				valueIt: '80x200 cm',
				order: 2,
			},
			{
				parameterId: sizeParam.id,
				value: '90x200 см',
				valueIt: '90x200 cm',
				order: 3,
			},
			{
				parameterId: sizeParam.id,
				value: '100x200 см',
				valueIt: '100x200 cm',
				order: 4,
			},
		],
	})

	// Параметр: Цвет
	const colorParam = await prisma.parameterTemplate.create({
		data: {
			name: 'Цвет',
			nameIt: 'Colore',
			type: 'COLOR',
			description: 'Цвет двери',
			isGlobal: true,
			isActive: true,
		},
	})

	await prisma.parameterValue.createMany({
		data: [
			{
				parameterId: colorParam.id,
				value: 'Белый',
				valueIt: 'Bianco',
				hexColor: '#FFFFFF',
				order: 1,
			},
			{
				parameterId: colorParam.id,
				value: 'Орех',
				valueIt: 'Noce',
				hexColor: '#8B4513',
				order: 2,
			},
			{
				parameterId: colorParam.id,
				value: 'Дуб',
				valueIt: 'Rovere',
				hexColor: '#D2B48C',
				order: 3,
			},
			{
				parameterId: colorParam.id,
				value: 'Серый',
				valueIt: 'Grigio',
				hexColor: '#808080',
				order: 4,
			},
			{
				parameterId: colorParam.id,
				value: 'Черный',
				valueIt: 'Nero',
				hexColor: '#000000',
				order: 5,
			},
		],
	})

	// Параметр: Стекло
	const glassParam = await prisma.parameterTemplate.create({
		data: {
			name: 'Стекло',
			nameIt: 'Vetro',
			type: 'BOOLEAN',
			description: 'Наличие стеклянных вставок',
			isGlobal: true,
			isActive: true,
		},
	})

	// Параметр: Установка
	const installationParam = await prisma.parameterTemplate.create({
		data: {
			name: 'Установка',
			nameIt: 'Installazione',
			type: 'BOOLEAN',
			description: 'Включить установку в стоимость',
			isGlobal: true,
			isActive: true,
		},
	})

	// Привязка параметров к категории
	await prisma.categoryParameter.createMany({
		data: [
			{
				categoryId: category.id,
				parameterId: modelParam.id,
				isRequired: true,
				order: 0,
				displayNameIt: 'Modello',
			},
			{
				categoryId: category.id,
				parameterId: materialParam.id,
				isRequired: true,
				order: 1,
				displayNameIt: 'Materiale',
			},
			{
				categoryId: category.id,
				parameterId: sizeParam.id,
				isRequired: true,
				order: 2,
				displayNameIt: 'Dimensioni',
			},
			{
				categoryId: category.id,
				parameterId: colorParam.id,
				isRequired: true,
				order: 3,
				displayNameIt: 'Colore',
			},
			{
				categoryId: category.id,
				parameterId: glassParam.id,
				isRequired: false,
				order: 4,
				displayNameIt: 'Vetro',
			},
			{
				categoryId: category.id,
				parameterId: installationParam.id,
				isRequired: false,
				order: 5,
				displayNameIt: 'Installazione',
			},
		],
	})

	// 4. Создание 5 клиентов
	console.log('👥 Создание клиентов...')

	const clients = await Promise.all([
		prisma.client.create({
			data: {
				type: 'individual',
				firstName: 'Marco',
				lastName: 'Rossi',
				email: 'marco.rossi@email.it',
				phone: '+39 333 1234567',
				address: 'Via Roma 15, Milano',
				codiceFiscale: 'RSSMRC80A01F205X',
				notes: 'Cliente privato, interessato a porte interne moderne',
			},
		}),
		prisma.client.create({
			data: {
				type: 'company',
				companyName: 'Bianchi Costruzioni SRL',
				firstName: 'Giuseppe',
				lastName: 'Bianchi',
				email: 'giuseppe.bianchi@email.it',
				phone: '+39 333 2345678',
				address: 'Corso Vittorio Emanuele 42, Roma',
				partitaIVA: 'IT12345678901',
				legalAddress: 'Corso Vittorio Emanuele 42, 00100 Roma',
				contactPerson: 'Giuseppe Bianchi',
				notes: 'Компания-застройщик, крупные заказы',
			},
		}),
		prisma.client.create({
			data: {
				type: 'individual',
				firstName: 'Anna',
				lastName: 'Verdi',
				email: 'anna.verdi@email.it',
				phone: '+39 333 3456789',
				address: 'Piazza Duomo 8, Firenze',
				codiceFiscale: 'VRDNNA85M50D612K',
				notes: 'Частный клиент, ремонт квартиры',
			},
		}),
		prisma.client.create({
			data: {
				type: 'company',
				companyName: 'Ferrari Edilizia SPA',
				firstName: 'Luigi',
				lastName: 'Ferrari',
				email: 'luigi.ferrari@email.it',
				phone: '+39 333 4567890',
				address: 'Via Garibaldi 23, Napoli',
				partitaIVA: 'IT98765432109',
				legalAddress: 'Via Garibaldi 23, 80100 Napoli',
				contactPerson: 'Luigi Ferrari',
				notes: 'Строительная компания, регулярные заказы',
			},
		}),
		prisma.client.create({
			data: {
				type: 'individual',
				firstName: 'Francesca',
				lastName: 'Colombo',
				email: 'francesca.colombo@email.it',
				phone: '+39 333 5678901',
				address: 'Viale Europa 56, Torino',
				codiceFiscale: 'CLMFNC90D45L219Y',
				notes: 'Дизайнер интерьеров, подбор дверей для проекта',
			},
		}),
	])

	// 5. Создание 5 поставщиков
	console.log('🏭 Создание поставщиков...')

	const suppliers = await Promise.all([
		prisma.supplier.create({
			data: {
				name: 'Porte Italiane SRL',
				email: 'info@porteitaliane.it',
				phone: '+39 02 1234567',
				address: 'Via Industriale 100, Milano',
				partitaIVA: 'IT11111111111',
				legalAddress: 'Via Industriale 100, 20100 Milano',
				contactPerson: 'Roberto Mancini',
				paymentTerms: '30 giorni fine mese',
				deliveryDays: 15,
				rating: 5,
				status: 'active',
				notes: 'Fornitore principale per porte interne di alta qualità',
			},
		}),
		prisma.supplier.create({
			data: {
				name: 'LegnoQualità SPA',
				email: 'vendite@legnoqualita.it',
				phone: '+39 06 2345678',
				address: 'Strada Provinciale 45, Roma',
				partitaIVA: 'IT22222222222',
				legalAddress: 'Strada Provinciale 45, 00100 Roma',
				contactPerson: 'Giulia Bellini',
				paymentTerms: '60 giorni data fattura',
				deliveryDays: 20,
				rating: 5,
				status: 'active',
				notes: 'Specializzato in legno massello',
			},
		}),
		prisma.supplier.create({
			data: {
				name: 'ModernDoor Italia',
				email: 'commerciale@moderndoor.it',
				phone: '+39 055 3456789',
				address: 'Via Artigianale 78, Firenze',
				partitaIVA: 'IT33333333333',
				legalAddress: 'Via Artigianale 78, 50100 Firenze',
				contactPerson: 'Alessandro Conti',
				paymentTerms: '30 giorni data fattura',
				deliveryDays: 10,
				rating: 4,
				status: 'active',
				notes: 'Design moderno e contemporaneo',
			},
		}),
		prisma.supplier.create({
			data: {
				name: 'VetroPorte Design',
				email: 'info@vetroportedesign.it',
				phone: '+39 081 4567890',
				address: 'Corso Meridionale 234, Napoli',
				partitaIVA: 'IT44444444444',
				legalAddress: 'Corso Meridionale 234, 80100 Napoli',
				contactPerson: 'Simona Ricci',
				paymentTerms: '45 giorni fine mese',
				deliveryDays: 25,
				rating: 5,
				status: 'active',
				notes: 'Specialista porte con vetro',
			},
		}),
		prisma.supplier.create({
			data: {
				name: 'PremiumPorte Group',
				email: 'sales@premiumporte.it',
				phone: '+39 011 5678901',
				address: 'Via Torino 156, Torino',
				partitaIVA: 'IT55555555555',
				legalAddress: 'Via Torino 156, 10100 Torino',
				contactPerson: 'Davide Moretti',
				paymentTerms: '30 giorni data fattura',
				deliveryDays: 12,
				rating: 5,
				status: 'active',
				notes: 'Soluzioni premium, alta gamma',
			},
		}),
	])

	// 6. Связь поставщиков с категорией
	console.log('🔗 Создание связей поставщик-категория...')

	await Promise.all(
		suppliers.map((supplier, index) =>
			prisma.supplierProductCategory.create({
				data: {
					supplierId: supplier.id,
					categoryId: category.id,
					parameters: {
						basePrice: 500 + index * 100, // 500, 600, 700, 800, 900 евро
						priceMultiplier: 1 + index * 0.05, // 1.0, 1.05, 1.10, 1.15, 1.20
						deliveryDays: 7 + index * 3, // 7, 10, 13, 16, 19 дней
						minOrder: 1,
						discount: index * 2, // 0%, 2%, 4%, 6%, 8%
						specialty:
							index === 0
								? 'alta qualità'
								: index === 1
								? 'legno massello'
								: index === 2
								? 'design moderno'
								: index === 3
								? 'porte con vetro'
								: 'soluzioni premium',
					},
					isActive: true,
				},
			})
		)
	)

	console.log('✅ Тестовые данные успешно созданы!')
	console.log('\n📊 СОЗДАНО:')
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
	console.log(`   👤 Администратор: admin@puntoinfissi.it`)
	console.log(`   📁 Категорий: 1 (Porte Interne 🚪)`)
	console.log(
		`   ⚙️  Параметров: 5 (Материал, Размеры, Цвет, Стекло, Установка)`
	)
	console.log(
		`   💎 Значений параметров: ${5 + 4 + 5} (Материал: 5, Размеры: 4, Цвет: 5)`
	)
	console.log(`   👥 Клиентов: ${clients.length} (3 частных, 2 компании)`)
	console.log(`   🏭 Поставщиков: ${suppliers.length}`)
	console.log(`   🔗 Связей поставщик-категория: ${suppliers.length}`)
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
	console.log('\n🎯 ТЕПЕРЬ МОЖЕШЬ:')
	console.log('   ✅ Авторизоваться через ссылку входа (admin@puntoinfissi.it)')
	console.log('   ✅ Просмотреть клиентов и поставщиков')
	console.log('   ✅ Создать предложение с конфигуратором')
	console.log('   ✅ Тестировать систему параметров')
	console.log('\n🚀 Приложение готово к разработке!')
}

main()
	.catch(e => {
		console.error('❌ Ошибка:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
