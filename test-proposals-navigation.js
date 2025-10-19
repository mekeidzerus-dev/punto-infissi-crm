/**
 * ТЕСТИРОВАНИЕ НАВИГАЦИИ В РАЗДЕЛЕ ПРЕДЛОЖЕНИЯ
 * Проверяет что вкладка "Категории" удалена
 */

const BASE_URL = 'http://localhost:3000'

console.log('🧪 ТЕСТИРОВАНИЕ НАВИГАЦИИ PROPOSALS\n')
console.log('='.repeat(70))

const logResult = (test, success, details = '') => {
	const icon = success ? '✅' : '❌'
	console.log(`${icon} ${test}`)
	if (details) console.log(`   ${details}`)
}

async function testProposalsNavigation() {
	console.log('\n📋 ТЕСТ: Проверка навигации в разделе Предложения')
	console.log('-'.repeat(70))

	try {
		// Получаем HTML страницы
		const response = await fetch(`${BASE_URL}/proposals`)
		const html = await response.text()

		// Проверяем что страница загружается
		logResult('Страница /proposals загружается', response.ok)

		// Проверяем что нет вкладки "Категории"
		const hasCategories =
			html.includes('Categorie') || html.includes('/categories')
		logResult(
			'Вкладка "Категории" удалена',
			!hasCategories,
			hasCategories ? 'НАЙДЕНА! Нужно удалить' : 'Успешно удалена'
		)

		// Проверяем что есть вкладки "Предложения" и "Заказы"
		const hasProposals =
			html.includes('Предложения') || html.includes('Proposte')
		const hasOrders = html.includes('Заказы') || html.includes('Ordini')

		logResult('Вкладка "Предложения" присутствует', hasProposals)
		logResult('Вкладка "Заказы" присутствует', hasOrders)

		console.log('\n' + '='.repeat(70))
		console.log('📊 ИТОГОВЫЙ РЕЗУЛЬТАТ')
		console.log('='.repeat(70))

		if (!hasCategories && hasProposals && hasOrders) {
			console.log('\n🎉 ВСЁ ОТЛИЧНО!')
			console.log('✨ Навигация корректна:')
			console.log('   ✅ Категории удалены из Proposals')
			console.log('   ✅ Остались только Предложения и Заказы')
			console.log('   ✅ Категории теперь только в Настройках')
		} else {
			console.log('\n⚠️ ПРОБЛЕМЫ С НАВИГАЦИЕЙ!')
			if (hasCategories) {
				console.log('   ❌ Категории всё ещё видны в Proposals')
			}
			if (!hasProposals) {
				console.log('   ❌ Вкладка Предложения не найдена')
			}
			if (!hasOrders) {
				console.log('   ❌ Вкладка Заказы не найдена')
			}
		}

		console.log('\n' + '='.repeat(70))
	} catch (error) {
		console.error('\n❌ ОШИБКА:', error.message)
	}
}

// Запуск
testProposalsNavigation()
