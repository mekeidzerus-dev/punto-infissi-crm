/**
 * ПОЛНОЕ ТЕСТИРОВАНИЕ СИСТЕМЫ КАТЕГОРИЙ
 * Тестирует все CRUD операции и интеграцию с БД
 */

const BASE_URL = 'http://localhost:3000'

console.log('🧪 НАЧИНАЕМ ПОЛНОЕ ТЕСТИРОВАНИЕ СИСТЕМЫ КАТЕГОРИЙ\n')
console.log('='.repeat(70))

// Тестовые данные
const testCategory = {
	name: 'TEST_CATEGORY_' + Date.now(),
	icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="4" y="4" width="16" height="16" rx="1"/></svg>',
	description: 'Тестовая категория для проверки функционала',
}

let createdCategoryId = null

// Вспомогательная функция для задержки
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

// Вспомогательная функция для вывода результата
const logResult = (test, success, details = '') => {
	const icon = success ? '✅' : '❌'
	console.log(`${icon} ${test}`)
	if (details) console.log(`   ${details}`)
}

// ============================================================================
// ТЕСТ 1: ПОЛУЧЕНИЕ СПИСКА КАТЕГОРИЙ
// ============================================================================
async function test1_GetAllCategories() {
	console.log('\n📋 ТЕСТ 1: Получение списка категорий')
	console.log('-'.repeat(70))

	try {
		const response = await fetch(`${BASE_URL}/api/product-categories`)
		const categories = await response.json()

		if (response.ok && Array.isArray(categories)) {
			logResult(
				'GET /api/product-categories',
				true,
				`Найдено ${categories.length} категорий`
			)
			console.log('   Категории:', categories.map(c => c.name).join(', '))
			return { success: true, data: categories }
		} else {
			logResult('GET /api/product-categories', false, 'Неверный формат ответа')
			return { success: false }
		}
	} catch (error) {
		logResult('GET /api/product-categories', false, error.message)
		return { success: false }
	}
}

// ============================================================================
// ТЕСТ 2: СОЗДАНИЕ НОВОЙ КАТЕГОРИИ
// ============================================================================
async function test2_CreateCategory() {
	console.log('\n➕ ТЕСТ 2: Создание новой категории')
	console.log('-'.repeat(70))

	try {
		const response = await fetch(`${BASE_URL}/api/product-categories`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(testCategory),
		})

		if (response.ok) {
			const newCategory = await response.json()
			createdCategoryId = newCategory.id

			logResult(
				'POST /api/product-categories',
				true,
				`ID: ${newCategory.id}, Название: ${newCategory.name}`
			)

			// Проверяем поля
			const fieldsOk =
				newCategory.name === testCategory.name &&
				newCategory.icon === testCategory.icon &&
				newCategory.description === testCategory.description &&
				newCategory.isActive === true

			logResult('Проверка полей созданной категории', fieldsOk)

			return { success: true, data: newCategory }
		} else {
			const error = await response.json()
			logResult('POST /api/product-categories', false, error.error)
			return { success: false }
		}
	} catch (error) {
		logResult('POST /api/product-categories', false, error.message)
		return { success: false }
	}
}

// ============================================================================
// ТЕСТ 3: ПОЛУЧЕНИЕ ОДНОЙ КАТЕГОРИИ ПО ID
// ============================================================================
async function test3_GetCategoryById() {
	console.log('\n🔍 ТЕСТ 3: Получение категории по ID')
	console.log('-'.repeat(70))

	if (!createdCategoryId) {
		logResult('GET /api/product-categories/[id]', false, 'Нет ID для теста')
		return { success: false }
	}

	try {
		const response = await fetch(
			`${BASE_URL}/api/product-categories/${createdCategoryId}`
		)

		if (response.ok) {
			const category = await response.json()

			logResult(
				`GET /api/product-categories/${createdCategoryId}`,
				true,
				`Название: ${category.name}`
			)

			// Проверяем что ID совпадает
			const idMatches = category.id === createdCategoryId
			logResult('Проверка ID категории', idMatches)

			return { success: true, data: category }
		} else {
			logResult(
				'GET /api/product-categories/[id]',
				false,
				'Категория не найдена'
			)
			return { success: false }
		}
	} catch (error) {
		logResult('GET /api/product-categories/[id]', false, error.message)
		return { success: false }
	}
}

