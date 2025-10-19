// Создание тестового продукта с визуализацией
const BASE_URL = 'http://localhost:3000'

async function createTestProduct() {
	console.log('🎨 СОЗДАНИЕ ТЕСТОВОГО ПРОДУКТА С ВИЗУАЛИЗАЦИЕЙ')
	console.log('='.repeat(70))

	// 1. Получить клиента
	console.log('\n👤 Шаг 1: Получение клиента...')
	const clientsRes = await fetch(`${BASE_URL}/api/clients`)
	const clients = await clientsRes.json()
	const testClient = clients[0]
	console.log(`✅ Клиент: ${testClient.firstName} ${testClient.lastName}`)

	// 2. Получить категорию
	console.log('\n📁 Шаг 2: Получение категории...')
	const categoriesRes = await fetch(`${BASE_URL}/api/product-categories`)
	const categories = await categoriesRes.json()
	const windowCategory = categories.find(
		c => c.name === 'Окна' || c.name === 'Тестовые Окна'
	)
	console.log(`✅ Категория: ${windowCategory.name} (ID: ${windowCategory.id})`)

	// 3. Получить параметры категории
	console.log('\n📋 Шаг 3: Загрузка параметров категории...')
	const paramsRes = await fetch(
		`${BASE_URL}/api/category-parameters?categoryId=${windowCategory.id}`
	)
	const categoryParams = await paramsRes.json()
	console.log(`✅ Параметров: ${categoryParams.length}`)

	// 4. Получить поставщика
	console.log('\n🏭 Шаг 4: Получение поставщика...')
	const supplierCatsRes = await fetch(
		`${BASE_URL}/api/supplier-categories?categoryId=${windowCategory.id}`
	)
	const supplierCategories = await supplierCatsRes.json()

	if (supplierCategories.length === 0) {
		console.log('❌ Нет поставщиков для этой категории!')
		return
	}

	const testSupplierCategory = supplierCategories[0]
	console.log(`✅ Поставщик: ${testSupplierCategory.supplier.name}`)

	// 5. Создать конфигурацию с заполненными параметрами
	console.log('\n🎨 Шаг 5: Создание конфигурации продукта...')
	const productConfig = {
		categoryId: windowCategory.id,
		supplierId: testSupplierCategory.supplierId,
		supplierCategoryId: testSupplierCategory.id,
		parameters: {},
		customNotes: 'Тестовый продукт с полной визуализацией',
	}

	// Заполняем параметры
	categoryParams.forEach(cp => {
		const param = cp.parameter
		if (param.type === 'NUMBER') {
			if (param.nameIt === 'Larghezza' || param.name === 'Ширина') {
				productConfig.parameters[param.id] = 1400
			} else if (param.nameIt === 'Altezza' || param.name === 'Высота') {
				productConfig.parameters[param.id] = 2000
			}
		} else if (param.type === 'COLOR') {
			// Выбираем белый цвет
			const whiteColor = param.values?.find(
				v => v.valueIt === 'Bianco' || v.value === 'Белый'
			)
			if (whiteColor) {
				productConfig.parameters[param.id] = whiteColor.value
			}
		} else if (param.type === 'SELECT') {
			// Выбираем первое значение
			if (param.values && param.values.length > 0) {
				if (param.nameIt === 'Tipo di apertura') {
					// Для типа открытия выбираем "Поворотно-откидное"
					const ribalta = param.values.find(v => v.valueIt === 'Ribalta')
					productConfig.parameters[param.id] = ribalta
						? ribalta.value
						: param.values[0].value
				} else {
					productConfig.parameters[param.id] = param.values[0].value
				}
			}
		}
	})

	console.log('✅ Конфигурация создана:')
	Object.entries(productConfig.parameters).forEach(([key, value]) => {
		const param = categoryParams.find(cp => cp.parameter.id === key)
		console.log(
			`   - ${param?.parameter.nameIt || param?.parameter.name}: ${value}`
		)
	})

	// 6. Создать предложение
	console.log('\n📄 Шаг 6: Создание предложения...')
	const proposalResponse = await fetch(`${BASE_URL}/api/proposals`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			clientId: testClient.id,
			status: 'draft',
			positions: [
				{
					...productConfig,
					quantity: 2,
					unitPrice: 45000,
					description: 'Окно ПВХ с поворотно-откидным механизмом',
					vatRate: 22,
				},
			],
		}),
	})

	if (proposalResponse.ok) {
		const proposal = await proposalResponse.json()
		console.log(`✅ Предложение создано: ${proposal.number}`)
		console.log(`   ID: ${proposal.id}`)
		console.log(`   Позиций: ${proposal.positions?.length || 1}`)

		console.log('\n' + '='.repeat(70))
		console.log('🎉 ТЕСТОВЫЙ ПРОДУКТ УСПЕШНО СОЗДАН!')
		console.log('\n💡 ОТКРОЙТЕ:')
		console.log(`   http://localhost:3000/proposals`)
		console.log(`   Найдите предложение "${proposal.number}"`)
		console.log(`   Нажмите "Просмотр" чтобы увидеть визуализацию!`)

		return proposal
	} else {
		const error = await proposalResponse.json()
		console.log(`❌ Ошибка создания: ${JSON.stringify(error)}`)
	}
}

createTestProduct().catch(console.error)
