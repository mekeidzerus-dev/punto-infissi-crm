import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
	console.log('🌱 Добавление стандартных налоговых ставок...')

	// Стандартные итальянские ставки НДС
	const standardVATRates = [
		{
			name: 'IVA 4%',
			percentage: 4.0,
			description: 'Aliquota ridotta per beni di prima necessità',
			isDefault: false,
			isActive: true,
			isSystem: true,
		},
		{
			name: 'IVA 5%',
			percentage: 5.0,
			description: 'Aliquota ridotta speciale',
			isDefault: false,
			isActive: true,
			isSystem: true,
		},
		{
			name: 'IVA 10%',
			percentage: 10.0,
			description: 'Aliquota ridotta',
			isDefault: false,
			isActive: true,
			isSystem: true,
		},
		{
			name: 'IVA 22%',
			percentage: 22.0,
			description: 'Aliquota ordinaria',
			isDefault: true,
			isActive: true,
			isSystem: true,
		},
	]

	for (const vat of standardVATRates) {
		const existing = await prisma.vATRate.findFirst({
			where: { name: vat.name, organizationId: null },
		})

		if (existing) {
			console.log(`✅ Ставка "${vat.name}" уже существует`)
			// Обновляем флаг isSystem если ставка уже есть
			await prisma.vATRate.update({
				where: { id: existing.id },
				data: {
					isSystem: true,
					description: vat.description,
					isDefault: vat.isDefault,
				},
			})
			console.log(`   ✅ Установлен флаг isSystem=true`)
		} else {
			// Если это дефолтная ставка, снимаем дефолт с остальных
			if (vat.isDefault) {
				await prisma.vATRate.updateMany({
					where: { isDefault: true },
					data: { isDefault: false },
				})
			}

			const created = await prisma.vATRate.create({
				data: vat as any,
			})
			console.log(`✅ Создана системная ставка: ${created.name} (${created.percentage}%)`)
		}
	}

	console.log('\n✅ Стандартные налоговые ставки добавлены!')
}

main()
	.catch(e => {
		console.error('❌ Ошибка:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})

