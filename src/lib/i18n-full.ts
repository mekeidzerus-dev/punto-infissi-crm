// Полная система локализации для приложения
// Поддерживаемые языки: Русский (ru), Итальянский (it)

export type Locale = 'ru' | 'it'

export const translations = {
	ru: {
		// ============ ОБЩИЕ ============
		save: 'Сохранить',
		cancel: 'Отмена',
		delete: 'Удалить',
		edit: 'Редактировать',
		add: 'Добавить',
		search: 'Поиск',
		loading: 'Загрузка...',
		close: 'Закрыть',
		back: 'Назад',
		next: 'Далее',
		yes: 'Да',
		no: 'Нет',
		actions: 'Действия',
		status: 'Статус',
		date: 'Дата',
		required: 'Обязательно',
		optional: 'Опционально',
		default: 'По умолчанию',
		active: 'Активно',
		inactive: 'Неактивно',
		name: 'Название',
		type: 'Тип',
		created: 'Создано',
		updated: 'Обновлено',

		// ============ МЕНЮ ============
		dashboard: 'Панель управления',
		clients: 'Клиенты',
		products: 'Товары',
		proposals: 'Предложения',
		orders: 'Заказы',
		settings: 'Настройки',
		suppliers: 'Поставщики',
		partners: 'Партнёры',
		installers: 'Монтажники',

		// ============ КЛИЕНТЫ ============
		addClient: 'Добавить клиента',
		clientName: 'Имя клиента',
		phone: 'Телефон',
		email: 'Email',
		address: 'Адрес',
		notes: 'Примечания',
		createNewClient: 'Создать нового клиента',
		clientNotFound: 'Клиент не найден',
		searchClient: 'Поиск клиента по имени, телефону, email...',
		individual: 'Физическое лицо',
		company: 'Компания',
		firstName: 'Имя',
		lastName: 'Фамилия',
		companyName: 'Название компании',
		codiceFiscale: 'Codice Fiscale',
		partitaIVA: 'Partita IVA',
		legalAddress: 'Юридический адрес',
		contactPerson: 'Контактное лицо',
		source: 'Источник',

		// ============ ПОСТАВЩИКИ ============
		addSupplier: 'Добавить поставщика',
		supplierName: 'Название поставщика',
		rating: 'Рейтинг',
		paymentTerms: 'Условия оплаты',
		deliveryDays: 'Дней на доставку',
		minOrderAmount: 'Минимальная сумма заказа',

		// ============ ПАРТНЁРЫ ============
		addPartner: 'Добавить партнёра',
		commission: 'Комиссия',

		// ============ МОНТАЖНИКИ ============
		addInstaller: 'Добавить монтажника',
		ratePrice: 'Ставка за работу',
		specialization: 'Специализация',

		// ============ ПРЕДЛОЖЕНИЯ ============
		newProposal: 'Новое предложение',
		proposalDate: 'Дата предложения',
		responsibleManager: 'Ответственный',
		client: 'Клиент',
		selectClient: 'Выберите клиента',
		vatRate: 'НДС',
		productList: 'Список товаров',
		addGroup: 'Добавить группу',
		addProduct: 'Добавить товар',
		groupName: 'Название группы',
		noGroups: 'Нет групп товаров',
		noProductsInGroup: 'Нет товаров в этой группе',
		proposalNumber: 'Номер предложения',
		groups: 'Группы',
		amount: 'Сумма',

		// ============ ТАБЛИЦА ТОВАРОВ ============
		description: 'Описание',
		quantity: 'Количество',
		price: 'Цена',
		discount: 'Скидка',
		vat: 'НДС',
		total: 'Итого',

		// ============ ИТОГИ ============
		subtotal: 'Промежуточный итог',
		totalDiscount: 'Скидка',
		totalVat: 'НДС',
		grandTotal: 'Итого',
		proposalTotal: 'Итоги предложения',

		// ============ КОНФИГУРАТОР ============
		productConfigurator: 'Конфигуратор продукта',
		selectCategory: 'Выберите категорию продукта',
		selectSupplier: 'Выберите поставщика',
		configureParameters: 'Настройте параметры',
		addToProposal: 'Добавить в предложение',
		preview: 'Предварительный просмотр',
		fillDimensionsForVisualization: 'Заполните размеры для визуализации',
		configuration: 'Конфигурация',
		visualization: 'Визуализация продукта',

		// ============ ПАРАМЕТРЫ ПРОДУКТА ============
		material: 'Материал',
		color: 'Цвет',
		width: 'Ширина',
		height: 'Высота',
		opening: 'Открывание',
		handle: 'Ручка',
		lock: 'Замок',
		glass: 'Стеклопакет',

		// ============ СТАТУСЫ ============
		draft: 'Черновик',
		sent: 'Отправлено',
		confirmed: 'Подтверждено',
		expired: 'Истекло',

		// ============ НАСТРОЙКИ ============
		companySettings: 'Настройки компании',
		companyName: 'Название компании',
		companyPhone: 'Телефон компании',
		companyEmail: 'Email компании',
		companyAddress: 'Адрес компании',
		companyLogo: 'Логотип компании',
		favicon: 'Иконка сайта',
		uploadLogo: 'Загрузить логотип',
		uploadFavicon: 'Загрузить favicon',
		deleteLogo: 'Удалить логотип',
		deleteFavicon: 'Удалить favicon',
		dictionaries: 'Справочники',
		documentTemplates: 'Шаблоны документов',
		privacyPolicy: 'Политика конфиденциальности',
		salesTerms: 'Условия продажи',
		warranty: 'Гарантия',
		createTemplate: 'Создать шаблон',
		editTemplate: 'Редактировать шаблон',
		templateName: 'Название шаблона',
		templateType: 'Тип шаблона',
		templateContent: 'Содержимое',
		contentRu: 'Текст на русском',
		contentIt: 'Testo in italiano',
		setAsDefault: 'Установить по умолчанию',

		// ============ СООБЩЕНИЯ ============
		selectClientAndAddGroups:
			'Пожалуйста, выберите клиента и добавьте хотя бы одну группу товаров',
		saving: 'Сохранение...',
		saveProposal: 'Сохранить предложение',
		confirmDelete: 'Вы уверены, что хотите удалить?',
		successfullySaved: 'Успешно сохранено',
		errorOccurred: 'Произошла ошибка',
		noDataFound: 'Данные не найдены',
		searchPlaceholder: 'Поиск по всей системе...',

		// ============ PDF ============
		downloadPDF: 'Скачать PDF',
		generatePDF: 'Сгенерировать PDF',
		printProposal: 'Печать предложения',
		clientSignature: 'Подпись клиента',
		signatureDate: 'Дата подписи',
	},

	it: {
		// ============ GENERALE ============
		save: 'Salva',
		cancel: 'Annulla',
		delete: 'Elimina',
		edit: 'Modifica',
		add: 'Aggiungi',
		search: 'Cerca',
		loading: 'Caricamento...',
		close: 'Chiudi',
		back: 'Indietro',
		next: 'Avanti',
		yes: 'Sì',
		no: 'No',
		actions: 'Azioni',
		status: 'Stato',
		date: 'Data',
		required: 'Obbligatorio',
		optional: 'Opzionale',
		default: 'Predefinito',
		active: 'Attivo',
		inactive: 'Inattivo',
		name: 'Nome',
		type: 'Tipo',
		created: 'Creato',
		updated: 'Aggiornato',

		// ============ MENU ============
		dashboard: 'Dashboard',
		clients: 'Clienti',
		products: 'Prodotti',
		proposals: 'Preventivi',
		orders: 'Ordini',
		settings: 'Impostazioni',
		suppliers: 'Fornitori',
		partners: 'Partner',
		installers: 'Installatori',

		// ============ CLIENTI ============
		addClient: 'Aggiungi cliente',
		clientName: 'Nome cliente',
		phone: 'Telefono',
		email: 'Email',
		address: 'Indirizzo',
		notes: 'Note',
		createNewClient: 'Crea nuovo cliente',
		clientNotFound: 'Cliente non trovato',
		searchClient: 'Cerca cliente per nome, telefono, email...',
		individual: 'Persona fisica',
		company: 'Azienda',
		firstName: 'Nome',
		lastName: 'Cognome',
		companyName: 'Ragione sociale',
		codiceFiscale: 'Codice Fiscale',
		partitaIVA: 'Partita IVA',
		legalAddress: 'Sede legale',
		contactPerson: 'Persona di contatto',
		source: 'Fonte',

		// ============ FORNITORI ============
		addSupplier: 'Aggiungi fornitore',
		supplierName: 'Nome fornitore',
		rating: 'Valutazione',
		paymentTerms: 'Termini di pagamento',
		deliveryDays: 'Giorni di consegna',
		minOrderAmount: 'Importo minimo ordine',

		// ============ PARTNER ============
		addPartner: 'Aggiungi partner',
		commission: 'Commissione',

		// ============ INSTALLATORI ============
		addInstaller: 'Aggiungi installatore',
		ratePrice: 'Tariffa oraria',
		specialization: 'Specializzazione',

		// ============ PREVENTIVI ============
		newProposal: 'Nuovo preventivo',
		proposalDate: 'Data preventivo',
		responsibleManager: 'Responsabile',
		client: 'Cliente',
		selectClient: 'Seleziona cliente',
		vatRate: 'IVA',
		productList: 'Elenco prodotti',
		addGroup: 'Aggiungi gruppo',
		addProduct: 'Aggiungi prodotto',
		groupName: 'Nome gruppo',
		noGroups: 'Nessun gruppo di prodotti',
		noProductsInGroup: 'Nessun prodotto in questo gruppo',
		proposalNumber: 'Numero preventivo',
		groups: 'Gruppi',
		amount: 'Importo',

		// ============ TABELLA PRODOTTI ============
		description: 'Descrizione',
		quantity: 'Q.tà',
		price: 'Prezzo €',
		discount: 'Sconto %',
		vat: 'IVA %',
		total: 'Totale €',

		// ============ TOTALI ============
		subtotal: 'Subtotale',
		totalDiscount: 'Sconto',
		totalVat: 'IVA',
		grandTotal: 'Totale',
		proposalTotal: 'Totale preventivo',

		// ============ CONFIGURATORE ============
		productConfigurator: 'Configuratore prodotto',
		selectCategory: 'Seleziona categoria prodotto',
		selectSupplier: 'Seleziona fornitore',
		configureParameters: 'Configura parametri',
		addToProposal: 'Aggiungi al preventivo',
		preview: 'Anteprima',
		fillDimensionsForVisualization:
			'Compila le dimensioni per la visualizzazione',
		configuration: 'Configurazione',
		visualization: 'Visualizzazione prodotto',

		// ============ PARAMETRI PRODOTTO ============
		material: 'Materiale',
		color: 'Colore',
		width: 'Larghezza (mm)',
		height: 'Altezza (mm)',
		opening: 'Apertura',
		handle: 'Maniglia',
		lock: 'Serratura',
		glass: 'Vetrocamera',

		// ============ STATI ============
		draft: 'Bozza',
		sent: 'Inviato',
		confirmed: 'Confermato',
		expired: 'Scaduto',

		// ============ IMPOSTAZIONI ============
		companySettings: 'Impostazioni azienda',
		companyName: 'Nome azienda',
		companyPhone: 'Telefono azienda',
		companyEmail: 'Email azienda',
		companyAddress: 'Indirizzo azienda',
		companyLogo: 'Logo azienda',
		favicon: 'Icona sito',
		uploadLogo: 'Carica logo',
		uploadFavicon: 'Carica favicon',
		deleteLogo: 'Elimina logo',
		deleteFavicon: 'Elimina favicon',
		dictionaries: 'Dizionari',
		documentTemplates: 'Modelli documenti',
		privacyPolicy: 'Privacy Policy',
		salesTerms: 'Condizioni di vendita',
		warranty: 'Garanzia',
		createTemplate: 'Crea modello',
		editTemplate: 'Modifica modello',
		templateName: 'Nome modello',
		templateType: 'Tipo modello',
		templateContent: 'Contenuto',
		contentRu: 'Testo in russo',
		contentIt: 'Testo in italiano',
		setAsDefault: 'Imposta come predefinito',

		// ============ MESSAGGI ============
		selectClientAndAddGroups:
			'Seleziona un cliente e aggiungi almeno un gruppo di prodotti',
		saving: 'Salvataggio...',
		saveProposal: 'Salva preventivo',
		confirmDelete: 'Sei sicuro di voler eliminare?',
		successfullySaved: 'Salvato con successo',
		errorOccurred: 'Si è verificato un errore',
		noDataFound: 'Nessun dato trovato',
		searchPlaceholder: 'Cerca in tutto il sistema...',

		// ============ PDF ============
		downloadPDF: 'Scarica PDF',
		generatePDF: 'Genera PDF',
		printProposal: 'Stampa preventivo',
		clientSignature: 'Firma del cliente',
		signatureDate: 'Data firma',
	},
}

export type TranslationKeys = keyof typeof translations.ru

export function getTranslation(locale: Locale, key: TranslationKeys): string {
	return translations[locale][key] || translations['ru'][key] || key
}

export function t(locale: Locale) {
	return (key: TranslationKeys) => getTranslation(locale, key)
}
