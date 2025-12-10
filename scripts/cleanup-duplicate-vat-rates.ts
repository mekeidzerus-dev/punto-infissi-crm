import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
	console.log('🧹 Очистка дублирующихся налоговых ставок...\n')

	// Получаем все организации
	const organizations = await prisma.organization.findMany()

	for (const org of organizations) {
		console.log(`📋 Обработка организации: ${org.name} (${org.id})`)

		// Получаем все ставки организации
		const rates = await prisma.vATRate.findMany({
			where: {
				organizationId: org.id,
			},
			orderBy: { createdAt: 'asc' },
		})

		// Группируем по проценту
		const ratesByPercentage = new Map<number, typeof rates>()
		for (const rate of rates) {
			const percentage = Number(rate.percentage)
			if (!ratesByPercentage.has(percentage)) {
				ratesByPercentage.set(percentage, [])
			}
			ratesByPercentage.get(percentage)!.push(rate)
		}

		// Для каждой группы процентов оставляем только первую ставку, остальные удаляем
		let deletedCount = 0
		for (const [percentage, rateGroup] of ratesByPercentage.entries()) {
			if (rateGroup.length > 1) {
				// Сортируем по дате создания, оставляем самую старую
				rateGroup.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
				const keepRate = rateGroup[0]
				const toDelete = rateGroup.slice(1)

				console.log(`   ⚠️  Найдено ${rateGroup.length} ставок с процентом ${percentage}%`)
				console.log(`   ✓ Оставляем: "${keepRate.name}" (${keepRate.id})`)

				for (const rate of toDelete) {
					// Проверяем, используется ли ставка в предложениях
					const usedInProposals = await prisma.proposalPosition.findFirst({
						where: {
							vatRate: Number(rate.percentage),
						},
					})

					if (usedInProposals) {
						console.log(`   ⚠️  Ставка "${rate.name}" используется в предложениях, пропускаем`)
						continue
					}

					await prisma.vATRate.delete({
						where: { id: rate.id },
					})
					console.log(`   ✗ Удалена: "${rate.name}" (${rate.id})`)
					deletedCount++
				}
			}
		}

		if (deletedCount > 0) {
			console.log(`   ✅ Удалено ${deletedCount} дубликатов\n`)
		} else {
			console.log(`   ✅ Дубликатов не найдено\n`)
		}
	}

	console.log('✅ Очистка завершена!')
}

main()
	.catch(e => {
		console.error('❌ Ошибка:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})

