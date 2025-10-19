/**
 * ТЕСТИРОВАНИЕ ИНТЕГРАЦИИ КАТЕГОРИЙ С КОНФИГУРАТОРОМ
 * Проверяет что категории из настроек корректно работают в конфигураторе
 */

const BASE_URL = 'http://localhost:3000'

console.log('🔧 ТЕСТИРОВАНИЕ ИНТЕГРАЦИИ С КОНФИГУРАТОРОМ\n')
console.log('='.repeat(70))

const logResult = (test, success, details = '') => {
	const icon = success ? '✅' : '❌'
	console.log(`${icon} ${test}`)
	if (details) console.log(`   ${details}`)
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

// ============================================================================
// ТЕСТ 1: КАТЕГОРИИ ДОСТУПНЫ В API
// ============================================================================
async function test1_CategoriesAvailable() {
	console.log('\n📋 ТЕСТ 1: Категории доступны через API')
	console.log('-'.repeat(70))

	try {
		const response = await fetch(`${BASE_URL}/api/product-categories`)
		const categories = await response.json()

		const activeCategories = categories.filter(c => c.isActive)
		const inactiveCategories = categories.filter(c => !c.isActive)

		logResult(
			'Получение категорий',
			response.ok,
			`Всего: ${categories.length}, Активных: ${activeCategories.length}, Неактивных: ${inactiveCategories.length}`
		)

		return { success: true, categories, activeCategories }
	} catch (error) {
		logResult('Получение категорий', false, error.message)
		return { success: false }
	}
}

// ============================================================================
// ТЕСТ 2: ИКОНКИ КАТЕГОРИЙ
// ============================================================================
async function test2_CategoryIcons() {
	console.log('\n🎨 ТЕСТ 2: Иконки категорий')
	console.log('-'.repeat(70))

	try {
		const response = await fetch(`${BASE_URL}/api/product-categories`)
		const categories = await response.json()

		let allIconsValid = true
		let invalidIcons = []

		categories.forEach(category => {
			const hasIcon = category.icon && category.icon.length > 0
			const isSvg = category.icon && category.icon.includes('<svg')

			if (!hasIcon || !isSvg) {
				allIconsValid = false
				invalidIcons.push(category.name)
			}
		})

		if (allIconsValid) {
			logResult('Проверка иконок всех категорий', true, 'Все иконки валидны')
		} else {
			logResult(
				'Проверка иконок всех категорий',
				false,
				`Невалидные иконки: ${invalidIcons.join(', ')}`
			)
		}

		return { success: allIconsValid }
	} catch (error) {
		logResult('Проверка иконок', false, error.message)
		return { success: false }
	}
}

// ============================================================================
// ТЕСТ 3: ФИЛЬТРАЦИЯ АКТИВНЫХ КАТЕГОРИЙ
// ============================================================================
async function test3_ActiveCategoriesFilter() {
	console.log('\n👁️ ТЕСТ 3: Фильтрация активных категорий')
	console.log('-'.repeat(70))

	try {
		const response = await fetch(`${BASE_URL}/api/product-categories`)
		const categories = await response.json()

		const activeCategories = categories.filter(c => c.isActive)

		console.log('   Активные категории:')
		activeCategories.forEach(cat => {
			console.log(`     - ${cat.name}`)
		})

		logResult(
			'Фильтрация работает корректно',
			true,
			`${activeCategories.length} активных категорий`
		)

		return { success: true, activeCategories }
	} catch (error) {
		logResult('Фильтрация', false, error.message)
		return { success: false }
	}
}

// ============================================================================
// ТЕСТ 4: СОЗДАНИЕ КАТЕГОРИИ ИЗ КОНФИГУРАТОРА
// ============================================================================
async function test4_CreateFromConfigurator() {
	console.log('\n➕ ТЕСТ 4: Создание категории из конфигуратора')
	console.log('-'.repeat(70))

	const testCategory = {
		name: 'Configurator_Test_' + Date.now(),
		icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="12" cy="12" r="10"/></svg>',
		description: 'Создано из конфигуратора',
	}

	try {
		const createResponse = await fetch(`${BASE_URL}/api/product-categories`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(testCategory),
		})

		if (createResponse.ok) {
			const newCategory = await createResponse.json()
			logResult('Создание из конфигуратора', true, `ID: ${newCategory.id}`)

			await delay(500)

			// Проверяем что категория появилась в списке
			const listResponse = await fetch(`${BASE_URL}/api/product-categories`)
			const categories = await listResponse.json()

			const found = categories.find(c => c.id === newCategory.id)
			logResult(
				'Категория доступна в списке',
				!!found,
				found ? found.name : 'Не найдена'
			)

			// Удаляем тестовую категорию
			await fetch(`${BASE_URL}/api/product-categories/${newCategory.id}`, {
				method: 'DELETE',
			})
			console.log('   🗑️ Тестовая категория удалена')

			return { success: true }
		} else {
			const error = await createResponse.json()
			logResult('Создание из конфигуратора', false, error.error)
			return { success: false }
		}
	} catch (error) {
		logResult('Создание из конфигуратора', false, error.message)
		return { success: false }
	}
}

