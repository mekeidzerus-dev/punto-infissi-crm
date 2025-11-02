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
		counterparties: 'Контрагенты',
		clients: 'Клиенты',
		proposals: 'Предложения',
		categories: 'Категории',
		logoPlaceholder: 'Логотип',
		clickToUploadLogo: 'Нажмите, чтобы загрузить логотип',
		settings: 'Настройки',

		// Новый конфигуратор
		productConfigurator: 'Конфигуратор продуктов',
		selectCategory: 'Выберите категорию',
		selectSupplier: 'Выберите поставщика',
		configureParameters: 'Настройте параметры',
		categorySelectionPlaceholder:
			'Выберите категорию продукта для начала конфигурации',
		supplierSelectionPlaceholder: 'Выберите поставщика для выбранной категории',
		parametersConfigurationPlaceholder: 'Настройте параметры продукта',
		selectCategoryFirst: 'Сначала выберите категорию',
		selectSupplierFirst: 'Сначала выберите поставщика',
		selectProductCategory: 'Выберите категорию продукта',
		configureProductParameters: 'Настройте параметры продукта',
		finish: 'Завершить',
		configurationSteps: 'Этапы конфигурации',
		followStepsToConfigure: 'Следуйте этапам для настройки продукта',
		tip: 'Совет',
		configuratorTip: 'Все изменения автоматически сохраняются как черновик',
		categorySelectionDescription:
			'Выберите категорию продукта для начала конфигурации',
		addCategory: 'Добавить категорию',
		confirmDeleteCategory: 'Вы уверены, что хотите удалить эту категорию?',
		noCategories: 'Нет категорий',
		noCategoriesDescription:
			'Создайте первую категорию продукта для начала работы',
		addFirstCategory: 'Добавить первую категорию',
		selectedCategory: 'Выбранная категория',
		categorySettings: 'Настройки категории',
		suppliers: 'Поставщики',
		supplierInactiveTitle: 'Поставщик недоступен',
		supplierInactiveMessage:
			'Поставщик не активен и его нельзя выбрать. Обратитесь к администратору!',
		active: 'Активен',
		inactive: 'Неактивен',
		editSupplier: 'Редактировать поставщика',
		supplierName: 'Название поставщика',
		rating: 'Рейтинг',
		minOrderAmount: 'Минимальная сумма заказа',
		deliveryDays: 'Дни доставки',
		status: 'Статус',
		address: 'Адрес',
		notes: 'Примечания',
		save: 'Сохранить',
		confirmDeleteSupplier: 'Удалить поставщика из категории?',
		close: 'Закрыть',
		understood: 'Понятно',
		error: 'Ошибка',
		supplierDeleteError: 'Произошла ошибка при удалении поставщика.',
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
		productCategories: 'Категории продуктов',
		selected: 'выбрано',
		selectCategoriesForSupplier:
			'Выберите категории продуктов, которые поставляет {{supplier}}',
		totalCategories: 'Всего категорий',
		manageSuppliers: 'Управление поставщиками',
		manageSuppliersForCategory:
			'Управление поставщиками для категории "{{category}}"',
		linked: 'связанных',
		suppliersForCategory:
			'Поставщики, которые работают с категорией "{{category}}"',
		totalSuppliers: 'Всего поставщиков',
		available: 'Доступных',
		noLinkedSuppliers: 'Нет связанных поставщиков',
		addSuppliersToCategory: 'Добавьте поставщиков для этой категории',
		selectSuppliersToAdd: 'Выберите поставщиков для добавления в категорию',
		noAvailableSuppliers: 'Нет доступных поставщиков',
		errorUpdating: 'Ошибка при обновлении',
		errorDeleting: 'Ошибка при удалении',
		selectAll: 'Выбрать все',
		clearAll: 'Снять все',
		selected: 'Выбрано',
		cancel: 'Отмена',
		adding: 'Добавление...',
		addSelected: 'Добавить выбранные',

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
		groupSingular: 'группа',
		groupPlural: 'группы',
		groupMany: 'групп',
		amount: 'Сумма',
		selectVatRate: 'Выберите ставку НДС',

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
		subtotalBeforeVat: 'Итог без НДС',
		totalWithVat: 'ИТОГО с НДС',
		totalWithoutVat: 'ИТОГО (без НДС)',
		vatNotIncluded: 'Не включён',
		vatWillBeCalculatedLater:
			'НДС будет рассчитан позже в зависимости от условий клиента',
		important: 'Важно',

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
		parameters: 'Параметры',
		parametersAvailable: 'Параметры доступны',
		// Параметры размеров
		width: 'Ширина',
		height: 'Высота',
		depth: 'Глубина',
		material: 'Материал',
		color: 'Цвет',
		price: 'Цена',
		mm: 'мм',
		widthPlaceholder: '800мм',
		heightPlaceholder: '2000мм',
		depthPlaceholder: '40мм',
		suppliersAvailable: 'Поставщики доступны',
		noSuppliersForCategory: 'Нет поставщиков для категории',
		noSuppliersDescription:
			'К этой категории не привязано ни одного поставщика',
		addSupplierToCategory: 'Добавить поставщика к категории',
		selectSuppliersForCategory: 'Выберите поставщиков для категории',
		searchSuppliers: 'Поиск поставщиков',
		selectAll: 'Выбрать все',
		deselectAll: 'Снять выделение',
		selectedSuppliers: 'Выбрано поставщиков',
		confirmSelection: 'Подтвердить выбор',
		supplier: 'Поставщик',

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
		confirmDeleteSupplier: 'Вы уверены, что хотите удалить этого поставщика?',
		confirmDeletePartner: 'Вы уверены, что хотите удалить этого партнёра?',
		confirmDeleteInstaller: 'Вы уверены, что хотите удалить этого монтажника?',
		successfullySaved: 'Успешно сохранено',
		errorOccurred: 'Произошла ошибка',
		errorSaving: 'Ошибка при сохранении',
		notSpecified: 'Не указан',
		noDataFound: 'Данные не найдены',
		searchPlaceholder: 'Поиск по всей системе...',
		noProposals: 'Предложений пока нет',

		// ============ PDF ============
		downloadPDF: 'Скачать PDF',
		generatePDF: 'Сгенерировать PDF',
		printProposal: 'Печать предложения',
		clientSignature: 'Подпись клиента',
		signatureDate: 'Дата подписи',
		previewPDF: 'Просмотр PDF',
		applyBulkVAT: 'Применить НДС ко всем',
		applyVATToAll: 'Применить ко всем позициям',
		bulkVATApplied: 'НДС применён ко всем позициям',
		callClient: 'Позвонить',
		sendEmail: 'Отправить Email',
		showAllResults: 'Показать все',
		showingResults: 'Показано',
		of: 'из',
		clientNotFoundInList: 'Клиент не найден в списке',
		createNewClientPrompt: 'Создайте нового клиента',
		changeClient: 'Изменить клиента',
		systemInformation: 'Системная информация',
		proposalValidUntil: 'Действительно до',
		step: 'Шаг',
		of: 'из',
		stepClientInfo: 'Информация о клиенте',
		stepProducts: 'Товары и услуги',
		stepTotals: 'Итоговая сумма',

		// ============ ВАЛИДАЦИЯ И ОШИБКИ ============
		requiredField: 'Обязательное поле',
		invalidPhoneFormat: 'Неверный формат номера для',
		invalidEmailFormat: 'Неверный формат email',
		invalidCodiceFiscaleFormat: 'Неверный формат (16 символов)',
		invalidPartitaIVAFormat: 'Неверный формат (11 цифр)',
		fillClientInfo:
			'Заполните информацию о клиенте. Поля отмеченные * обязательны.',
		fillSupplierInfo:
			'Заполните информацию о поставщике. Поля отмеченные * обязательны.',
		fillPartnerInfo:
			'Заполните информацию о партнере. Поля отмеченные * обязательны.',
		fillInstallerInfo:
			'Заполните информацию о монтажнике. Поля отмеченные * обязательны.',
		confirmDeleteItem: 'Вы уверены, что хотите удалить этот элемент?',
		errorAdding: 'Ошибка при добавлении элемента',
		errorEditing: 'Ошибка при редактировании элемента',
		errorDeleting: 'Ошибка при удалении элемента',
		nothingFound: 'Ничего не найдено',
		noItems: 'Нет элементов. Добавьте первый элемент.',
		addSourcesInSettings: 'Добавьте источники в настройках',

		// ============ ТИПЫ И СТАТУСЫ ============
		individualShort: 'Физлицо',
		companyShort: 'Юрлицо',
		ipShort: 'ИП',
		activeStatus: 'Активен',
		inactiveStatus: 'Неактивен',
		mainStatus: 'Основной',

		// ============ СОЗДАНИЕ/РЕДАКТИРОВАНИЕ ============
		createClient: 'Создать клиента',
		editClient: 'Редактировать клиента',
		createSupplier: 'Создать поставщика',
		editSupplier: 'Редактировать поставщика',
		createPartner: 'Создать партнера',
		editPartner: 'Редактировать партнера',
		createInstaller: 'Создать монтажника',
		editInstaller: 'Редактировать монтажника',
		createProduct: 'Создать продукт',
		editProduct: 'Редактировать продукт',
		createOrder: 'Создать заказ',
		editOrder: 'Редактировать заказ',
		createItem: 'Создать',
		editItem: 'Редактировать элемент',
		addItem: 'Добавить элемент',

		// ============ УСЛОВИЯ ОПЛАТЫ ============
		prepayment: 'Предоплата',
		postpayment: 'Постоплата',
		deferred7: 'Отсрочка 7 дней',
		deferred14: 'Отсрочка 14 дней',
		deferred30: 'Отсрочка 30 дней',

		// ============ ТИПЫ ПАРТНЁРОВ ============
		architect: 'Архитектор',
		agent: 'Агент',
		engineer: 'Инженер',
		designer: 'Дизайнер',
		dealer: 'Дилер',
		distributor: 'Дистрибьютор',
		other: 'Другое',

		// ============ СПЕЦИАЛИЗАЦИИ ============
		windows: 'Окна',
		doors: 'Двери',
		balconies: 'Балконы',
		allTypes: 'Все виды работ',

		// ============ ИНСТРУМЕНТЫ/ТРАНСПОРТ ============
		hasTools: 'Есть инструмент',
		noTools: 'Нет инструмента',
		hasTransport: 'Есть транспорт',
		noTransport: 'Нет транспорта',
		hasToolsQuestion: 'Наличие инструмента',
		hasTransportQuestion: 'Наличие транспорта',

		// ============ ТАРИФЫ ============
		perUnit: 'За единицу',
		perHour: 'За час',
		perProject: 'За объект',
		rateType: 'Тип тарифа',
		experienceYears: 'Опыт работы (лет)',
		schedule: 'График работы',
		availability: 'Доступность',

		// ============ ДОСТУПНОСТЬ ============
		availableStatus: 'Свободен',
		busyStatus: 'Занят',
		vacationStatus: 'В отпуске',

		// ============ PLACEHOLDERS ============
		enterName: 'Введите название',
		enterPhone: 'Введите телефон',
		enterEmail: 'Введите email',
		enterAddress: 'Введите адрес',
		enterNotes: 'Введите примечания',
		searchDots: 'Поиск...',
		searchSystem: 'Поиск по всей системе...',
		namePlaceholder: 'Название *',
		phonePlaceholder: 'Телефон *',
		emailPlaceholder: 'Email',
		addressPlaceholder: 'Адрес',
		firstNamePlaceholder: 'Имя *',
		lastNamePlaceholder: 'Фамилия *',
		companyNamePlaceholder: 'Название компании *',
		contactPersonPlaceholder: 'Контактное лицо',
		legalAddressPlaceholder: 'Юридический адрес',
		notesPlaceholder: 'Примечания',
		sourcePlaceholder: 'Источник',

		// ============ НАСТРОЙКИ ============
		systemSettings: 'Настройки системы',
		recommendedSize: 'Рекомендуемый размер',
		recommendedLogoSize:
			'Рекомендуемый размер: до 350x100 пикселей (PNG, JPEG, WebP, SVG)',
		companyData: 'Данные компании',
		siteFavicon: 'Фавикон сайта',
		clientSources: 'Источники клиентов',
		clientSourcesDescription: 'Управление источниками привлечения клиентов',
		statusManagement: 'Управление статусами для разных сущностей',
		mainStatusDescription:
			'Основной статус будет автоматически присваиваться новым записям',

		// ============ СТРАНИЦЫ ============
		productManagement: 'Управление каталогом продукции',
		orderManagement: 'Управление заказами клиентов',
		newProduct: 'Новый продукт',
		basePrice: 'Базовая цена',
		category: 'Категория',
		newOrder: 'Новый заказ',
		createNewOrder: 'Создайте новый заказ для клиента',
		orderNumber: '№ Заказа',
		createdDate: 'Дата создания',
		searchClients: 'Поиск клиента...',
		searchSuppliers: 'Поиск поставщиков...',
		searchPartners: 'Поиск партнёров...',
		searchInstallers: 'Поиск монтажников...',
		searchProducts: 'Поиск продуктов...',
		searchOrders: 'Поиск заказов...',

		// ============ ТАБЛИЦЫ ============
		ordersCount: 'Заказов',
		region: 'Регион',
		partnerType: 'Тип партнера',
		installerType: 'Тип',
		contact: 'Контакт',
		experience: 'Опыт',
		regionWork: 'Регион работы',
		commissionPercent: 'Процент комиссии (%)',
		specifications: 'Характеристики',
		minOrderAmountPlaceholder: 'Мин. сумма заказа (€)',
		deliveryDaysPlaceholder: 'Срок поставки (дней)',
		warehouseAddress: 'Адрес склада/офиса',
		fullName: 'ФИО',
		teamName: 'Название бригады/компании',

		// ============ НОВАЯ СИСТЕМА ПАРАМЕТРОВ ============
		additionalNotes: 'Дополнительные заметки',
		enterAdditionalNotes: 'Введите дополнительную информацию о товаре...',
		notesWillBeIncludedInProposal: 'Заметки будут включены в предложение',
		colorSelection: 'Выбор цвета',
		suggestNewValue: 'Предложить новое значение',
		userSuggestions: 'Предложения пользователей',
		advancedParameters: 'Расширенные параметры',
		productVisualization: 'Визуализация продукта',
		colorSquares: 'Цветовые квадратики',
		select: 'Выберите',
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
		counterparties: 'Controparti',
		clients: 'Clienti',
		proposals: 'Preventivi',
		categories: 'Categorie',
		logoPlaceholder: 'Logo',
		clickToUploadLogo: 'Clicca per caricare il logo',
		settings: 'Impostazioni',

		// Nuovo configuratore
		productConfigurator: 'Configuratore prodotti',
		selectCategory: 'Seleziona categoria',
		selectSupplier: 'Seleziona fornitore',
		configureParameters: 'Configura parametri',
		categorySelectionPlaceholder:
			'Seleziona una categoria prodotto per iniziare la configurazione',
		supplierSelectionPlaceholder:
			'Seleziona un fornitore per la categoria scelta',
		parametersConfigurationPlaceholder: 'Configura i parametri del prodotto',
		selectCategoryFirst: 'Seleziona prima una categoria',
		selectSupplierFirst: 'Seleziona prima un fornitore',
		selectProductCategory: 'Seleziona categoria prodotto',
		configureProductParameters: 'Configura parametri prodotto',
		finish: 'Completa',
		configurationSteps: 'Passaggi configurazione',
		followStepsToConfigure: 'Segui i passaggi per configurare il prodotto',
		tip: 'Suggerimento',
		configuratorTip:
			'Tutte le modifiche vengono salvate automaticamente come bozza',
		categorySelectionDescription:
			'Seleziona una categoria prodotto per iniziare la configurazione',
		addCategory: 'Aggiungi categoria',
		confirmDeleteCategory: 'Sei sicuro di voler eliminare questa categoria?',
		noCategories: 'Nessuna categoria',
		noCategoriesDescription: 'Crea la prima categoria prodotto per iniziare',
		addFirstCategory: 'Aggiungi prima categoria',
		selectedCategory: 'Categoria selezionata',
		categorySettings: 'Impostazioni categoria',
		suppliers: 'Fornitori',
		supplierInactiveTitle: 'Fornitore non disponibile',
		supplierInactiveMessage:
			"Il fornitore non è attivo e non può essere selezionato. Contatta l'amministratore!",
		active: 'Attivo',
		inactive: 'Inattivo',
		editSupplier: 'Modifica fornitore',
		supplierName: 'Nome fornitore',
		rating: 'Valutazione',
		minOrderAmount: 'Importo minimo ordine',
		deliveryDays: 'Giorni di consegna',
		status: 'Stato',
		address: 'Indirizzo',
		notes: 'Note',
		save: 'Salva',
		confirmDeleteSupplier: 'Rimuovere il fornitore dalla categoria?',
		close: 'Chiudi',
		understood: 'Capito',
		error: 'Errore',
		supplierDeleteError:
			"Si è verificato un errore durante l'eliminazione del fornitore.",
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
		productCategories: 'Categorie prodotti',
		selected: 'selezionato',
		selectCategoriesForSupplier:
			'Seleziona le categorie di prodotti fornite da {{supplier}}',
		totalCategories: 'Totale categorie',
		manageSuppliers: 'Gestione fornitori',
		manageSuppliersForCategory:
			'Gestione fornitori per la categoria "{{category}}"',
		linked: 'collegati',
		suppliersForCategory:
			'Fornitori che lavorano con la categoria "{{category}}"',
		totalSuppliers: 'Totale fornitori',
		available: 'Disponibili',
		noLinkedSuppliers: 'Nessun fornitore collegato',
		addSuppliersToCategory: 'Aggiungi fornitori a questa categoria',
		selectSuppliersToAdd: 'Seleziona i fornitori da aggiungere alla categoria',
		noAvailableSuppliers: 'Nessun fornitore disponibile',
		errorUpdating: "Errore durante l'aggiornamento",
		errorDeleting: "Errore durante l'eliminazione",
		selectAll: 'Seleziona tutto',
		clearAll: 'Deseleziona tutto',
		selected: 'Selezionati',
		cancel: 'Annulla',
		adding: 'Aggiunta in corso...',
		addSelected: 'Aggiungi selezionati',

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
		groupSingular: 'gruppo',
		groupPlural: 'gruppi',
		groupMany: 'gruppi',
		amount: 'Importo',
		selectVatRate: 'Seleziona aliquota IVA',

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
		subtotalBeforeVat: 'Totale senza IVA',
		totalWithVat: 'TOTALE con IVA',
		totalWithoutVat: 'TOTALE (senza IVA)',
		vatNotIncluded: 'Non inclusa',
		vatWillBeCalculatedLater:
			"L'IVA sarà calcolata successivamente in base alle condizioni del cliente",
		important: 'Importante',

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
		parameters: 'Parametri',
		parametersAvailable: 'Parametri disponibili',
		// Parametri dimensioni
		width: 'Larghezza',
		height: 'Altezza',
		depth: 'Profondità',
		material: 'Materiale',
		color: 'Colore',
		price: 'Prezzo',
		mm: 'mm',
		widthPlaceholder: '800mm',
		heightPlaceholder: '2000mm',
		depthPlaceholder: '40mm',
		suppliersAvailable: 'Fornitori disponibili',
		noSuppliersForCategory: 'Nessun fornitore per la categoria',
		noSuppliersDescription: 'Nessun fornitore collegato a questa categoria',
		addSupplierToCategory: 'Aggiungi fornitore alla categoria',
		selectSuppliersForCategory: 'Seleziona fornitori per la categoria',
		searchSuppliers: 'Cerca fornitori',
		selectAll: 'Seleziona tutto',
		deselectAll: 'Deseleziona tutto',
		selectedSuppliers: 'Fornitori selezionati',
		confirmSelection: 'Conferma selezione',
		supplier: 'Fornitore',

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
		confirmDeleteSupplier: 'Sei sicuro di voler eliminare questo fornitore?',
		confirmDeletePartner: 'Sei sicuro di voler eliminare questo partner?',
		confirmDeleteInstaller:
			'Sei sicuro di voler eliminare questo installatore?',
		successfullySaved: 'Salvato con successo',
		errorOccurred: 'Si è verificato un errore',
		errorSaving: 'Errore durante il salvataggio',
		notSpecified: 'Non specificato',
		noDataFound: 'Nessun dato trovato',
		searchPlaceholder: 'Cerca in tutto il sistema...',
		noProposals: 'Nessun preventivo ancora',

		// ============ PDF ============
		downloadPDF: 'Scarica PDF',
		generatePDF: 'Genera PDF',
		printProposal: 'Stampa preventivo',
		clientSignature: 'Firma del cliente',
		signatureDate: 'Data firma',
		previewPDF: 'Anteprima PDF',
		applyBulkVAT: 'Applica IVA a tutti',
		applyVATToAll: 'Applica a tutte le posizioni',
		bulkVATApplied: 'IVA applicata a tutte le posizioni',
		callClient: 'Chiama',
		sendEmail: 'Invia Email',
		showAllResults: 'Mostra tutti',
		showingResults: 'Visualizzati',
		of: 'di',
		clientNotFoundInList: 'Cliente non trovato nella lista',
		createNewClientPrompt: 'Crea un nuovo cliente',
		changeClient: 'Cambia cliente',
		systemInformation: 'Informazioni di sistema',
		proposalValidUntil: 'Valido fino al',
		step: 'Passo',
		of: 'di',
		stepClientInfo: 'Informazioni cliente',
		stepProducts: 'Prodotti e servizi',
		stepTotals: 'Totale finale',

		// ============ VALIDAZIONE ED ERRORI ============
		requiredField: 'Campo obbligatorio',
		invalidPhoneFormat: 'Formato numero non valido per',
		invalidEmailFormat: 'Formato email non valido',
		invalidCodiceFiscaleFormat: 'Formato non valido (16 caratteri)',
		invalidPartitaIVAFormat: 'Formato non valido (11 cifre)',
		fillClientInfo:
			'Compila le informazioni del cliente. I campi contrassegnati con * sono obbligatori.',
		fillSupplierInfo:
			'Compila le informazioni del fornitore. I campi contrassegnati con * sono obbligatori.',
		fillPartnerInfo:
			'Compila le informazioni del partner. I campi contrassegnati con * sono obbligatori.',
		fillInstallerInfo:
			"Compila le informazioni dell'installatore. I campi contrassegnati con * sono obbligatori.",
		confirmDeleteItem: 'Sei sicuro di voler eliminare questo elemento?',
		errorAdding: "Errore durante l'aggiunta dell'elemento",
		errorEditing: "Errore durante la modifica dell'elemento",
		errorDeleting: "Errore durante l'eliminazione dell'elemento",
		nothingFound: 'Nessun risultato trovato',
		noItems: 'Nessun elemento. Aggiungi il primo elemento.',
		addSourcesInSettings: 'Aggiungi fonti nelle impostazioni',

		// ============ TIPI E STATI ============
		individualShort: 'Privato',
		companyShort: 'Azienda',
		ipShort: 'Ditta individuale',
		activeStatus: 'Attivo',
		inactiveStatus: 'Inattivo',
		mainStatus: 'Principale',

		// ============ CREAZIONE/MODIFICA ============
		createClient: 'Crea cliente',
		editClient: 'Modifica cliente',
		createSupplier: 'Crea fornitore',
		editSupplier: 'Modifica fornitore',
		createPartner: 'Crea partner',
		editPartner: 'Modifica partner',
		createInstaller: 'Crea installatore',
		editInstaller: 'Modifica installatore',
		createProduct: 'Crea prodotto',
		editProduct: 'Modifica prodotto',
		createOrder: 'Crea ordine',
		editOrder: 'Modifica ordine',
		createItem: 'Crea',
		editItem: 'Modifica elemento',
		addItem: 'Aggiungi elemento',

		// ============ CONDIZIONI DI PAGAMENTO ============
		prepayment: 'Pagamento anticipato',
		postpayment: 'Pagamento posticipato',
		deferred7: 'Differimento 7 giorni',
		deferred14: 'Differimento 14 giorni',
		deferred30: 'Differimento 30 giorni',

		// ============ TIPI DI PARTNER ============
		architect: 'Architetto',
		agent: 'Agente',
		engineer: 'Ingegnere',
		designer: 'Designer',
		dealer: 'Rivenditore',
		distributor: 'Distributore',
		other: 'Altro',

		// ============ SPECIALIZZAZIONI ============
		windows: 'Finestre',
		doors: 'Porte',
		balconies: 'Balconi',
		allTypes: 'Tutti i tipi',

		// ============ STRUMENTI/TRASPORTO ============
		hasTools: 'Ha strumenti',
		noTools: 'Senza strumenti',
		hasTransport: 'Ha trasporto',
		noTransport: 'Senza trasporto',
		hasToolsQuestion: 'Disponibilità strumenti',
		hasTransportQuestion: 'Disponibilità trasporto',

		// ============ TARIFFE ============
		perUnit: 'Per unità',
		perHour: 'Per ora',
		perProject: 'Per progetto',
		rateType: 'Tipo di tariffa',
		experienceYears: 'Anni di esperienza',
		schedule: 'Orario di lavoro',
		availability: 'Disponibilità',

		// ============ DISPONIBILITÀ ============
		availableStatus: 'Disponibile',
		busyStatus: 'Occupato',
		vacationStatus: 'In ferie',

		// ============ SEGNAPOSTO ============
		enterName: 'Inserisci nome',
		enterPhone: 'Inserisci telefono',
		enterEmail: 'Inserisci email',
		enterAddress: 'Inserisci indirizzo',
		enterNotes: 'Inserisci note',
		searchDots: 'Cerca...',
		searchSystem: 'Cerca in tutto il sistema...',
		namePlaceholder: 'Nome *',
		phonePlaceholder: 'Telefono *',
		emailPlaceholder: 'Email',
		addressPlaceholder: 'Indirizzo',
		firstNamePlaceholder: 'Nome *',
		lastNamePlaceholder: 'Cognome *',
		companyNamePlaceholder: 'Nome azienda *',
		contactPersonPlaceholder: 'Persona di contatto',
		legalAddressPlaceholder: 'Indirizzo legale',
		notesPlaceholder: 'Note',
		sourcePlaceholder: 'Fonte',

		// ============ IMPOSTAZIONI ============
		systemSettings: 'Impostazioni di sistema',
		recommendedSize: 'Dimensioni consigliate',
		recommendedLogoSize:
			'Dimensioni consigliate: fino a 350x100 pixel (PNG, JPEG, WebP, SVG)',
		companyData: 'Dati aziendali',
		siteFavicon: 'Favicon del sito',
		clientSources: 'Fonti clienti',
		clientSourcesDescription: 'Gestione delle fonti di acquisizione clienti',
		statusManagement: 'Gestione degli stati per diverse entità',
		mainStatusDescription:
			'Lo stato principale verrà automaticamente assegnato ai nuovi record',

		// ============ PAGINE ============
		productManagement: 'Gestione catalogo prodotti',
		orderManagement: 'Gestione ordini clienti',
		newProduct: 'Nuovo prodotto',
		basePrice: 'Prezzo base',
		category: 'Categoria',
		newOrder: 'Nuovo ordine',
		createNewOrder: 'Crea un nuovo ordine per il cliente',
		orderNumber: 'N° Ordine',
		createdDate: 'Data creazione',
		searchClients: 'Cerca cliente...',
		searchSuppliers: 'Cerca fornitori...',
		searchPartners: 'Cerca partner...',
		searchInstallers: 'Cerca installatori...',
		searchProducts: 'Cerca prodotti...',
		searchOrders: 'Cerca ordini...',

		// ============ TABELLE ============
		ordersCount: 'Ordini',
		region: 'Regione',
		partnerType: 'Tipo partner',
		installerType: 'Tipo',
		contact: 'Contatto',
		experience: 'Esperienza',
		regionWork: 'Regione di lavoro',
		commissionPercent: 'Percentuale commissione (%)',
		specifications: 'Specifiche',
		minOrderAmountPlaceholder: 'Importo min. ordine (€)',
		deliveryDaysPlaceholder: 'Tempo di consegna (giorni)',
		warehouseAddress: 'Indirizzo magazzino/ufficio',
		fullName: 'Nome completo',
		teamName: 'Nome squadra/azienda',

		// ============ НОВАЯ СИСТЕМА ПАРАМЕТРОВ ============
		additionalNotes: 'Note aggiuntive',
		enterAdditionalNotes: 'Inserisci informazioni aggiuntive sul prodotto...',
		notesWillBeIncludedInProposal: 'Le note saranno incluse nella proposta',
		colorSelection: 'Selezione colore',
		suggestNewValue: 'Suggerisci nuovo valore',
		userSuggestions: 'Suggerimenti utenti',
		advancedParameters: 'Parametri avanzati',
		productVisualization: 'Visualizzazione prodotto',
		colorSquares: 'Quadrati colorati',
		select: 'Seleziona',
	},
}

export type TranslationKeys = keyof typeof translations.ru

export function getTranslation(
	locale: Locale,
	key: TranslationKeys,
	params?: Record<string, string | number>
): string {
	let translation = translations[locale][key] || translations['ru'][key] || key

	// Замена параметров типа {{param}}
	if (params) {
		Object.entries(params).forEach(([paramKey, paramValue]) => {
			translation = translation.replace(
				new RegExp(`{{${paramKey}}}`, 'g'),
				String(paramValue)
			)
		})
	}

	return translation
}

// Pluralization utility for groups
export function pluralizeGroups(count: number, locale: Locale): string {
	if (locale === 'it') {
		// Italian: 1 gruppo, 2+ gruppi
		return count === 1 ? 'gruppo' : 'gruppi'
	} else {
		// Russian: 1 группа, 2-4 группы, 5+ групп
		if (count === 1) return 'группа'
		if (count >= 2 && count <= 4) return 'группы'
		return 'групп'
	}
}

export function t(locale: Locale) {
	return (key: TranslationKeys, params?: Record<string, string | number>) =>
		getTranslation(locale, key, params)
}
