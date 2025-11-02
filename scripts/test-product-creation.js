/**
 * Тестовый скрипт для проверки создания товаров
 * Создает 5 тестовых документов предложений с товарами
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testProductCreation() {
	console.log('🧪 Начинаю тестирование создания товаров...\n')

	try {
		// 1. Получаем необходимые данные
		console.log('📋 Получаю данные...')
		const categories = await prisma.productCategory.findMany({
			where: { isActive: true },
			take: 3,
		})
		const clients = await prisma.client.findMany({ take: 5 })
		const suppliers = await prisma.supplier.findMany({ take: 3 })

		if (categories.length === 0) {
			throw new Error('Нет активных категорий')
		}
		if (clients.length === 0) {
			throw new Error('Нет клиентов')
		}
		if (suppliers.length === 0) {
			throw new Error('Нет поставщиков')
		}

		console.log(
			`✅ Найдено: ${categories.length} категорий, ${clients.length} клиентов, ${suppliers.length} поставщиков\n`
		)

		// 2. Находим параметр "Модель"
		const modelParameter = await prisma.parameterTemplate.findFirst({
			where: {
				OR: [{ name: 'Модель' }, { nameIt: 'Modello' }],
			},
		})

		if (!modelParameter) {
			throw new Error(
				'Параметр "Модель" не найден! Запустите scripts/create-model-parameter.js'
			)
		}

		console.log(`✅ Параметр "Модель" найден (ID: ${modelParameter.id})\n`)

		// 3. Создаем supplierCategory для каждой комбинации
		const supplierCategories = []
		for (const supplier of suppliers) {
			for (const category of categories) {
				const existing = await prisma.supplierProductCategory.findFirst({
					where: {
						supplierId: supplier.id,
						categoryId: category.id,
					},
				})

				if (!existing) {
					const sc = await prisma.supplierProductCategory.create({
						data: {
							supplierId: supplier.id,
							categoryId: category.id,
							parameters: [],
							isActive: true,
						},
					})
					supplierCategories.push(sc)
				} else {
					supplierCategories.push(existing)
				}
			}
		}

		console.log(
			`✅ Создано/найдено ${supplierCategories.length} связей поставщиков с категориями\n`
		)

		// 4. Создаем 5 тестовых документов
		for (let i = 1; i <= 5; i++) {
			console.log(`\n📝 Тест ${i}/5: Создание документа ${i}...`)

			const client = clients[i % clients.length]
			const supplierCategory = supplierCategories[i % supplierCategories.length]
			const category = categories.find(
				c => c.id === supplierCategory.categoryId
			)
			const supplier = suppliers.find(s => s.id === supplierCategory.supplierId)

			// Генерируем номер предложения
			const count = await prisma.proposalDocument.count()
			const number = `TEST-${String(count + 1).padStart(3, '0')}`

			// Создаем конфигурацию продукта
			const modelValue = `Модель-${i}-${Date.now()}`
			const configuration = {
				[modelParameter.id]: modelValue,
			}

			// Добавляем metadata для локализации
			const metadata = {
				categoryNameRu: category.name,
				categoryNameIt: category.nameIt || category.name,
				supplierShortNameRu: supplier.shortName || null,
				supplierShortNameIt: supplier.shortNameIt || null,
				supplierFullName: supplier.name,
				modelValueRu: modelValue,
				modelValueIt: modelValue,
				parameters: [],
				customNotes:
					i === 2 || i === 4 ? `Тестовые заметки для документа ${i}` : null,
			}

			// Создаем предложение
			const proposal = await prisma.proposalDocument.create({
				data: {
					number,
					proposalDate: new Date(),
					validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 дней
					clientId: client.id,
					responsibleManager: 'Тестовый менеджер',
					status: 'draft',
					vatRate: 22.0,
					notes: `Тестовый документ ${i}`,
					groups: {
						create: [
							{
								name: `Группа товаров ${i}`,
								description: `Описание группы ${i}`,
								sortOrder: 0,
								positions: {
									create: [
										{
											categoryId: category.id,
											supplierCategoryId: supplierCategory.id,
											configuration: {
												...configuration,
												_metadata: metadata,
											},
											unitPrice: 100 + i * 10,
											quantity: i,
											discount: i % 2 === 0 ? 5 : 0,
											vatRate: 22.0,
											vatAmount: 0,
											total: 0,
											description: `${category.name} | ${
												supplier.shortName || supplier.name
											} | ${modelValue}`,
											sortOrder: 0,
										},
									],
								},
							},
						],
					},
				},
				include: {
					client: true,
					groups: {
						include: {
							positions: {
								include: {
									category: true,
									supplierCategory: {
										include: {
											supplier: true,
										},
									},
								},
							},
						},
					},
				},
			})

			// Пересчитываем итоги
			let groupSubtotal = 0
			let groupDiscount = 0
			let totalVatAmount = 0

			for (const position of proposal.groups[0].positions) {
				const positionSubtotal =
					Number(position.unitPrice) * Number(position.quantity)
				const positionDiscountAmount =
					positionSubtotal * (Number(position.discount) / 100)
				const positionBeforeVat = positionSubtotal - positionDiscountAmount
				const positionVatAmount =
					positionBeforeVat * (Number(position.vatRate) / 100)
				const positionFinalTotal = positionBeforeVat + positionVatAmount

				groupSubtotal += positionSubtotal
				groupDiscount += positionDiscountAmount
				totalVatAmount += positionVatAmount

				await prisma.proposalPosition.update({
					where: { id: position.id },
					data: {
						discountAmount: positionDiscountAmount,
						vatAmount: positionVatAmount,
						total: positionFinalTotal,
					},
				})
			}

			await prisma.proposalGroup.update({
				where: { id: proposal.groups[0].id },
				data: {
					subtotal: groupSubtotal,
					discount: groupDiscount,
					total: groupSubtotal - groupDiscount,
				},
			})

			const finalTotal = groupSubtotal - groupDiscount + totalVatAmount
			await prisma.proposalDocument.update({
				where: { id: proposal.id },
				data: {
					subtotal: groupSubtotal,
					discount: groupDiscount,
					vatAmount: totalVatAmount,
					total: finalTotal,
				},
			})

			console.log(`   ✅ Документ ${number} создан`)
			console.log(`      - Клиент: ${client.companyName || client.firstName}`)
			console.log(`      - Категория: ${category.name}`)
			console.log(`      - Поставщик: ${supplier.name}`)
			console.log(`      - Модель: ${modelValue}`)
			console.log(`      - Позиций: ${proposal.groups[0].positions.length}`)
			if (metadata.customNotes) {
				console.log(`      - Заметки: ${metadata.customNotes}`)
			}
		}

		console.log('\n✅ Все тесты завершены успешно!')
		console.log('\n📊 Итоговая статистика:')
		const totalProposals = await prisma.proposalDocument.count()
		const totalPositions = await prisma.proposalPosition.count()
		console.log(`   - Всего документов: ${totalProposals}`)
		console.log(`   - Всего позиций: ${totalPositions}`)
	} catch (error) {
		console.error('❌ Ошибка при тестировании:', error)
		process.exit(1)
	} finally {
		await prisma.$disconnect()
	}
}

testProductCreation()
