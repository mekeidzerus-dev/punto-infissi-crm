import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
	console.log('🧪 Тестирование создания предложений...\n')

	try {
		// Получаем первую организацию
		const organization = await prisma.organization.findFirst()
		if (!organization) {
			console.error('❌ Организация не найдена')
			return
		}
		console.log(`📋 Организация: ${organization.name} (${organization.id})\n`)

		// Получаем первого клиента
		const client = await prisma.client.findFirst({
			where: { organizationId: organization.id },
		})
		if (!client) {
			console.error('❌ Клиент не найден')
			return
		}
		console.log(`👤 Клиент: ${client.firstName || client.companyName} (ID: ${client.id})\n`)

		// Получаем статусы документов
		const documentType = await prisma.documentType.findUnique({
			where: { name: 'proposal' },
		})
		const documentStatusType = documentType
			? await prisma.documentStatusType.findFirst({
					where: {
						documentTypeId: documentType.id,
						isDefault: true,
					},
					include: { status: true },
			  })
			: null
		const statusId = documentStatusType?.statusId || null
		console.log(`📄 Статус: ${documentStatusType?.status.name || 'не найден'} (ID: ${statusId})\n`)

		// Получаем категорию и поставщика
		const category = await prisma.productCategory.findFirst({
			where: { organizationId: organization.id },
		})
		if (!category) {
			console.error('❌ Категория не найдена')
			return
		}
		console.log(`📁 Категория: ${category.name} (ID: ${category.id})\n`)

		const supplier = await prisma.supplier.findFirst({
			where: { organizationId: organization.id },
		})
		if (!supplier) {
			console.error('❌ Поставщик не найден')
			return
		}
		console.log(`🏢 Поставщик: ${supplier.name} (ID: ${supplier.id})\n`)

		const supplierCategory = await prisma.supplierProductCategory.findFirst({
			where: {
				supplierId: supplier.id,
				categoryId: category.id,
			},
		})
		if (!supplierCategory) {
			console.error('❌ Связь поставщика с категорией не найдена')
			return
		}
		console.log(
			`🔗 Связь поставщика с категорией: ${supplierCategory.id}\n`
		)

		// Тестовые данные предложения
		const testProposalData = {
			clientId: client.id,
			groups: [
				{
					name: 'Gruppo Test',
					description: 'Test group',
					positions: [
						{
							categoryId: category.id,
							supplierCategoryId: supplierCategory.id,
							description: 'Test product',
							unitPrice: 100,
							quantity: 1,
							discount: 0,
							vatRate: 22,
							total: 122,
							vatAmount: 22,
						},
					],
				},
			],
			vatRate: 22,
			proposalDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
			validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
				.toISOString()
				.split('T')[0], // YYYY-MM-DD
			responsibleManager: 'Test Manager',
			status: 'draft',
			statusId: statusId, // число
			notes: 'Test proposal',
		}

		console.log('📦 Тестовые данные предложения:')
		console.log(JSON.stringify(testProposalData, null, 2))
		console.log('\n')

		// Проверяем валидацию через Zod
		const { proposalCreateSchema } = await import(
			'../src/lib/validation/proposal'
		)

		console.log('✅ Валидация данных...')
		const validationResult = proposalCreateSchema.safeParse(testProposalData)

		if (!validationResult.success) {
			console.error('❌ Ошибка валидации:')
			console.error(JSON.stringify(validationResult.error.errors, null, 2))
			return
		}

		console.log('✅ Валидация прошла успешно!')
		console.log('📋 Валидированные данные:')
		console.log(JSON.stringify(validationResult.data, null, 2))
		console.log('\n')

		// Проверяем преобразование дат
		console.log('📅 Проверка преобразования дат:')
		console.log(`  proposalDate: ${testProposalData.proposalDate} -> ${validationResult.data.proposalDate}`)
		console.log(`  validUntil: ${testProposalData.validUntil} -> ${validationResult.data.validUntil}`)
		console.log(`  statusId: ${testProposalData.statusId} (${typeof testProposalData.statusId}) -> ${validationResult.data.statusId} (${typeof validationResult.data.statusId})`)
		console.log('\n')

		console.log('✅ Все проверки пройдены успешно!')
	} catch (error) {
		console.error('❌ Ошибка:', error)
		process.exit(1)
	}
}

main()
	.catch(e => {
		console.error('❌ Ошибка:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})

