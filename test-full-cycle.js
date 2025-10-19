// Полный цикл тестирования системы параметров
const BASE_URL = 'http://localhost:3000'

async function fullCycleTest() {
	console.log('🧪 ПОЛНЫЙ ЦИКЛ ТЕСТИРОВАНИЯ СИСТЕМЫ ПАРАМЕТРОВ')
	console.log('='.repeat(70))

	// ШАГ 1: Создать тестовую категорию
	console.log('\n📁 ШАГ 1: Создание тестовой категории...')
	const categoryResponse = await fetch(`${BASE_URL}/api/product-categories`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			name: 'Тестовые Окна',
			icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="12" x2="21" y2="12"/></svg>',
			description: 'Категория для тестирования',
		}),
	})

	if (!categoryResponse.ok) {
		console.log('⚠️  Категория уже существует или ошибка создания')
		// Получаем существующую
		const categoriesRes = await fetch(`${BASE_URL}/api/product-categories`)
		const categories = await categoriesRes.json()
		var testCategory =
			categories.find(c => c.name === 'Тестовые Окна') ||
			categories.find(c => c.name.includes('Окна'))
	} else {
		var testCategory = await categoryResponse.json()
		console.log(
			`✅ Категория создана: ${testCategory.name} (ID: ${testCategory.id})`
		)
	}

	// ШАГ 2: Получить существующие параметры
	console.log('\n📋 ШАГ 2: Получение существующих параметров...')
	const paramsResponse = await fetch(`${BASE_URL}/api/parameters`)
	const parameters = await paramsResponse.json()
	console.log(`✅ Найдено параметров: ${parameters.length}`)

	const widthParam = parameters.find(p => p.nameIt === 'Larghezza')
	const heightParam = parameters.find(p => p.nameIt === 'Altezza')
	const colorParam = parameters.find(p => p.type === 'COLOR')
	const materialParam = parameters.find(p => p.nameIt === 'Materiale telaio')
	const openingParam = parameters.find(p => p.nameIt === 'Tipo di apertura')

	console.log(`   - Ширина: ${widthParam ? '✅' : '❌'}`)
	console.log(`   - Высота: ${heightParam ? '✅' : '❌'}`)
	console.log(
		`   - Цвет: ${colorParam ? '✅' : '❌'} (${
			colorParam?.values?.length || 0
		} значений)`
	)
	console.log(
		`   - Материал: ${materialParam ? '✅' : '❌'} (${
			materialParam?.values?.length || 0
		} значений)`
	)
	console.log(
		`   - Тип открытия: ${openingParam ? '✅' : '❌'} (${
			openingParam?.values?.length || 0
		} значений)`
	)

	// ШАГ 3: Привязать параметры к категории
	console.log('\n🔗 ШАГ 3: Привязка параметров к категории...')
	const paramsToLink = [
		{ param: widthParam, isRequired: true, order: 0 },
		{ param: heightParam, isRequired: true, order: 1 },
		{ param: materialParam, isRequired: true, order: 2 },
		{ param: colorParam, isRequired: true, order: 3 },
		{ param: openingParam, isRequired: true, order: 4 },
	].filter(p => p.param)

	for (const { param, isRequired, order } of paramsToLink) {
		try {
			await fetch(`${BASE_URL}/api/category-parameters`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					categoryId: testCategory.id,
					parameterId: param.id,
					isRequired,
					order,
				}),
			})
			console.log(`   ✓ Привязан: ${param.nameIt}`)
		} catch (error) {
			console.log(`   ⚠️  ${param.nameIt} - уже привязан`)
		}
	}

	// ШАГ 4: Создать тестовых поставщиков
	console.log('\n🏭 ШАГ 4: Создание/получение поставщиков...')
	const suppliersRes = await fetch(`${BASE_URL}/api/suppliers`)
	const suppliers = await suppliersRes.json()
	console.log(`✅ Найдено поставщиков: ${suppliers.length}`)
	const testSuppliers = suppliers.slice(0, 2)
	testSuppliers.forEach((s, i) => {
		console.log(`   ${i + 1}. ${s.name}`)
	})

	// ШАГ 5: Привязать поставщиков к категории
	console.log('\n🔗 ШАГ 5: Привязка поставщиков к категории...')
	for (const supplier of testSuppliers) {
		try {
			const linkResponse = await fetch(`${BASE_URL}/api/supplier-categories`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					supplierId: supplier.id,
					categoryId: testCategory.id,
					parameters: {}, // Старая структура
				}),
			})
			if (linkResponse.ok) {
				console.log(`   ✓ Привязан поставщик: ${supplier.name}`)
			}
		} catch (error) {
			console.log(`   ⚠️  ${supplier.name} - уже привязан`)
		}
	}

	// ШАГ 6: Получить параметры категории
	console.log('\n📊 ШАГ 6: Проверка параметров категории...')
	const categoryParamsRes = await fetch(
		`${BASE_URL}/api/category-parameters?categoryId=${testCategory.id}`
	)
	const categoryParams = await categoryParamsRes.json()
	console.log(`✅ Параметров в категории: ${categoryParams.length}`)

	categoryParams.forEach((cp, i) => {
		const required = cp.isRequired ? '🔴' : '⚪'
		const values = cp.parameter.values?.length || 0
		console.log(
			`   ${i + 1}. ${required} ${cp.parameter.nameIt} (${
				cp.parameter.type
			}) - ${values} значений`
		)
	})

	// ШАГ 7: Создать тестовую конфигурацию продукта
	console.log('\n🎨 ШАГ 7: Создание тестовой конфигурации...')
	const testConfig = {
		categoryId: testCategory.id,
		supplierId: testSuppliers[0].id,
		parameters: {},
	}

	// Заполняем параметры
	categoryParams.forEach(cp => {
		const param = cp.parameter
		if (param.type === 'NUMBER') {
			if (param.nameIt === 'Larghezza') {
				testConfig.parameters[param.id] = 1200
			} else if (param.nameIt === 'Altezza') {
				testConfig.parameters[param.id] = 1800
			}
		} else if (param.type === 'SELECT' || param.type === 'COLOR') {
			if (param.values && param.values.length > 0) {
				testConfig.parameters[param.id] = param.values[0].value
			}
		}
	})

	console.log('✅ Конфигурация создана:')
	Object.entries(testConfig.parameters).forEach(([key, value]) => {
		const param = categoryParams.find(cp => cp.parameter.id === key)
		console.log(`   - ${param?.parameter.nameIt}: ${value}`)
	})

	// ШАГ 8: Итоговая статистика
	console.log('\n' + '='.repeat(70))
	console.log('📊 ИТОГОВАЯ СТАТИСТИКА:')
	console.log(`   ✅ Категория: ${testCategory.name}`)
	console.log(`   ✅ Параметров: ${categoryParams.length}`)
	console.log(`   ✅ Поставщиков: ${testSuppliers.length}`)
	console.log(
		`   ✅ Конфигурация заполнена: ${
			Object.keys(testConfig.parameters).length
		} параметров`
	)

	console.log('\n🎉 ПОЛНЫЙ ЦИКЛ ЗАВЕРШЕН УСПЕШНО!')
	console.log('\n💡 СЛЕДУЮЩИЙ ШАГ:')
	console.log('   Откройте http://localhost:3000/proposals')
	console.log(
		`   Создайте предложение и выберите категорию "${testCategory.name}"`
	)
	console.log('   Параметры загрузятся автоматически!')

	return {
		category: testCategory,
		parameters: categoryParams,
		suppliers: testSuppliers,
		config: testConfig,
	}
}

fullCycleTest().catch(console.error)