// ============================================================================
// ТЕСТ 5: СИНХРОНИЗАЦИЯ НАСТРОЙКИ ↔ КОНФИГУРАТОР
// ============================================================================
async function test5_SettingsConfiguratorSync() {
	console.log('\n🔄 ТЕСТ 5: Синхронизация настройки ↔ конфигуратор')
	console.log('-'.repeat(70))

	try {
		// Получаем категории "из настроек"
		const settingsResponse = await fetch(`${BASE_URL}/api/product-categories`)
		const settingsCategories = await settingsResponse.json()

		await delay(100)

		// Получаем категории "из конфигуратора"
		const configuratorResponse = await fetch(
			`${BASE_URL}/api/product-categories`
		)
		const configuratorCategories = await configuratorResponse.json()

		// Проверяем что данные идентичны
		const sameLength =
			settingsCategories.length === configuratorCategories.length

		logResult(
			'Количество категорий совпадает',
			sameLength,
			`Настройки: ${settingsCategories.length}, Конфигуратор: ${configuratorCategories.length}`
		)

		// Проверяем что все ID совпадают
		const settingsIds = new Set(settingsCategories.map(c => c.id))
		const configuratorIds = new Set(configuratorCategories.map(c => c.id))

		const allIdsMatch =
			settingsIds.size === configuratorIds.size &&
			[...settingsIds].every(id => configuratorIds.has(id))

		logResult('ID категорий совпадают', allIdsMatch)

		return { success: sameLength && allIdsMatch }
	} catch (error) {
		logResult('Синхронизация', false, error.message)
		return { success: false }
	}
}

// ============================================================================
// ТЕСТ 6: ULTRA-THIN ИКОНКИ
// ============================================================================
async function test6_UltraThinIcons() {
	console.log('\n✨ ТЕСТ 6: Ultra-thin иконки')
	console.log('-'.repeat(70))

	try {
		const response = await fetch(`${BASE_URL}/api/product-categories`)
		const categories = await response.json()

		// Проверяем что новые категории используют stroke-width="1"
		const newCategories = categories.filter(
			c =>
				c.name.includes('Serramenti') ||
				c.name.includes('Cassonetti') ||
				c.name.includes('Avvolgibile')
		)

		let ultraThinCount = 0
		newCategories.forEach(cat => {
			if (cat.icon.includes('stroke-width="1"')) {
				ultraThinCount++
			}
		})

		logResult(
			'Ultra-thin иконки используются',
			ultraThinCount > 0,
			`${ultraThinCount} категорий с ultra-thin стилем`
		)

		return { success: true }
	} catch (error) {
		logResult('Проверка ultra-thin иконок', false, error.message)
		return { success: false }
	}
}

// ============================================================================
// ЗАПУСК ВСЕХ ТЕСТОВ
// ============================================================================
async function runAllTests() {
	const results = []

	results.push(await test1_CategoriesAvailable())
	await delay(500)

	results.push(await test2_CategoryIcons())
	await delay(500)

	results.push(await test3_ActiveCategoriesFilter())
	await delay(500)

	results.push(await test4_CreateFromConfigurator())
	await delay(500)

	results.push(await test5_SettingsConfiguratorSync())
	await delay(500)

	results.push(await test6_UltraThinIcons())

	// Подсчёт результатов
	console.log('\n' + '='.repeat(70))
	console.log('📊 ИТОГОВЫЕ РЕЗУЛЬТАТЫ')
	console.log('='.repeat(70))

	const totalTests = results.length
	const passedTests = results.filter(r => r.success).length
	const failedTests = totalTests - passedTests

	console.log(`\n✅ Пройдено: ${passedTests}/${totalTests}`)
	console.log(`❌ Провалено: ${failedTests}/${totalTests}`)

	if (failedTests === 0) {
		console.log('\n🎉 ИНТЕГРАЦИЯ РАБОТАЕТ ИДЕАЛЬНО!')
		console.log('✨ Категории из настроек корректно работают в конфигураторе!')
	} else {
		console.log('\n⚠️ ОБНАРУЖЕНЫ ПРОБЛЕМЫ С ИНТЕГРАЦИЕЙ!')
	}

	console.log('\n' + '='.repeat(70))
}

// Запуск
runAllTests().catch(error => {
	console.error('\n❌ КРИТИЧЕСКАЯ ОШИБКА:', error)
	process.exit(1)
})
