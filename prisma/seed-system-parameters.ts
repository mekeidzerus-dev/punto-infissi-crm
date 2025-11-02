import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
	console.log('🌱 Добавление системных параметров размеров...')

	// Системные параметры: Ширина и Высота
	const systemParameters = [
		{
			name: 'Ширина',
			nameIt: 'Larghezza',
			type: 'NUMBER',
			unit: 'мм',
			description: 'Ширина изделия',
			isSystem: true,
			isGlobal: true,
			isActive: true,
		},
		{
			name: 'Высота',
			nameIt: 'Altezza',
			type: 'NUMBER',
			unit: 'мм',
			description: 'Высота изделия',
			isSystem: true,
			isGlobal: true,
			isActive: true,
		},
	]

	for (const param of systemParameters) {
		const existing = await prisma.parameterTemplate.findUnique({
			where: { name: param.name },
		})

		if (existing) {
			console.log(`✅ Параметр "${param.name}" уже существует`)
			// Обновляем флаг isSystem если параметр уже есть
			await prisma.parameterTemplate.update({
				where: { id: existing.id },
				data: { isSystem: true },
			})
			console.log(`   ✅ Установлен флаг isSystem=true`)
		} else {
			const created = await prisma.parameterTemplate.create({
				data: param as any,
			})
			console.log(`✅ Создан системный параметр: ${created.name} / ${created.nameIt}`)
		}
	}

	console.log('\n✅ Системные параметры размеров добавлены!')
}

main()
	.catch(e => {
		console.error('❌ Ошибка:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})

