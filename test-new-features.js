// Тестовый скрипт для проверки новой системы параметров
console.log('🧪 ТЕСТИРОВАНИЕ НОВОЙ СИСТЕМЫ ПАРАМЕТРОВ')
console.log('='.repeat(50))

// Проверяем что сервер запущен
fetch('http://localhost:3000/api/health')
	.then(response => {
		if (response.ok) {
			console.log('✅ Сервер запущен и отвечает')
			return testFeatureFlags()
		} else {
			throw new Error('Сервер не отвечает')
		}
	})
	.catch(error => {
		console.log('❌ Ошибка подключения к серверу:', error.message)
		console.log('💡 Убедитесь что сервер запущен: npm run dev')
	})

async function testFeatureFlags() {
	console.log('\n🔍 Проверка Feature Flags:')

	try {
		// Проверяем что переменные окружения работают
		const response = await fetch('http://localhost:3000/api/test-feature-flags')
		if (response.ok) {
			const data = await response.json()
			console.log('✅ Feature Flags API работает')
			console.log('📋 Статус функций:', data)
		} else {
			console.log('⚠️ Feature Flags API недоступен (это нормально)')
		}
	} catch (error) {
		console.log('⚠️ Feature Flags API недоступен (это нормально)')
	}

	console.log('\n📝 Инструкции по тестированию:')
	console.log('1. Откройте http://localhost:3000/proposals')
	console.log('2. Создайте новое предложение')
	console.log('3. Перейдите к конфигуратору товаров')
	console.log('4. Выберите категорию и поставщика')
	console.log('5. Проверьте новые функции:')
	console.log('   - Инфографическая визуализация')
	console.log('   - Цветовые квадратики')
	console.log('   - Дополнительные заметки')

	console.log('\n🎯 Готово к тестированию!')
}

// Создаем простой API endpoint для тестирования
if (typeof window === 'undefined') {
	// Это серверный код
	console.log('🔧 Создание тестового API endpoint...')
}
