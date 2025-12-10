import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
	console.log('🌱 Seeding document templates...')

	// 1. Privacy Policy (GDPR) - ЕДИНСТВЕННЫЙ (можно редактировать, нельзя удалить)
	await prisma.documentTemplate.upsert({
		where: { id: 'privacy-policy-gdpr-2025' },
		update: {},
		create: {
			id: 'privacy-policy-gdpr-2025',
			name: 'Privacy Policy GDPR',
			type: 'privacy_policy',
			contentRu: `ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ

В соответствии с Регламентом (ЕС) 2016/679 (GDPR), настоящим информируем Вас о том, что Ваши персональные данные будут обработаны MODOCRM для целей выполнения договорных обязательств.

Ваши данные не будут переданы третьим лицам без Вашего согласия и будут храниться в течение 10 лет в соответствии с налоговым законодательством.

Вы имеете право на доступ, исправление, удаление и ограничение обработки Ваших данных.

Подписывая данный документ, Вы подтверждаете, что ознакомлены с политикой конфиденциальности и даёте согласие на обработку персональных данных.`,

			contentIt: `INFORMATIVA SULLA PRIVACY

In conformità al Regolamento (UE) 2016/679 (GDPR), La informiamo che i Suoi dati personali saranno trattati da MODOCRM per l'esecuzione degli obblighi contrattuali.

I Suoi dati non saranno comunicati a terzi senza il Suo consenso e saranno conservati per 10 anni in conformità alla normativa fiscale.

Lei ha diritto di accesso, rettifica, cancellazione e limitazione del trattamento dei Suoi dati.

Firmando il presente documento, conferma di aver preso visione dell'informativa sulla privacy e acconsente al trattamento dei dati personali.`,

			isDefault: true,
		},
	})

	// 2. Условия продажи - Стандартные (МОЖНО СОЗДАВАТЬ НЕСКОЛЬКО)
	await prisma.documentTemplate.upsert({
		where: { id: 'sales-terms-standard-2025' },
		update: {},
		create: {
			id: 'sales-terms-standard-2025',
			name: 'Condizioni standard 2025',
			type: 'sales_terms',
			contentRu: `УСЛОВИЯ ПРОДАЖИ

1. ОПЛАТА
   - Аванс 30% при подтверждении заказа
   - 40% при готовности к отгрузке
   - 30% после установки

2. СРОКИ
   - Производство: 20-30 рабочих дней
   - Доставка: 3-5 рабочих дней
   - Монтаж: согласно договорённости

3. ДОСТАВКА
   - Доставка в пределах 50 км от Милана - бесплатно
   - Свыше 50 км - €1.50/км

4. ГАРАНТИЯ
   - На изделия: 5 лет
   - На монтаж: 2 года

5. ВАЖНО
   - Цены действительны 30 дней с даты предложения
   - Размеры и технические характеристики уточняются при замере
   - Изменение заказа после производства не допускается`,

			contentIt: `CONDIZIONI DI VENDITA

1. PAGAMENTO
   - Acconto 30% alla conferma dell'ordine
   - 40% alla pronta consegna
   - 30% dopo l'installazione

2. TEMPI
   - Produzione: 20-30 giorni lavorativi
   - Consegna: 3-5 giorni lavorativi
   - Montaggio: secondo accordi

3. CONSEGNA
   - Consegna entro 50 km da Milano - gratuita
   - Oltre 50 km - €1.50/km

4. GARANZIA
   - Sui prodotti: 5 anni
   - Sul montaggio: 2 anni

5. IMPORTANTE
   - Prezzi validi 30 giorni dalla data del preventivo
   - Misure e specifiche tecniche da verificare al sopralluogo
   - Modifiche all'ordine dopo la produzione non sono consentite`,

			isDefault: true,
		},
	})

	// 3. Условия продажи - Для юридических лиц (МОЖНО СОЗДАВАТЬ НЕСКОЛЬКО)
	await prisma.documentTemplate.upsert({
		where: { id: 'sales-terms-business-2025' },
		update: {},
		create: {
			id: 'sales-terms-business-2025',
			name: 'Condizioni per aziende 2025',
			type: 'sales_terms',
			contentRu: `УСЛОВИЯ ПРОДАЖИ ДЛЯ ЮРИДИЧЕСКИХ ЛИЦ

1. ОПЛАТА
   - Банковский перевод
   - Оплата по счёту в течение 30 дней
   - Возможна рассрочка для постоянных клиентов

2. ДОКУМЕНТЫ
   - Счёт-фактура с НДС
   - Товарная накладная
   - Сертификаты соответствия

3. ДОСТАВКА
   - Доставка на объект согласно договору
   - Разгрузка силами заказчика
   - Оплата доставки отдельно

4. ГАРАНТИЯ
   - На изделия: 5 лет
   - Гарантийное обслуживание по месту установки

5. ПРОЧЕЕ
   - Цены указаны без учёта монтажа
   - Монтаж рассчитывается отдельно
   - Работаем по договору поставки`,

			contentIt: `CONDIZIONI DI VENDITA PER AZIENDE

1. PAGAMENTO
   - Bonifico bancario
   - Pagamento su fattura entro 30 giorni
   - Possibilità di rateizzazione per clienti abituali

2. DOCUMENTI
   - Fattura con IVA
   - DDT (Documento di Trasporto)
   - Certificati di conformità

3. CONSEGNA
   - Consegna in cantiere secondo contratto
   - Scarico a carico del cliente
   - Trasporto fatturato separatamente

4. GARANZIA
   - Sui prodotti: 5 anni
   - Assistenza in garanzia sul luogo di installazione

5. ALTRO
   - Prezzi escluso montaggio
   - Montaggio quotato separatamente
   - Lavoriamo con contratto di fornitura`,

			isDefault: false,
		},
	})

	// 4. Гарантия - ЕДИНСТВЕННЫЙ (можно редактировать, нельзя удалить)
	await prisma.documentTemplate.upsert({
		where: { id: 'warranty-standard-2025' },
		update: {},
		create: {
			id: 'warranty-standard-2025',
			name: 'Garanzia',
			type: 'warranty',
			contentRu: `ГАРАНТИЙНЫЕ УСЛОВИЯ

MODOCRM гарантирует качество изделий и работ:

1. ГАРАНТИЯ НА ИЗДЕЛИЯ: 5 лет
   - Профили и фурнитура
   - Стеклопакеты
   - Покрытие и цвет

2. ГАРАНТИЯ НА МОНТАЖ: 2 года
   - Герметичность установки
   - Работа механизмов
   - Отсутствие промерзания

3. ГАРАНТИЯ НЕ РАСПРОСТРАНЯЕТСЯ:
   - На механические повреждения
   - На износ уплотнителей (более 3 лет)
   - При неправильной эксплуатации

4. СЕРВИСНОЕ ОБСЛУЖИВАНИЕ:
   - Бесплатная регулировка в течение 1 года
   - Выезд мастера в течение 48 часов
   - Замена комплектующих по гарантии

Гарантия действительна при наличии подписанного акта выполненных работ.`,

			contentIt: `CONDIZIONI DI GARANZIA

MODOCRM garantisce la qualità dei prodotti e dei lavori:

1. GARANZIA SUI PRODOTTI: 5 anni
   - Profili e ferramenta
   - Vetrocamera
   - Verniciatura e colore

2. GARANZIA SUL MONTAGGIO: 2 anni
   - Tenuta dell'installazione
   - Funzionamento dei meccanismi
   - Assenza di ponti termici

3. LA GARANZIA NON COPRE:
   - Danni meccanici
   - Usura delle guarnizioni (oltre 3 anni)
   - Uso improprio

4. ASSISTENZA:
   - Regolazione gratuita per 1 anno
   - Intervento del tecnico entro 48 ore
   - Sostituzione componenti in garanzia

La garanzia è valida con verbale di lavori firmato.`,

			isDefault: true,
		},
	})

	console.log('🎉 Document templates seeded successfully!')
}

main()
	.catch(e => {
		console.error('❌ Error seeding templates:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
