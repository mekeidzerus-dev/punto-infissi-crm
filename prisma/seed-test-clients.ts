import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const testClients = [
	// Физические лица
	{
		type: 'individual',
		firstName: 'Mario',
		lastName: 'Rossi',
		phone: '+39 333 1234567',
		email: 'mario.rossi@example.com',
		address: 'Via Roma 123, Milano',
		codiceFiscale: 'RSSMRA80A01F205X',
		notes: 'Клиент заинтересован в пластиковых окнах',
	},
	{
		type: 'individual',
		firstName: 'Maria',
		lastName: 'Bianchi',
		phone: '+39 345 9876543',
		email: 'maria.bianchi@gmail.com',
		address: 'Corso Vittorio Emanuele 45, Roma',
		codiceFiscale: 'BNCMRA85B02H501Y',
		notes: 'Предпочитает деревянные двери',
	},
	{
		type: 'individual',
		firstName: 'Giuseppe',
		lastName: 'Verdi',
		phone: '+39 320 1112233',
		email: 'giuseppe.verdi@hotmail.com',
		address: 'Piazza Garibaldi 7, Torino',
		codiceFiscale: 'VRDGPP75C03L219Z',
		notes: 'Ремонт квартиры, нужны окна и двери',
	},
	{
		type: 'individual',
		firstName: 'Francesca',
		lastName: 'Romano',
		phone: '+39 348 5556677',
		email: 'francesca.romano@yahoo.it',
		address: 'Via Dante 89, Firenze',
		codiceFiscale: 'RMNFNC90D04D612A',
		notes: 'VIP клиент, срочный заказ',
	},
	{
		type: 'individual',
		firstName: 'Alessandro',
		lastName: 'Ferrari',
		phone: '+39 366 7778899',
		email: 'a.ferrari@libero.it',
		address: 'Viale Europa 12, Bologna',
		codiceFiscale: 'FRRLSS82E05A944B',
		notes: null,
	},
	{
		type: 'individual',
		firstName: 'Chiara',
		lastName: 'Conti',
		phone: '+39 349 3334445',
		email: 'chiara.conti@outlook.com',
		address: 'Via Manzoni 56, Genova',
		codiceFiscale: 'CNTCHR88F06D969C',
		notes: 'Требует скидку 10%',
	},
	{
		type: 'individual',
		firstName: 'Marco',
		lastName: 'Esposito',
		phone: '+39 338 6667788',
		email: 'marco.esposito@gmail.com',
		address: 'Corso Italia 34, Napoli',
		codiceFiscale: 'SPSMRC79G07F839D',
		notes: 'Постоянный клиент с 2020 года',
	},
	{
		type: 'individual',
		firstName: 'Giulia',
		lastName: 'Marino',
		phone: '+39 347 1113335',
		email: 'giulia.marino@alice.it',
		address: 'Via Garibaldi 78, Palermo',
		codiceFiscale: 'MRNGLL92H08G273E',
		notes: null,
	},
	{
		type: 'individual',
		firstName: 'Luca',
		lastName: 'Gallo',
		phone: '+39 335 2224446',
		email: 'luca.gallo@tiscali.it',
		address: 'Piazza Venezia 23, Venezia',
		codiceFiscale: 'GLLLCU86I09L736F',
		notes: 'Строит новый дом',
	},
	{
		type: 'individual',
		firstName: 'Elena',
		lastName: 'Moretti',
		phone: '+39 340 8889990',
		email: 'elena.moretti@fastwebnet.it',
		address: 'Via Mazzini 90, Verona',
		codiceFiscale: 'MRTLNE91L10L781G',
		notes: null,
	},

	// Юридические лица (компании)
	{
		type: 'company',
		companyName: 'Costruzioni Italia SRL',
		firstName: 'Roberto',
		lastName: 'Ricci',
		phone: '+39 02 12345678',
		email: 'info@costruzioniitalia.it',
		address: 'Via Montenapoleone 8, Milano',
		partitaIVA: '12345678901',
		legalAddress: 'Via Montenapoleone 8, 20121 Milano MI',
		contactPerson: 'Roberto Ricci',
		notes: 'Крупный строительный подрядчик',
	},
	{
		type: 'company',
		companyName: 'Design & Build SPA',
		firstName: 'Anna',
		lastName: 'Fontana',
		phone: '+39 06 98765432',
		email: 'contracts@designbuild.it',
		address: 'Via del Corso 126, Roma',
		partitaIVA: '98765432109',
		legalAddress: 'Via del Corso 126, 00186 Roma RM',
		contactPerson: 'Anna Fontana',
		notes: 'Архитектурная компания, работаем с 2018',
	},
	{
		type: 'company',
		companyName: 'Renovare Group',
		firstName: 'Stefano',
		lastName: 'Costa',
		phone: '+39 011 5554433',
		email: 'orders@renovare.it',
		address: 'Corso Francia 45, Torino',
		partitaIVA: '55443322110',
		legalAddress: 'Corso Francia 45, 10143 Torino TO',
		contactPerson: 'Stefano Costa',
		notes: 'Специализируется на реновации исторических зданий',
	},
	{
		type: 'company',
		companyName: 'Casa Bella Immobiliare',
		firstName: 'Valentina',
		lastName: 'Pellegrini',
		phone: '+39 055 7776655',
		email: 'v.pellegrini@casabella.it',
		address: 'Piazza della Signoria 3, Firenze',
		partitaIVA: '77665544221',
		legalAddress: 'Piazza della Signoria 3, 50122 Firenze FI',
		contactPerson: 'Valentina Pellegrini',
		notes: 'Агентство недвижимости, оптовые заказы',
	},
	{
		type: 'company',
		companyName: 'Edilizia Moderna SNC',
		firstName: 'Davide',
		lastName: 'Greco',
		phone: '+39 051 3332211',
		email: 'info@ediliziamoderna.com',
		address: 'Via Rizzoli 88, Bologna',
		partitaIVA: '33221100998',
		legalAddress: 'Via Rizzoli 88, 40125 Bologna BO',
		contactPerson: 'Davide Greco',
		notes: 'Постоянный партнёр, скидка 15%',
	},
]

async function main() {
	console.log('🌱 Начинаем заполнение тестовыми клиентами...')

	// Создаём тестовых клиентов
	for (const clientData of testClients) {
		// Проверяем, существует ли клиент с таким email
		const existing = await prisma.client.findFirst({
			where: { email: clientData.email },
		})

		if (existing) {
			console.log(
				`⏭️  Клиент уже существует: ${
					clientData.type === 'business'
						? clientData.companyName
						: `${clientData.firstName} ${clientData.lastName}`
				}`
			)
			continue
		}

		const client = await prisma.client.create({
			data: clientData as any,
		})
		console.log(
			`✅ Клиент создан: ${
				client.type === 'company'
					? client.companyName
					: `${client.firstName} ${client.lastName}`
			}`
		)
	}

	const totalClients = await prisma.client.count()
	console.log(`\n🎉 Завершено! Всего клиентов в базе: ${totalClients}`)
}

main()
	.catch(e => {
		console.error('❌ Ошибка:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