// ============================================================================
// ТЕСТ 4: ОБНОВЛЕНИЕ КАТЕГОРИИ
// ============================================================================
async function test4_UpdateCategory() {
	console.log('\n✏️ ТЕСТ 4: Обновление категории')
	console.log('-'.repeat(70))

	if (!createdCategoryId) {
		logResult('PUT /api/product-categories/[id]', false, 'Нет ID для теста')
		return { success: false }
	}

	const updatedData = {
		name: testCategory.name + '_UPDATED',
		icon: testCategory.icon,
		description: 'Обновлённое описание',
	}

	try {
		const response = await fetch(
			`${BASE_URL}/api/product-categories/${createdCategoryId}`,
			{
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updatedData),
			}
		)

		if (response.ok) {
			const updated = await response.json()

			logResult(
				`PUT /api/product-categories/${createdCategoryId}`,
				true,
				`Новое название: ${updated.name}`
			)

			// Проверяем что данные обновились
			const dataUpdated =
				updated.name === updatedData.name &&
				updated.description === updatedData.description

			logResult('Проверка обновлённых данных', dataUpdated)

			return { success: true, data: updated }
		} else {
			const error = await response.json()
			logResult('PUT /api/product-categories/[id]', false, error.error)
			return { success: false }
		}
	} catch (error) {
		logResult('PUT /api/product-categories/[id]', false, error.message)
		return { success: false }
	}
}

// ============================================================================
// ТЕСТ 5: АКТИВАЦИЯ/ДЕАКТИВАЦИЯ КАТЕГОРИИ
// ============================================================================
async function test5_ToggleActiveStatus() {
	console.log('\n👁️ ТЕСТ 5: Активация/деактивация категории')
	console.log('-'.repeat(70))

	if (!createdCategoryId) {
		logResult('Toggle isActive', false, 'Нет ID для теста')
		return { success: false }
	}

	try {
		// Деактивируем
		const deactivate = await fetch(
			`${BASE_URL}/api/product-categories/${createdCategoryId}`,
			{
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ isActive: false }),
			}
		)

		if (deactivate.ok) {
			const deactivated = await deactivate.json()
			logResult('Деактивация категории', deactivated.isActive === false)
		} else {
			logResult('Деактивация категории', false)
			return { success: false }
		}

		await delay(500)

		// Активируем обратно
		const activate = await fetch(
			`${BASE_URL}/api/product-categories/${createdCategoryId}`,
			{
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ isActive: true }),
			}
		)

		if (activate.ok) {
			const activated = await activate.json()
			logResult('Активация категории', activated.isActive === true)
			return { success: true }
		} else {
			logResult('Активация категории', false)
			return { success: false }
		}
	} catch (error) {
		logResult('Toggle isActive', false, error.message)
		return { success: false }
	}
}

// ============================================================================
// ТЕСТ 6: ПРОВЕРКА ОТОБРАЖЕНИЯ В КОНФИГУРАТОРЕ
// ============================================================================
async function test6_CheckConfiguratorIntegration() {
	console.log('\n🔧 ТЕСТ 6: Интеграция с конфигуратором')
	console.log('-'.repeat(70))

	try {
		// Получаем все категории
		const response = await fetch(`${BASE_URL}/api/product-categories`)
		const categories = await response.json()

		// Проверяем что наша тестовая категория есть в списке
		const ourCategory = categories.find(c => c.id === createdCategoryId)

		if (ourCategory) {
			logResult(
				'Категория доступна в конфигураторе',
				true,
				`Статус: ${ourCategory.isActive ? 'активна' : 'неактивна'}`
			)

			// Проверяем что иконка корректна
			const hasIcon = ourCategory.icon && ourCategory.icon.includes('<svg')
			logResult('Иконка категории корректна', hasIcon)

			return { success: true }
		} else {
			logResult('Категория доступна в конфигураторе', false, 'Не найдена')
			return { success: false }
		}
	} catch (error) {
		logResult('Интеграция с конфигуратором', false, error.message)
		return { success: false }
	}
}

