import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
	console.log('🌱 Добавление типов документов и статусов...')

	// 1. Создаем типы документов
	const documentTypes = [
		{ name: 'proposal', nameRu: 'Предложение', nameIt: 'Proposta' },
		{ name: 'order', nameRu: 'Заказ', nameIt: 'Ordine' },
		{ name: 'invoice', nameRu: 'Счет', nameIt: 'Fattura' },
	]

	for (const type of documentTypes) {
		const existing = await prisma.documentType.findUnique({
			where: { name: type.name },
		})

		if (!existing) {
			await prisma.documentType.create({ data: type })
			console.log(`✅ Создан тип документа: ${type.nameRu} (${type.nameIt})`)
		} else {
			console.log(`⏭️  Тип документа уже существует: ${type.nameRu}`)
		}
	}

	// 2. Создаем статусы
	const statuses = [
		{ name: 'draft', nameRu: 'Черновик', nameIt: 'Bozza', color: '#gray' },
		{ name: 'sent', nameRu: 'Отправлено', nameIt: 'Inviato', color: '#blue' },
		{
			name: 'approved',
			nameRu: 'Утверждено',
			nameIt: 'Approvato',
			color: '#green',
		},
		{
			name: 'rejected',
			nameRu: 'Отклонено',
			nameIt: 'Rifiutato',
			color: '#red',
		},
		{
			name: 'in_production',
			nameRu: 'В производстве',
			nameIt: 'In Produzione',
			color: '#orange',
		},
		{
			name: 'completed',
			nameRu: 'Завершено',
			nameIt: 'Completato',
			color: '#purple',
		},
		{
			name: 'cancelled',
			nameRu: 'Отменено',
			nameIt: 'Annullato',
			color: '#gray',
		},
	]

	for (const status of statuses) {
		const existing = await prisma.documentStatus.findUnique({
			where: { name: status.name },
		})

		if (!existing) {
			await prisma.documentStatus.create({ data: status })
			console.log(`✅ Создан статус: ${status.nameRu} (${status.nameIt})`)
		} else {
			console.log(`⏭️  Статус уже существует: ${status.nameRu}`)
		}
	}

	// 3. Связываем статусы с типами документов
	const proposalType = await prisma.documentType.findUnique({
		where: { name: 'proposal' },
	})
	const orderType = await prisma.documentType.findUnique({
		where: { name: 'order' },
	})
	const invoiceType = await prisma.documentType.findUnique({
		where: { name: 'invoice' },
	})

	// Статусы для предложений
	const proposalStatuses = ['draft', 'sent', 'approved', 'rejected', 'cancelled']
	if (proposalType) {
		for (let i = 0; i < proposalStatuses.length; i++) {
			const status = await prisma.documentStatus.findUnique({
				where: { name: proposalStatuses[i] },
			})
			if (status) {
				const existing = await prisma.documentStatusType.findUnique({
					where: {
						documentTypeId_statusId: {
							documentTypeId: proposalType.id,
							statusId: status.id,
						},
					},
				})
				if (!existing) {
					await prisma.documentStatusType.create({
						data: {
							documentTypeId: proposalType.id,
							statusId: status.id,
							order: i,
						},
					})
					console.log(
						`✅ Связан статус "${status.nameRu}" с типом "Предложение"`
					)
				}
			}
		}
	}

	// Статусы для заказов
	const orderStatuses = [
		'draft',
		'approved',
		'in_production',
		'completed',
		'cancelled',
	]
	if (orderType) {
		for (let i = 0; i < orderStatuses.length; i++) {
			const status = await prisma.documentStatus.findUnique({
				where: { name: orderStatuses[i] },
			})
			if (status) {
				const existing = await prisma.documentStatusType.findUnique({
					where: {
						documentTypeId_statusId: {
							documentTypeId: orderType.id,
							statusId: status.id,
						},
					},
				})
				if (!existing) {
					await prisma.documentStatusType.create({
						data: {
							documentTypeId: orderType.id,
							statusId: status.id,
							order: i,
						},
					})
					console.log(`✅ Связан статус "${status.nameRu}" с типом "Заказ"`)
				}
			}
		}
	}

	// Статусы для счетов
	const invoiceStatuses = ['draft', 'sent', 'approved', 'cancelled']
	if (invoiceType) {
		for (let i = 0; i < invoiceStatuses.length; i++) {
			const status = await prisma.documentStatus.findUnique({
				where: { name: invoiceStatuses[i] },
			})
			if (status) {
				const existing = await prisma.documentStatusType.findUnique({
					where: {
						documentTypeId_statusId: {
							documentTypeId: invoiceType.id,
							statusId: status.id,
						},
					},
				})
				if (!existing) {
					await prisma.documentStatusType.create({
						data: {
							documentTypeId: invoiceType.id,
							statusId: status.id,
							order: i,
						},
					})
					console.log(`✅ Связан статус "${status.nameRu}" с типом "Счет"`)
				}
			}
		}
	}

	console.log('\n✅ Типы документов и статусы добавлены!')
}

main()
	.catch(e => {
		console.error('❌ Ошибка:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})

