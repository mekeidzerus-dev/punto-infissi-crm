/**
 * Скрипт для проверки дубликатов значений в параметре "Tipo di Dimensioni"
 * Запуск: node scripts/check-duplicate-values.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkDuplicateValues() {
	try {
		console.log('🔍 Ищем параметр "Tipo di Dimensioni"...')

		// Ищем параметр по имени (на русском или итальянском)
		const parameter = await prisma.parameterTemplate.findFirst({
			where: {
				OR: [
					{ name: { contains: 'Tipo di Dimensioni', mode: 'insensitive' } },
					{ name: { contains: 'dimensioni', mode: 'insensitive' } },
					{ nameIt: { contains: 'Tipo di Dimensioni', mode: 'insensitive' } },
					{ nameIt: { contains: 'dimensioni', mode: 'insensitive' } },
				],
			},
			include: {
				values: {
					where: { isActive: true },
					orderBy: { order: 'asc' },
				},
			},
		})

		if (!parameter) {
			console.log('❌ Параметр не найден')
			return
		}

		console.log(`✅ Найден параметр: ${parameter.name} (ID: ${parameter.id})`)
		console.log(`📊 Количество значений: ${parameter.values.length}\n`)

		// Проверяем дубликаты по значению
		const valueMap = new Map()

		parameter.values.forEach((val, index) => {
			const key = val.value.trim().toLowerCase()
			if (!valueMap.has(key)) {
				valueMap.set(key, [])
			}
			valueMap.get(key).push({
				id: val.id,
				value: val.value,
				valueIt: val.valueIt,
				index,
			})
		})

		// Выводим результаты
		console.log('📋 Все значения параметра:')
		parameter.values.forEach((val, index) => {
			console.log(
				`  ${index + 1}. ID: ${val.id} | value: "${val.value}" | valueIt: "${
					val.valueIt || 'нет'
				}" | order: ${val.order}`
			)
		})

		console.log('\n🔍 Проверка дубликатов:')
		let hasDuplicates = false

		valueMap.forEach((duplicates, key) => {
			if (duplicates.length > 1) {
				hasDuplicates = true
				console.log(`\n⚠️  Найдены дубликаты для "${key}":`)
				duplicates.forEach(dup => {
					console.log(
						`   - ID: ${dup.id}, value: "${dup.value}", index: ${dup.index}`
					)
				})
			}
		})

		if (!hasDuplicates) {
			console.log('✅ Дубликатов не найдено')
		}

		// Проверяем конкретные значения из задачи
		console.log('\n🎯 Проверка конкретных значений:')
		const targetValues = [
			'luce passaggio',
			'esterno telaio',
			'luce architettonica',
		]

		targetValues.forEach(targetVal => {
			const found = parameter.values.filter(
				v =>
					v.value.toLowerCase().trim() === targetVal.toLowerCase() ||
					(v.valueIt &&
						v.valueIt.toLowerCase().trim() === targetVal.toLowerCase())
			)

			if (found.length === 0) {
				console.log(`   ❌ "${targetVal}" - не найдено`)
			} else if (found.length === 1) {
				console.log(
					`   ✅ "${targetVal}" - найдено 1 значение (ID: ${found[0].id}, value: "${found[0].value}")`
				)
			} else {
				console.log(
					`   ⚠️  "${targetVal}" - найдено ${found.length} значений (ДУБЛИКАТЫ!):`
				)
				found.forEach(v => {
					console.log(
						`      - ID: ${v.id}, value: "${v.value}", valueIt: "${
							v.valueIt || 'нет'
						}"`
					)
				})
			}
		})

		console.log('\n💡 Рекомендации:')
		if (hasDuplicates) {
			console.log('   - Обнаружены дубликаты значений')
			console.log(
				'   - Рекомендуется удалить дубликаты или переименовать значения'
			)
			console.log('   - Или пересоздать параметр с уникальными значениями')
		} else {
			console.log('   - Дубликатов не обнаружено')
			console.log('   - Проблема может быть в логике выделения в компоненте')
		}
	} catch (error) {
		console.error('❌ Ошибка:', error)
	} finally {
		await prisma.$disconnect()
	}
}

checkDuplicateValues()