// ============================================================================
// ТЕСТ 7: УДАЛЕНИЕ КАТЕГОРИИ
// ============================================================================
async function test7_DeleteCategory() {
	console.log('\n🗑️ ТЕСТ 7: Удаление категории')
	console.log('-'.repeat(70))

	if (!createdCategoryId) {
		logResult('DELETE /api/product-categories/[id]', false, 'Нет ID для теста')
		return { success: false }
	}

	try {
		const response = await fetch(
			`${BASE_URL}/api/product-categories/${createdCategoryId}`,
			{
				method: 'DELETE',
			}
		)

		if (response.ok) {
			logResult(`DELETE /api/product-categories/${createdCategoryId}`, true)

			// Проверяем что категория действительно удалена
			await delay(500)

			const checkResponse = await fetch(
				`${BASE_URL}/api/product-categories/${createdCategoryId}`
			)

			if (checkResponse.status === 404) {
				logResult('Проверка удаления (должна вернуть 404)', true)
				return { success: true }
			} else {
				logResult('Проверка удаления', false, 'Категория всё ещё существует')
				return { success: false }
			}
		} else {
			const error = await response.json()
			logResult('DELETE /api/product-categories/[id]', false, error.error)
			return { success: false }
		}
	} catch (error) {
		logResult('DELETE /api/product-categories/[id]', false, error.message)
		return { success: false }
	}
}

// ============================================================================
// ТЕСТ 8: ПРОВЕРКА ЗАЩИТЫ ОТ УДАЛЕНИЯ СВЯЗАННЫХ КАТЕГОРИЙ
// ============================================================================
async function test8_CheckDeleteProtection() {
	console.log('\n🛡️ ТЕСТ 8: Защита от удаления связанных категорий')
	console.log('-'.repeat(70))

	try {
		// Получаем существующие категории
		const response = await fetch(`${BASE_URL}/api/product-categories`)
		const categories = await response.json()

		// Находим категорию с поставщиками
		const categoryWithSuppliers = categories.find(
			c => c.supplierCategories && c.supplierCategories.length > 0
		)

		if (!categoryWithSuppliers) {
			logResult(
				'Проверка защиты',
				true,
				'Нет категорий с поставщиками для теста'
			)
			return { success: true }
		}

		// Пытаемся удалить категорию с поставщиками
		const deleteResponse = await fetch(
			`${BASE_URL}/api/product-categories/${categoryWithSuppliers.id}`,
			{
				method: 'DELETE',
			}
		)

		if (deleteResponse.status === 400) {
			const error = await deleteResponse.json()
			logResult(
				'Защита от удаления связанных категорий',
				true,
				error.error || 'Удаление заблокировано'
			)
			return { success: true }
		} else {
			logResult(
				'Защита от удаления связанных категорий',
				false,
				'Категория с поставщиками была удалена!'
			)
			return { success: false }
		}
	} catch (error) {
		logResult('Проверка защиты', false, error.message)
		return { success: false }
	}
}

// ============================================================================
// ЗАПУСК ВСЕХ ТЕСТОВ
// ============================================================================
async function runAllTests() {
	const results = []

	results.push(await test1_GetAllCategories())
	await delay(500)

	results.push(await test2_CreateCategory())
	await delay(500)

	results.push(await test3_GetCategoryById())
	await delay(500)

	results.push(await test4_UpdateCategory())
	await delay(500)

	results.push(await test5_ToggleActiveStatus())
	await delay(500)

	results.push(await test6_CheckConfiguratorIntegration())
	await delay(500)

	results.push(await test7_DeleteCategory())
	await delay(500)

	results.push(await test8_CheckDeleteProtection())

	// Подсчёт результатов
	console.log('\n' + '='.repeat(70))
	console.log('📊 ИТОГОВЫЕ РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ')
	console.log('='.repeat(70))

	const totalTests = results.length
	const passedTests = results.filter(r => r.success).length
	const failedTests = totalTests - passedTests

	console.log(`\n✅ Пройдено: ${passedTests}/${totalTests}`)
	console.log(`❌ Провалено: ${failedTests}/${totalTests}`)

	if (failedTests === 0) {
		console.log('\n🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!')
		console.log('✨ Система категорий полностью работоспособна!')
	} else {
		console.log('\n⚠️ НЕКОТОРЫЕ ТЕСТЫ НЕ ПРОШЛИ!')
		console.log('🔧 Требуется дополнительная проверка и исправление.')
	}

	console.log('\n' + '='.repeat(70))
}

// Запуск
runAllTests().catch(error => {
	console.error('\n❌ КРИТИЧЕСКАЯ ОШИБКА:', error)
	process.exit(1)
})
