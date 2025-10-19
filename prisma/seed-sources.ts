/**
 * Скрипт для добавления источников клиентов по умолчанию
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEFAULT_SOURCES = [
	// Популярные в Италии онлайн-источники
	'Sito web aziendale', // Сайт компании
	'Google Ads',
	'Facebook / Instagram',
	'LinkedIn',
	'Subito.it', // Популярный итальянский сайт объявлений
	'PagineGialle.it', // Итальянские желтые страницы
	'Houzz Italia', // Популярен для дизайна интерьера

	// Рекомендации
	'Passaparola (Рекомендация клиента)',
	'Raccomandazione partner',
	'Architetto / Geometra', // Архитектор/геодезист - важный источник в Италии

	// Прямой контакт
	'WhatsApp',
	'Telefonata diretta',
	'Email',
	'Visita diretta in ufficio',

	// Мероприятия и выставки
	'Fiera / Esposizione', // Выставка
	'Made Expo Milano', // Крупнейшая строительная выставка в Италии
	'Klimahouse Bolzano', // Выставка энергоэффективного строительства

	// Реклама
	'Volantini / Brochure', // Листовки/брошюры
	'Pubblicità locale', // Местная реклама

	// Другое
	'Cliente abituale', // Постоянный клиент
	'Altro',
]

async function main() {
	console.log('🌱 Начинаю добавление источников по умолчанию...')

	// Проверяем, есть ли уже источники
	const existingSources = await prisma.dictionary.count({
		where: { type: 'sources' },
	})

	if (existingSources > 0) {
		console.log(`ℹ️  В БД уже есть ${existingSources} источников. Пропускаю...`)
		return
	}

	// Добавляем источники
	for (const sourceName of DEFAULT_SOURCES) {
		await prisma.dictionary.create({
			data: {
				type: 'sources',
				name: sourceName,
			},
		})
		console.log(`✅ Добавлен источник: ${sourceName}`)
	}

	console.log(`\n🎉 Успешно добавлено ${DEFAULT_SOURCES.length} источников!`)
}

main()
	.catch(e => {
		console.error('❌ Ошибка при добавлении источников:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
