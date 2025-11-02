/**
 * Скрипт для создания обязательного параметра "Модель" / "Modello"
 * Параметр создается как глобальный, обязательный для всех категорий
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createModelParameter() {
	try {
		console.log('🔍 Проверяю существование параметра "Модель"...')

		// Проверяем существование параметра
		const existingParameter = await prisma.parameterTemplate.findFirst({
			where: {
				OR: [{ name: 'Модель' }, { nameIt: 'Modello' }],
			},
		})

		if (existingParameter) {
			console.log(
				`✅ Параметр "Модель" уже существует (ID: ${existingParameter.id})`
			)
			console.log(`   - Название (RU): ${existingParameter.name || 'нет'}`)
			console.log(`   - Название (IT): ${existingParameter.nameIt || 'нет'}`)
			console.log(`   - Тип: ${existingParameter.type}`)
			console.log(`   - Глобальный: ${existingParameter.isGlobal}`)
			return
		}

		console.log('📝 Создаю параметр "Модель"...')

		// Создаем параметр
		const newParameter = await prisma.parameterTemplate.create({
			data: {
				name: 'Модель',
				nameIt: 'Modello',
				type: 'TEXT',
				isGlobal: true, // Глобальный параметр (отображается во всех категориях)
				isActive: true,
				description:
					'Обязательный параметр для указания модели товара (Parametro obbligatorio per specificare il modello del prodotto)',
			},
		})

		console.log(`✅ Параметр "Модель" успешно создан!`)
		console.log(`   - ID: ${newParameter.id}`)
		console.log(`   - Название (RU): ${newParameter.name}`)
		console.log(`   - Название (IT): ${newParameter.nameIt}`)
		console.log(`   - Тип: ${newParameter.type}`)
		console.log(`   - Глобальный: ${newParameter.isGlobal}`)
		console.log(
			'💡 Параметр является обязательным и должен заполняться при создании товара'
		)
	} catch (error) {
		console.error('❌ Ошибка при создании параметра "Модель":', error)
		process.exit(1)
	} finally {
		await prisma.$disconnect()
	}
}

createModelParameter()
