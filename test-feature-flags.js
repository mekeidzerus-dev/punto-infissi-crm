// Тестовый скрипт для проверки Feature Flags
import { FEATURE_FLAGS, isFeatureEnabled } from './src/lib/feature-flags'

console.log('🧪 ТЕСТИРОВАНИЕ FEATURE FLAGS')
console.log('='.repeat(50))

console.log('\n📋 Текущее состояние функций:')
Object.entries(FEATURE_FLAGS).forEach(([key, value]) => {
  const status = value ? '✅ ВКЛЮЧЕНА' : '❌ ОТКЛЮЧЕНА'
  console.log(`  ${key}: ${status}`)
})

console.log('\n🔍 Проверка отдельных функций:')
const features = ['ADVANCED_PARAMETERS', 'USER_SUGGESTIONS', 'PRODUCT_VISUALIZATION', 'COLOR_SQUARES', 'CUSTOM_NOTES'] as const

features.forEach(feature => {
  const enabled = isFeatureEnabled(feature)
  console.log(`  ${feature}: ${enabled ? '✅' : '❌'}`)
})

console.log('\n📝 Инструкции по включению:')
console.log('1. Создайте файл .env.local в корне проекта')
console.log('2. Добавьте переменные:')
console.log('   NEXT_PUBLIC_PRODUCT_VISUALIZATION=true')
console.log('   NEXT_PUBLIC_COLOR_SQUARES=true')
console.log('   NEXT_PUBLIC_CUSTOM_NOTES=true')
console.log('3. Перезапустите сервер: npm run dev')

console.log('\n🎯 Готово к тестированию!')
