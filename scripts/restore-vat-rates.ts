import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
	console.log('🌱 Восстановление налоговых ставок для всех организаций...\n')

	// Получаем все организации
	const organizations = await prisma.organization.findMany()

	if (organizations.length === 0) {
		console.log('⚠️  Организации не найдены. Создайте организацию сначала.')
		return
	}

	// Стандартные итальянские ставки НДС
	const standardVATRates = [
		{
			name: 'IVA 4%',
			percentage: 4.0,
			description: 'Aliquota ridotta per beni di prima necessità',
			isDefault: false,
			isActive: true,
			isSystem: false,
		},
		{
			name: 'IVA 5%',
			percentage: 5.0,
			description: 'Aliquota ridotta speciale',
			isDefault: false,
			isActive: true,
			isSystem: false,
		},
		{
			name: 'IVA 10%',
			percentage: 10.0,
			description: 'Aliquota ridotta',
			isDefault: false,
			isActive: true,
			isSystem: false,
		},
		{
			name: 'IVA 22%',
			percentage: 22.0,
			description: 'Aliquota ordinaria',
			isDefault: true,
			isActive: true,
			isSystem: false,
		},
	]

	for (const org of organizations) {
		console.log(`📋 Обработка организации: ${org.name} (${org.id})`)

		for (const vat of standardVATRates) {
			// Проверяем существование ставки по имени (может быть без организации или с другой)
			const existing = await prisma.vATRate.findFirst({
				where: {
					name: vat.name,
				},
			})

			if (existing) {
				// Если ставка существует, обновляем её для текущей организации
				if (existing.organizationId !== org.id) {
					// Если ставка принадлежит другой организации, создаем копию для текущей
					// Сначала снимаем дефолт с остальных для этой организации
					if (vat.isDefault) {
						await prisma.vATRate.updateMany({
							where: {
								organizationId: org.id,
								isDefault: true,
							},
							data: { isDefault: false },
						})
					}

					// Создаем копию с уникальным именем
					const uniqueName = `${vat.name} (${org.name})`
					await prisma.vATRate.create({
						data: {
							...vat,
							name: uniqueName,
							organizationId: org.id,
						},
					})
					console.log(`   ✓ Создана ставка: ${uniqueName} (${vat.percentage}%)`)
				} else {
					// Обновляем существующую ставку
					await prisma.vATRate.update({
						where: { id: existing.id },
						data: {
							isActive: true,
							isDefault: vat.isDefault,
							description: vat.description,
						},
					})
					console.log(`   ✓ Ставка "${vat.name}" обновлена`)
				}
			} else {
				// Если это дефолтная ставка, снимаем дефолт с остальных для этой организации
				if (vat.isDefault) {
					await prisma.vATRate.updateMany({
						where: {
							organizationId: org.id,
							isDefault: true,
						},
						data: { isDefault: false },
					})
				}

				// Создаем новую ставку
				await prisma.vATRate.create({
					data: {
						...vat,
						organizationId: org.id,
					},
				})
				console.log(`   ✓ Создана ставка: ${vat.name} (${vat.percentage}%)`)
			}
		}

		console.log(`   ✅ Организация "${org.name}" обработана\n`)
	}

	console.log('✅ Все налоговые ставки восстановлены!')
}

main()
	.catch(e => {
		console.error('❌ Ошибка:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})

