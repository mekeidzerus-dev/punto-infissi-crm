/**
 * Скрипт для исправления значений параметра "Tipo di Dimensioni"
 * Заполняет пустые поля value из valueIt
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixParameterValues() {
	try {
		console.log('🔍 Ищем параметр "Tipo di Dimensioni"...')

		const parameter = await prisma.parameterTemplate.findFirst({
			where: {
				OR: [
					{ name: { contains: 'Tipo di Dimensioni', mode: 'insensitive' } },
					{ nameIt: { contains: 'Tipo di Dimensioni', mode: 'insensitive' } },
					{ name: { contains: 'dimensioni', mode: 'insensitive' } },
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

		console.log(`✅ Найден параметр: ${parameter.name} (ID: ${parameter.id})\n`)

		let fixedCount = 0

		for (const val of parameter.values) {
			// Если value пустое, но есть valueIt - копируем из valueIt
			if (
				(!val.value || val.value.trim() === '') &&
				val.valueIt &&
				val.valueIt.trim() !== ''
			) {
				await prisma.parameterValue.update({
					where: { id: val.id },
					data: { value: val.valueIt.trim() },
				})
				console.log(
					`✅ Исправлено: ID ${val.id} - value: "${val.valueIt}" → "${val.valueIt}"`
				)
				fixedCount++
			} else if (!val.value || val.value.trim() === '') {
				console.log(`⚠️  Значение ID ${val.id} имеет пустой value и valueIt`)
			}
		}

		console.log(`\n✅ Исправлено значений: ${fixedCount}`)
		console.log('💡 Теперь все значения должны иметь заполненное поле value')
	} catch (error) {
		console.error('❌ Ошибка:', error)
	} finally {
		await prisma.$disconnect()
	}
}

fixParameterValues()
