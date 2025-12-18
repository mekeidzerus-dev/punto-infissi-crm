'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLanguage } from '@/contexts/LanguageContext'
import { logger } from '@/lib/logger'
import { apiClient, ApiError } from '@/lib/api-client'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import { ProductConfiguratorV2 } from '@/components/product-configurator-v2'
import { ClientFormModal } from '@/components/client-form-modal'
import { DocumentStatusesManager } from '@/components/document-statuses-manager'
import {
	Plus,
	Trash2,
	Save,
	X,
	Search,
	UserPlus,
	Calendar,
	Eye,
	Phone,
	Mail,
	Settings,
	Hash,
	Clock,
	Pencil,
	Info,
	AlertCircle,
} from 'lucide-react'
import { buildProductPosition } from '@/lib/product-position-builder'
import { generateProductDescription } from '@/lib/product-name-generator'
import { parseClientInput } from '@/lib/client-input-parser'
import { toast } from 'sonner'

import type { Client } from '@/types/client'
import type { VATRate } from '@/types/common'
import type {
	ProposalPosition,
	ProposalGroup,
	ProposalDocument,
	ProposalFormProps,
} from '@/types/proposal'
import type { Configuration } from '@/types/parameter'

// Утилита для подсветки текста
function highlightText(text: string, searchTerms: string[]) {
	if (!searchTerms.length || !text) return text

	let result = text
	const highlights: { start: number; end: number; term: string }[] = []

	searchTerms.forEach(term => {
		const regex = new RegExp(term, 'gi')
		let match
		while ((match = regex.exec(text)) !== null) {
			highlights.push({
				start: match.index,
				end: match.index + term.length,
				term,
			})
		}
	})

	// Сортируем по позиции
	highlights.sort((a, b) => a.start - b.start)

	// Объединяем пересекающиеся выделения
	const merged: { start: number; end: number }[] = []
	highlights.forEach(h => {
		if (merged.length === 0 || merged[merged.length - 1].end < h.start) {
			merged.push(h)
		} else {
			merged[merged.length - 1].end = Math.max(
				merged[merged.length - 1].end,
				h.end
			)
		}
	})

	// Создаём JSX с подсветкой
	if (merged.length === 0) return text

	const parts: React.ReactNode[] = []
	let lastIndex = 0

	merged.forEach(({ start, end }, i) => {
		if (start > lastIndex) {
			parts.push(text.substring(lastIndex, start))
		}
		parts.push(
			<span key={i} className='bg-green-200 font-semibold'>
				{text.substring(start, end)}
			</span>
		)
		lastIndex = end
	})

	if (lastIndex < text.length) {
		parts.push(text.substring(lastIndex))
	}

	return <>{parts}</>
}

export function ProposalFormV3({
	proposal,
	onSave,
	onCancel,
	onPreview,
}: ProposalFormProps) {
	const { t, locale } = useLanguage()
	const [clients, setClients] = useState<Client[]>([])
	const [vatRates, setVatRates] = useState<VATRate[]>([])
	const [documentStatuses, setDocumentStatuses] = useState<
		Array<{
			id: number
			name: string
			nameRu: string
			nameIt: string
			color: string
		}>
	>([])
	const [showStatusManager, setShowStatusManager] = useState(false)
	const [showConfigurator, setShowConfigurator] = useState(false)
	const [currentGroupIndex, setCurrentGroupIndex] = useState<number | null>(
		null
	)
	const [loading, setLoading] = useState(false)

	// Поиск клиента
	const [clientSearchTerm, setClientSearchTerm] = useState('')
	const [showClientSearch, setShowClientSearch] = useState(false)
	const [showNewClientModal, setShowNewClientModal] = useState(false)
	const [showEditClientModal, setShowEditClientModal] = useState(false)
	const [newClientData, setNewClientData] = useState<any>(null)
	const [filteredClients, setFilteredClients] = useState<Client[]>([])
	const [showAllClients, setShowAllClients] = useState(false)

	// Массовое применение НДС
	const [bulkVatGroupIndex, setBulkVatGroupIndex] = useState<number | null>(
		null
	)
	const [bulkVatRate, setBulkVatRate] = useState<string>('')

	const [formData, setFormData] = useState<ProposalDocument>({
		proposalDate: new Date().toISOString().split('T')[0],
		validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
			.toISOString()
			.split('T')[0], // +30 дней по умолчанию
		clientId: 0,
		responsibleManager: 'Администратор',
		status: 'draft',
		groups: [],
		vatRate: 0,
		subtotal: 0,
		discount: 0,
		vatAmount: 0,
		total: 0,
		notes: '',
		...proposal,
	})

	useEffect(() => {
		fetchClients()
		fetchVATRates()
		fetchDocumentStatuses()
	}, [])

	// Обновляем formData когда приходит proposal для редактирования
	useEffect(() => {
		if (proposal) {
			setFormData({
				...proposal,
				proposalDate: proposal.proposalDate
					? new Date(proposal.proposalDate).toISOString().split('T')[0]
					: new Date().toISOString().split('T')[0],
				validUntil: proposal.validUntil
					? new Date(proposal.validUntil).toISOString().split('T')[0]
					: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
			})
		}
	}, [proposal])

	useEffect(() => {
		recalculateTotals()
	}, [formData.groups])

	// Multi-search для клиентов
	useEffect(() => {
		// Сбрасываем "Показать все" при изменении поиска
		setShowAllClients(false)

		if (clientSearchTerm.trim()) {
			const searchTerms = clientSearchTerm
				.trim()
				.toLowerCase()
				.split(/\s+/)
				.filter(term => term.length > 0)

			const filtered = clients.filter(client => {
				const fullName =
					client.type === 'company' && client.companyName
						? client.companyName
						: `${client.firstName} ${client.lastName}`
				const searchableText = [fullName, client.phone, client.email || '']
					.join(' ')
					.toLowerCase()

				return searchTerms.every(term => searchableText.includes(term))
			})
			setFilteredClients(filtered)
		} else {
			setFilteredClients(clients)
		}
	}, [clientSearchTerm, clients])

	const fetchClients = async () => {
		try {
			const data = await apiClient.get<any[]>('/api/clients')
			
			// Убеждаемся, что data - массив
			if (!Array.isArray(data)) {
				logger.error('Invalid clients data format:', data)
				setClients([])
				setFilteredClients([])
				return
			}
			
			setClients(data)
			setFilteredClients(data)
		} catch (error) {
			logger.error('Error fetching clients:', error)
			setClients([])
			setFilteredClients([])
		}
	}

	const fetchVATRates = async () => {
		try {
			const data = await apiClient.get<any[]>('/api/vat-rates')
			
			// Убеждаемся, что data - массив
			if (!Array.isArray(data)) {
				logger.error('Invalid VAT rates data format:', data)
				setVatRates([])
				return
			}
			
			// Конвертируем percentage в number, т.к. Prisma Decimal возвращает строку
			const convertedData = data.map((rate: any) => ({
				...rate,
				percentage:
					typeof rate.percentage === 'string'
						? parseFloat(rate.percentage)
						: rate.percentage,
			}))
			setVatRates(convertedData)
			const defaultRate = convertedData.find((rate: VATRate) => rate.isDefault)
			if (defaultRate && !proposal) {
				setFormData(prev => ({ ...prev, vatRate: defaultRate.percentage }))
			}
		} catch (error) {
			logger.error('Error fetching VAT rates:', error)
			setVatRates([])
		}
	}

	const fetchDocumentStatuses = async () => {
		try {
			const data = await apiClient.get<any[]>('/api/document-statuses?documentType=proposal')
			
			// Убеждаемся, что data - массив
			if (!Array.isArray(data)) {
				logger.error('Invalid document statuses data format:', data)
				setDocumentStatuses([])
				return
			}
			
			setDocumentStatuses(data)

			// Если это новый документ и статус не установлен - устанавливаем основной статус (isDefault) или первый доступный
			if (!proposal && !formData.statusId && data.length > 0) {
				const defaultStatus = data.find((s: { isDefault?: boolean }) => s.isDefault) || data[0]
				setFormData(prev => ({
					...prev,
					statusId: defaultStatus.id,
					status: defaultStatus.name,
				}))
				logger.info(`✅ Auto-selected default status: ${defaultStatus.name} (ID: ${defaultStatus.id})`)
			}
		} catch (error) {
			logger.error('Error fetching document statuses:', error)
			setDocumentStatuses([])
		}
	}

	const recalculateTotals = () => {
		let subtotal = 0
		let totalDiscount = 0
		let totalVat = 0

		formData.groups.forEach(group => {
			group.positions.forEach(position => {
				const positionSubtotal = position.unitPrice * position.quantity
				const positionDiscount = positionSubtotal * (position.discount / 100)
				const positionBeforeVat = positionSubtotal - positionDiscount
				const positionVat = positionBeforeVat * (position.vatRate / 100)

				subtotal += positionSubtotal
				totalDiscount += positionDiscount
				totalVat += positionVat

				// Обновляем позицию
				position.vatAmount = positionVat
				position.total = positionBeforeVat + positionVat
			})
		})

		const total = subtotal - totalDiscount + totalVat

		setFormData(prev => ({
			...prev,
			subtotal,
			discount: totalDiscount,
			vatAmount: totalVat,
			total,
		}))
	}

	const handleClientSelect = (clientId: number) => {
		setFormData(prev => ({ ...prev, clientId }))
		setShowClientSearch(false)
		setClientSearchTerm('')
	}

	const handleClientCreated = async (clientData: any) => {
		try {
			// Создаём клиента в БД
			const createdClient = await apiClient.post<any>('/api/clients', clientData)
			
			// Клиент создан успешно
			// Обновляем список клиентов
			await fetchClients()

			// Автоматически выбираем нового клиента
			setFormData(prev => ({ ...prev, clientId: createdClient.id }))
			setShowNewClientModal(false)
			setClientSearchTerm('')
			setShowClientSearch(false)
		} catch (error) {
			logger.error('❌ Ошибка создания клиента:', error)
			const errorMessage = error instanceof ApiError ? error.message : 'Unknown error'
			const message =
				locale === 'ru'
					? `${t('errorSaving')}: ${errorMessage}`
					: typeof errorMessage === 'string' && errorMessage.includes('Unknown')
					? 'Impossibile creare il cliente. Controlla i dati inseriti e riprova.'
					: `Impossibile creare il cliente: ${errorMessage}`
			toast.error(message, { duration: 4000 })
		}
	}

	const handleClientUpdated = async (clientData: any) => {
		try {
			if (!selectedClient) return

			// Обновляем клиента в БД
			const updatedClient = await apiClient.put(`/api/clients/${selectedClient.id}`, clientData)
			
			// Клиент обновлён успешно
			// Обновляем список клиентов
			await fetchClients()

			// Закрываем модальное окно
			setShowEditClientModal(false)
		} catch (error) {
			logger.error('❌ Ошибка обновления клиента:', error)
			const errorMessage = error instanceof ApiError ? error.message : 'Unknown error'
			const message =
				locale === 'ru'
					? `${t('errorSaving')}: ${errorMessage}`
					: typeof errorMessage === 'string' && errorMessage.includes('Unknown')
					? 'Impossibile aggiornare il cliente. Controlla i dati inseriti e riprova.'
					: `Impossibile aggiornare il cliente: ${errorMessage}`
			toast.error(message, { duration: 4000 })
		}
	}

	// Обработчик создания нового клиента с умным парсингом
	const handleCreateNewClient = () => {
		const parsed = parseClientInput(clientSearchTerm)

		// Показываем предупреждения если есть
		if (parsed.warnings.length > 0) {
			logger.warn('⚠️ Предупреждения при парсинге клиента:', {
				warnings: parsed.warnings,
			})
		}

		// Если есть критические ошибки, показываем их
		if (parsed.errors.length > 0) {
			const errorMessage =
				locale === 'ru'
					? `Обнаружены ошибки в данных:\n${parsed.errors.join('\n')}\n\nПожалуйста, исправьте их в форме.`
					: `Sono stati rilevati errori nei dati inseriti:\n${parsed.errors.join('\n')}\n\nCorreggi gli errori nel modulo per continuare.`
			toast.error(errorMessage, { duration: 5000 })
		}

		// Открываем форму с предзаполненными данными
		setNewClientData({
			type: parsed.companyName ? 'company' : 'individual',
			firstName: parsed.firstName || '',
			lastName: parsed.lastName || '',
			companyName: parsed.companyName || '',
			phone: parsed.phone || '',
			email: parsed.email || '',
			address: '',
			codiceFiscale: '',
			partitaIVA: '',
			legalAddress: '',
			contactPerson: '',
			source: '',
			notes:
				parsed.warnings.length > 0
					? `Автоисправления: ${parsed.warnings.join('; ')}`
					: '',
		})
		setShowNewClientModal(true)
	}

	const addGroup = () => {
		const newGroup: ProposalGroup = {
			id: Date.now().toString(),
			name: `Gruppo ${formData.groups.length + 1}`,
			positions: [],
		}
		setFormData(prev => ({
			...prev,
			groups: [...prev.groups, newGroup],
		}))
	}

	const removeGroup = (groupIndex: number) => {
		setFormData(prev => ({
			...prev,
			groups: prev.groups.filter((_, i) => i !== groupIndex),
		}))
	}

	const updateGroupName = (groupIndex: number, name: string) => {
		setFormData(prev => ({
			...prev,
			groups: prev.groups.map((group, i) =>
				i === groupIndex ? { ...group, name } : group
			),
		}))
	}

	// Адаптер для конфигуратора v2
	const handleConfiguratorV2Complete = async (product: any) => {
		if (currentGroupIndex === null) return

		try {
			// Получаем правильный supplierCategoryId из API
			let supplierCategoryId = ''
			try {
				const apiUrl = `/api/supplier-categories?categoryId=${product.category.id}`
				logger.info('🔍 Fetching supplier categories:', {
					url: apiUrl,
					categoryId: product.category.id,
					supplierId: product.supplier.id,
					supplierIdType: typeof product.supplier.id,
				})

				const supplierCategories = await apiClient.get<any[]>(apiUrl)
				logger.info('📦 Received supplier categories:', {
					count: supplierCategories.length,
					categories: supplierCategories.map((sc: any) => ({
						id: sc.id,
						supplierId: sc.supplier?.id,
						supplierIdType: typeof sc.supplier?.id,
						supplierName: sc.supplier?.name,
						categoryId: sc.categoryId,
					})),
				})

				// Сравниваем с учетом типов (может быть number или string)
				const supplierCategory = supplierCategories.find((sc: any) => {
					const scSupplierId = Number(sc.supplier?.id)
					const productSupplierId = Number(product.supplier.id)
					const match = scSupplierId === productSupplierId
					
					if (!match) {
						logger.debug('🔍 Comparing:', {
							scSupplierId,
							scSupplierIdType: typeof sc.supplier?.id,
							productSupplierId,
							productSupplierIdType: typeof product.supplier.id,
							match,
						})
					}
					
					return match
				})

				if (supplierCategory) {
					supplierCategoryId = supplierCategory.id
					logger.info('✅ Found supplier category:', {
						supplierCategoryId,
						supplierName: supplierCategory.supplier?.name,
					})
				} else {
					logger.warn('⚠️ Supplier category not found:', {
						categoryId: product.category.id,
						categoryName: product.category.name,
						supplierId: product.supplier.id,
						supplierName: product.supplier.name,
						availableSuppliers: supplierCategories.map((sc: any) => ({
							id: sc.supplier?.id,
							name: sc.supplier?.name,
						})),
					})
				}
			} catch (error) {
				logger.error('❌ Error fetching supplier category:', error)
				if (error instanceof ApiError && error.status === 401) {
					return
				}
			}

			// Проверяем что supplierCategoryId был найден
			if (!supplierCategoryId) {
				const errorMessage =
					locale === 'ru'
						? `Ошибка: Не удалось найти связь между категорией "${product.category.name}" и поставщиком "${product.supplier.name}". Убедитесь, что поставщик добавлен в эту категорию.`
						: `Il fornitore "${product.supplier.name}" non lavora con la categoria "${product.category.name}".\n\nPer aggiungere questo prodotto, devi prima collegare il fornitore alla categoria nelle impostazioni.`
				toast.error(errorMessage, { duration: 5000 })
				logger.error('❌ Supplier category not found:', {
					categoryId: product.category.id,
					categoryName: product.category.name,
					supplierId: product.supplier.id,
					supplierName: product.supplier.name,
					supplierIdType: typeof product.supplier.id,
				})
				return
			}

			// Используем buildProductPosition для создания позиции с полными данными
			const position = buildProductPosition(product)

			// Устанавливаем supplierCategoryId
			position.supplierCategoryId = supplierCategoryId

			// Генерируем описание для обратной совместимости
			const description = generateProductDescription({
				categoryNameRu: position.categoryNameRu,
				categoryNameIt: position.categoryNameIt,
				supplierShortNameRu: position.supplierShortNameRu,
				supplierShortNameIt: position.supplierShortNameIt,
				supplierFullName: position.supplier?.name,
				modelValueRu: position.modelValueRu,
				modelValueIt: position.modelValueIt,
				parameters: position.parameters,
				locale,
			})
			position.description = description

			// Устанавливаем финансовые поля (БЕЗ автоматического расчета цены)
			const defaultVatRate = Number(vatRates.find(v => v.isDefault)?.percentage) || 0
			position.unitPrice = 0 // Цена вводится вручную
			position.vatRate = defaultVatRate
			position.quantity = 1
			position.discount = 0
			position.vatAmount = 0
			position.total = 0

			// Добавляем позицию в форму
			setFormData(prev => ({
				...prev,
				groups: prev.groups.map((group, i) =>
					i === currentGroupIndex
						? { ...group, positions: [...group.positions, position] }
						: group
				),
			}))

			setShowConfigurator(false)
			setCurrentGroupIndex(null)
		} catch (error: any) {
			logger.error('❌ Error creating product position:', error)
			const errorMessage =
				locale === 'ru'
					? error.message || 'Ошибка при создании товара'
					: error.message || 'Si è verificato un errore durante la creazione del prodotto. Riprova più tardi.'
			toast.error(errorMessage, { duration: 4000 })
		}
	}

	const generateDescription = async (
		config: Configuration,
		parameters?: any[]
	): Promise<string> => {
		// Генерируем описание продукта из параметров
		// Новые правила:
		// 1. Булевые параметры: "Название: Да/No"
		// 2. Системные размеры (Ширина×Высота): "ШxВ" после модели
		// 3. Остальные параметры: только значение (без названия)

		const parts: string[] = []
		let dimensionsPart = '' // Для размеров ШxВ
		const booleanParts: string[] = [] // Для булевых параметров

		// Если есть информация о параметрах, используем их названия
		if (parameters && parameters.length > 0) {
			// Сначала находим системные параметры размеров
			const widthParam = parameters.find(
				p => (p.name === 'Ширина' || p.nameIt === 'Larghezza') && p.isSystem
			)
			const heightParam = parameters.find(
				p => (p.name === 'Высота' || p.nameIt === 'Altezza') && p.isSystem
			)

			const widthValue = widthParam ? (config.parameters as unknown as Record<string, unknown>)[widthParam.id] : null
			const heightValue = heightParam ? (config.parameters as unknown as Record<string, unknown>)[heightParam.id] : null

			// Формируем строку размеров ШxВ
			if (widthValue && heightValue) {
				dimensionsPart = `${widthValue}x${heightValue}`
			} else if (widthValue) {
				dimensionsPart = `${widthValue}`
			} else if (heightValue) {
				dimensionsPart = `${heightValue}`
			}

			// Обрабатываем остальные параметры
			Object.entries(config.parameters).forEach(([paramId, value]) => {
				if (value === undefined || value === null || value === '') return

				// Находим параметр по ID
				const parameter = parameters.find(p => p.id === paramId)
				if (!parameter) {
					// Fallback для неизвестных параметров
					parts.push(String(value))
					return
				}

				// Пропускаем системные параметры размеров (они уже обработаны)
				if (parameter.isSystem) return

				const paramName =
					locale === 'ru' ? parameter.name : parameter.nameIt || parameter.name

				let formattedValue: string

				// Обработка множественных значений для TEXT параметров
				if (parameter.type === 'TEXT' && Array.isArray(value)) {
					formattedValue = value.filter(v => v && v.trim()).join(', ')
				} else {
					formattedValue = String(value)

					// Форматируем по типу параметра
					if (parameter.type === 'NUMBER') {
						const unit = parameter.unit ? ` ${parameter.unit}` : ''
						formattedValue = `${value}${unit}`
					} else if (
						(parameter.type === 'SELECT' || parameter.type === 'COLOR') &&
						parameter.values
					) {
						const valueObj = parameter.values.find(
							(v: any) => v.value === value
						)
						if (valueObj) {
							formattedValue =
								locale === 'ru'
									? valueObj.value
									: valueObj.valueIt || valueObj.value
							if (valueObj.ralCode) {
								formattedValue += ` (${valueObj.ralCode})`
							}
						}
					} else if (parameter.type === 'BOOLEAN') {
						// Булевые параметры: добавляем название + значение
						const boolValue = value === 'true' || value === true
						const boolText =
							locale === 'ru'
								? boolValue
									? 'Да'
									: 'Нет'
								: boolValue
								? 'Sì'
								: 'No'
						booleanParts.push(`${paramName}: ${boolText}`)
						return // Не добавляем в parts, добавим позже
					}
				}

				if (formattedValue) {
					// Для всех остальных типов: только значение (без названия параметра)
					parts.push(formattedValue)
				}
			})
		} else {
			// Fallback для случая когда нет информации о параметрах
			Object.entries(config.parameters).forEach(([paramId, value]) => {
				if (value === undefined || value === null || value === '') return
				parts.push(String(value))
			})
		}

		// Собираем финальное описание:
		// 1. Размеры (если есть)
		// 2. Остальные параметры (только значения)
		// 3. Булевые параметры (название: значение)
		// 4. Заметки
		const finalParts: string[] = []

		if (dimensionsPart) {
			finalParts.push(dimensionsPart)
		}

		finalParts.push(...parts)
		finalParts.push(...booleanParts)

		// Если есть заметки, добавляем их
		if (config.customNotes) {
			finalParts.push(`Note: ${config.customNotes}`)
		}

		return finalParts.length > 0 ? finalParts.join(' | ') : 'Продукт'
	}

	const updatePosition = (
		groupIndex: number,
		positionIndex: number,
		field: keyof ProposalPosition,
		value: any
	) => {
		setFormData(prev => ({
			...prev,
			groups: prev.groups.map((group, gi) =>
				gi === groupIndex
					? {
							...group,
							positions: group.positions.map((position, pi) =>
								pi === positionIndex
									? { ...position, [field]: value }
									: position
							),
					  }
					: group
			),
		}))
	}

	// Массовое применение НДС ко всем позициям группы
	const applyBulkVAT = (groupIndex: number, vatPercentage: number) => {
		setFormData(prev => ({
			...prev,
			groups: prev.groups.map((group, gi) =>
				gi === groupIndex
					? {
							...group,
							positions: group.positions.map(position => ({
								...position,
								vatRate: vatPercentage,
							})),
					  }
					: group
			),
		}))
	}

	const removePosition = (groupIndex: number, positionIndex: number) => {
		setFormData(prev => ({
			...prev,
			groups: prev.groups.map((group, gi) =>
				gi === groupIndex
					? {
							...group,
							positions: group.positions.filter(
								(_, pi) => pi !== positionIndex
							),
					  }
					: group
			),
		}))
	}

	const handleSave = async () => {
		if (!formData.clientId || formData.groups.length === 0) {
			toast.warning(t('selectClientAndAddGroups') || 'Выберите клиента и добавьте группы', {
				duration: 4000,
			})
			return
		}

		// Валидация позиций перед сохранением
		for (const group of formData.groups) {
			for (const position of group.positions) {
				if (!position.categoryId || !position.supplierCategoryId) {
					toast.error(
						locale === 'ru'
							? `Ошибка: Позиция "${position.description || 'без описания'}" не имеет категории или поставщика. Удалите позицию или добавьте её через конфигуратор.`
							: `Il prodotto "${position.description || 'senza descrizione'}" non è completo.\n\nPer salvarlo, devi aggiungerlo tramite il configuratore oppure rimuoverlo dalla lista.`,
						{ duration: 5000 }
					)
					setLoading(false)
					return
				}
			}
		}

		setLoading(true)
		try {
			await onSave(formData)
		} catch (error) {
			logger.error('Error saving proposal:', error)
			const errorMessage =
				locale === 'ru'
					? `Ошибка сохранения: ${error instanceof Error ? error.message : 'Unknown error'}`
					: error instanceof Error && error.message
					? `Impossibile salvare il preventivo: ${error.message}`
					: 'Si è verificato un errore durante il salvataggio. Riprova più tardi.'
			toast.error(errorMessage, { duration: 4000 })
		} finally {
			setLoading(false)
		}
	}

	const selectedClient = clients.find(c => c.id === formData.clientId)

	return (
		<div className='w-full max-w-[95vw]'>
			{/* ⚙️ СИСТЕМНАЯ ИНФОРМАЦИЯ */}
			<Card className='p-4 bg-gray-50 border-gray-300 mb-6'>
				<div className='flex items-center gap-2 mb-3'>
					<Settings className='h-5 w-5 text-gray-600' />
					<h3 className='font-semibold text-gray-700'>
						{t('systemInformation')}
					</h3>
				</div>

				<div className='grid grid-cols-2 md:grid-cols-5 gap-3'>
					{/* Номер документа (авто) */}
					<div>
						<Label className='text-xs text-gray-600 flex items-center gap-1'>
							<Hash className='h-3 w-3' />
							{t('proposalNumber')}
						</Label>
						<div className='font-mono font-semibold text-sm mt-1 bg-white px-3 py-2 rounded border h-9 flex items-center'>
							{proposal?.number || 'PROP-XXX'}
						</div>
					</div>

					{/* Дата */}
					<div>
						<Label className='text-xs text-gray-600 flex items-center gap-1'>
							<Calendar className='h-3 w-3' />
							{t('date')}
						</Label>
						<Input
							type='date'
							id='proposalDate'
							name='proposalDate'
							value={formData.proposalDate}
							onChange={e =>
								setFormData(prev => ({ ...prev, proposalDate: e.target.value }))
							}
							className='h-9 text-sm mt-1'
						/>
					</div>

					{/* Срок действия */}
					<div>
						<Label className='text-xs text-gray-600 flex items-center gap-1'>
							<Clock className='h-3 w-3' />
							{t('proposalValidUntil')}
						</Label>
						<Input
							type='date'
							id='validUntil'
							name='validUntil'
							value={formData.validUntil || ''}
							onChange={e =>
								setFormData(prev => ({ ...prev, validUntil: e.target.value }))
							}
							className='h-9 text-sm mt-1'
						/>
					</div>

					{/* Ответственный менеджер */}
					<div>
						<Label className='text-xs text-gray-600'>
							{t('responsibleManager')}
						</Label>
					<Input
						id='responsibleManager'
						name='responsibleManager'
						value={formData.responsibleManager || ''}
						onChange={e =>
							setFormData(prev => ({
								...prev,
								responsibleManager: e.target.value,
							}))
						}
						className='h-9 text-sm mt-1'
					/>
					</div>

					{/* Статус */}
					<div>
						<Label className='text-xs text-gray-600'>{t('status')}</Label>
						<Select
							value={formData.status || 'draft'}
							onValueChange={value => {
								const selectedStatus = documentStatuses.find(
									s => s.name === value
								)
								setFormData(prev => ({
									...prev,
									status: value,
									statusId: selectedStatus?.id || null,
								}))
							}}
						>
							<SelectTrigger className='h-9 text-sm mt-1'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{documentStatuses.map(status => (
									<SelectItem key={status.id} value={status.name}>
										<div className='flex items-center gap-2'>
											<div
												className='w-3 h-3 rounded-full'
												style={{ backgroundColor: status.color }}
											/>
											{locale === 'ru' ? status.nameRu : status.nameIt}
										</div>
									</SelectItem>
								))}
								<div className='border-t border-gray-200 mt-1 pt-1'>
									<button
										type='button'
										onClick={e => {
											e.stopPropagation()
											setShowStatusManager(true)
										}}
										className='w-full text-left px-2 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded flex items-center gap-1'
									>
										<Settings className='h-3 w-3' />
										{locale === 'ru'
											? '+ Управлять статусами'
											: '+ Gestisci stati'}
									</button>
								</div>
							</SelectContent>
						</Select>
					</div>
				</div>
			</Card>

			{/* Разделитель */}
			<div className='h-1 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 mb-6 rounded-full' />

			{/* 👤 ШАГ 1: ИНФОРМАЦИЯ О КЛИЕНТЕ */}
			<Card className='p-6 mb-6 border-2 border-blue-200'>
				<div className='flex items-center justify-between mb-4'>
					<div className='flex items-center gap-3'>
						<div
							className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
								selectedClient
									? 'bg-green-100 text-green-700'
									: 'bg-blue-100 text-blue-700'
							}`}
						>
							{selectedClient ? '✓' : '1'}
						</div>
						<div>
							<div className='text-xs text-gray-500'>
								{locale === 'ru' ? 'Шаг' : 'Passo'} 1 {locale === 'ru' ? 'из' : 'di'} 3
							</div>
							<h3 className='font-semibold text-lg'>{t('stepClientInfo')}</h3>
						</div>
					</div>
					{selectedClient && (
						<div className='text-green-600 font-medium text-sm'>
							✓ {locale === 'ru' ? 'Завершено' : 'Completato'}
						</div>
					)}
				</div>

				<div>
					{/* Клиент */}
					<div>
						{selectedClient ? (
							<div>
								<Label className='text-sm'>{t('client')} *</Label>
								<Card className='p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 mt-1'>
									<div className='flex items-start justify-between gap-4'>
										{/* Информация о клиенте */}
										<div className='flex-1 space-y-2'>
											<div className='font-semibold text-base text-gray-900'>
												{selectedClient.type === 'company' &&
												selectedClient.companyName
													? selectedClient.companyName
													: `${selectedClient.firstName} ${selectedClient.lastName}`}
											</div>
											<div className='space-y-1 text-sm'>
												{selectedClient.email && (
													<div className='flex items-center gap-2 text-gray-700'>
														<Mail className='h-4 w-4 text-blue-600' />
														<span>{selectedClient.email}</span>
													</div>
												)}
												{selectedClient.phone && (
													<div className='flex items-center gap-2 text-gray-700'>
														<Phone className='h-4 w-4 text-green-600' />
														<span>{selectedClient.phone}</span>
													</div>
												)}
											</div>
										</div>

										{/* Кнопки действий */}
										<div className='flex flex-col gap-2'>
											<Button
												variant='outline'
												size='sm'
												onClick={() => {
													// TODO: Интеграция с IP-телефонией
													toast.info(
														`${t('callClient')}: ${selectedClient.phone}`,
														{ duration: 3000 }
													)
												}}
												disabled={!selectedClient.phone}
												className='h-8 px-3 text-xs'
												title={t('callClient')}
											>
												<Phone className='h-3 w-3 mr-1' />
												{t('callClient')}
											</Button>
											<Button
												variant='outline'
												size='sm'
												onClick={() => {
													// TODO: Интеграция с email
													if (selectedClient.email) {
														window.location.href = `mailto:${selectedClient.email}`
													}
												}}
												disabled={!selectedClient.email}
												className='h-8 px-3 text-xs'
												title={t('sendEmail')}
											>
												<Mail className='h-3 w-3 mr-1' />
												Email
											</Button>
											<div className='flex gap-1'>
												<Button
													variant='ghost'
													size='sm'
													onClick={() => setShowEditClientModal(true)}
													className='h-8 px-2 text-xs flex-1'
													title='Редактировать клиента'
												>
													<Pencil className='h-3 w-3' />
												</Button>
												<Button
													variant='ghost'
													size='sm'
													onClick={() => {
														setFormData(prev => ({ ...prev, clientId: 0 }))
														setShowClientSearch(true)
													}}
													className='h-8 px-2 text-xs flex-1'
												>
													<X className='h-3 w-3' />
												</Button>
											</div>
										</div>
									</div>
								</Card>
							</div>
						) : (
							<div className='relative'>
								<Label className='text-sm flex items-center gap-2'>
									<Search className='h-4 w-4' />
									{t('client')} *
								</Label>
								<Input
									id='clientSearch'
									name='clientSearch'
									placeholder={t('searchClient')}
									value={clientSearchTerm}
									onChange={e => {
										setClientSearchTerm(e.target.value)
										setShowClientSearch(true)
									}}
									onFocus={() => setShowClientSearch(true)}
									onBlur={() => {
										// Задержка для обработки клика по элементу списка
										setTimeout(() => setShowClientSearch(false), 200)
									}}
									className='mt-1'
								/>

								{/* Выпадающий список прямо под полем (autocomplete) */}
								{showClientSearch && (
									<div className='absolute top-full left-0 right-0 z-50 mt-1 bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto'>
										{filteredClients.length > 0 ? (
											<div>
												{/* Показываем ограниченное количество или все */}
												<div className='divide-y'>
													{(showAllClients
														? filteredClients
														: filteredClients.slice(0, 4)
													).map(client => {
														const searchTerms = clientSearchTerm
															.trim()
															.toLowerCase()
															.split(/\s+/)
															.filter(term => term.length > 0)
														const fullName =
															client.type === 'company' && client.companyName
																? client.companyName
																: `${client.firstName} ${client.lastName}`
														return (
															<div
																key={client.id}
																className='p-3 hover:bg-blue-50 cursor-pointer transition-colors'
																onClick={() => handleClientSelect(client.id)}
															>
																<div className='font-medium text-sm'>
																	{highlightText(fullName, searchTerms)}
																</div>
																<div className='text-xs text-gray-600 mt-1'>
																	{highlightText(client.phone, searchTerms)}
																	{client.email &&
																		` • ${highlightText(
																			client.email,
																			searchTerms
																		)}`}
																</div>
															</div>
														)
													})}
												</div>

												{/* Кнопка "Показать все" если результатов больше 4 */}
												{filteredClients.length > 4 && !showAllClients && (
													<div className='p-3 border-t bg-gray-50'>
														<Button
															variant='outline'
															size='sm'
															onClick={() => setShowAllClients(true)}
															className='w-full'
														>
															📋 {t('showAllResults')} ({filteredClients.length}{' '}
															{t('showingResults').toLowerCase()})
														</Button>
													</div>
												)}

												{/* Показываем счетчик и кнопку скрыть если открыт полный список */}
												{showAllClients && filteredClients.length > 4 && (
													<div className='p-2 border-t bg-blue-50'>
														<div className='text-center text-xs text-blue-700 mb-2'>
															{t('showingResults')} {filteredClients.length}{' '}
															{t('of')} {filteredClients.length}
														</div>
														<Button
															variant='outline'
															size='sm'
															onClick={() => setShowAllClients(false)}
															className='w-full h-7 text-xs'
														>
															👁️ Скрыть
														</Button>
													</div>
												)}
											</div>
										) : (
											<div className='p-4 text-center'>
												<div className='text-sm text-gray-500 mb-3'>
													❌ {t('clientNotFoundInList')}
												</div>
												{clientSearchTerm && (
													<div className='text-xs text-blue-600 mb-3 p-2 bg-blue-50 rounded'>
														{(() => {
															const parsed = parseClientInput(clientSearchTerm)
															if (parsed?.email)
																return `📧 Email: ${parsed.email}`
															if (parsed?.phone)
																return `📞 Телефон: ${parsed.phone}`
															if (parsed?.firstName && parsed?.lastName)
																return `👤 Имя: ${parsed.firstName} ${parsed.lastName}`
															if (parsed?.firstName)
																return `👤 Имя: ${parsed.firstName}`
															if (parsed?.companyName)
																return `🏢 Компания: ${parsed.companyName}`
															return '💡 Введите имя, телефон или email'
														})()}
													</div>
												)}
												<div className='text-xs text-gray-400 mb-3'>
													{t('createNewClientPrompt')}
												</div>
												<Button
													onClick={handleCreateNewClient}
													variant='outline'
													size='sm'
													className='border-green-300 text-green-600 hover:bg-green-50 hover:text-green-700 hover:border-green-400'
												>
													<UserPlus className='h-4 w-4 mr-2' />
													{t('createNewClient')}
												</Button>
											</div>
										)}
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</Card>

			{/* Разделитель */}
			<div className='h-1 bg-gradient-to-r from-green-200 via-green-300 to-green-200 mb-6 rounded-full' />

			{/* 📦 ШАГ 2: ТОВАРЫ И УСЛУГИ */}
			<Card className='p-6 mb-6 border-2 border-green-200'>
				<div className='flex items-center justify-between mb-4'>
					<div className='flex items-center gap-3'>
						<div
							className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
								formData.groups.length > 0 &&
								formData.groups.some(g => g.positions.length > 0)
									? 'bg-green-100 text-green-700'
									: 'bg-blue-100 text-blue-700'
							}`}
						>
							{formData.groups.length > 0 &&
							formData.groups.some(g => g.positions.length > 0)
								? '✓'
								: '2'}
						</div>
						<div>
							<div className='text-xs text-gray-500'>
								{locale === 'ru' ? 'Шаг' : 'Passo'} 2 {locale === 'ru' ? 'из' : 'di'} 3
							</div>
							<h3 className='font-semibold text-lg'>{t('stepProducts')}</h3>
						</div>
					</div>
					{formData.groups.length > 0 &&
						formData.groups.some(g => g.positions.length > 0) && (
							<div className='text-green-600 font-medium text-sm'>
								✓ {locale === 'ru' ? 'Завершено' : 'Completato'}
							</div>
						)}
				</div>

				<div className='flex items-center justify-between mb-4'>
					<div className='text-sm text-gray-600'>{t('productList')}</div>
					<Button
						onClick={addGroup}
						size='sm'
						className='bg-green-600 hover:bg-green-700 text-white'
					>
						<Plus className='w-4 h-4 mr-2' />
						{t('addGroup')}
					</Button>
				</div>

				{formData.groups.length === 0 ? (
					<div className='text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg'>
						<p className='text-sm'>{t('noGroups')}</p>
					</div>
				) : (
					<div className='space-y-4'>
						{formData.groups.map((group, groupIndex) => (
							<Card key={group.id} className='p-4 bg-gray-50'>
								<div className='flex items-center justify-between mb-3'>
									<Input
										value={group.name}
										onChange={e => updateGroupName(groupIndex, e.target.value)}
										className='font-medium max-w-sm bg-white'
									/>
									<div className='flex items-center gap-2'>
										<Button
											variant='outline'
											size='sm'
											onClick={() => {
												setCurrentGroupIndex(groupIndex)
												setShowConfigurator(true)
											}}
										>
											<Plus className='w-4 h-4 mr-1' />
											{t('addProduct')}
										</Button>
										<Button
											variant='ghost'
											size='sm'
											onClick={() => removeGroup(groupIndex)}
										>
											<Trash2 className='w-4 h-4 text-red-600' />
										</Button>
									</div>
								</div>

								{/* Массовое применение НДС */}
								{group.positions.length > 0 && (
									<div className='flex items-center gap-2 mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200'>
										<span className='text-sm text-blue-800 font-medium'>
											⚡ {t('applyBulkVAT')}:
										</span>
										<Select
											value={bulkVatRate}
											onValueChange={rate => {
												setBulkVatRate(rate)
												const vatPercentage = parseFloat(rate)
												applyBulkVAT(groupIndex, vatPercentage)
											}}
										>
											<SelectTrigger className='w-32 h-8 bg-white'>
												<SelectValue placeholder={t('selectVatRate')} />
											</SelectTrigger>
											<SelectContent>
												{vatRates.map(rate => (
													<SelectItem
														key={rate.id}
														value={String(rate.percentage)}
													>
														{rate.percentage}%
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<span className='text-xs text-blue-600'>
											{t('applyVATToAll')}
										</span>
									</div>
								)}

								{/* Таблица */}
								{group.positions.length > 0 ? (
									<div className='bg-white rounded-lg overflow-hidden border'>
										<table className='w-full text-sm'>
											<thead className='bg-gray-100 border-b'>
												<tr>
													<th 
														className='text-left py-2 px-3 font-medium'
														style={{ width: '40%', maxWidth: '400px' }}
													>
														{t('description')}
													</th>
													<th
														className='text-center py-2 px-3 font-medium'
														style={{ width: '80px', minWidth: '80px' }}
													>
														{t('quantity')}
													</th>
													<th
														className='text-right py-2 px-3 font-medium'
														style={{ width: '100px', minWidth: '100px' }}
													>
														{t('price')}
													</th>
													<th
														className='text-center py-2 px-3 font-medium'
														style={{ width: '80px', minWidth: '80px' }}
													>
														{t('discount')}
													</th>
													<th
														className='text-center py-2 px-3 font-medium'
														style={{ width: '80px', minWidth: '80px' }}
													>
														{t('vat')}
													</th>
													<th
														className='text-right py-2 px-3 font-medium'
														style={{ width: '100px', minWidth: '100px' }}
													>
														{t('total')}
													</th>
													<th className='w-12'></th>
												</tr>
											</thead>
											<tbody className='divide-y'>
												{group.positions.map((position, positionIndex) => {
													// Генерируем описание товара
													const productDescription =
														position.categoryNameRu || position.categoryNameIt
															? generateProductDescription({
																	categoryNameRu: position.categoryNameRu,
																	categoryNameIt: position.categoryNameIt,
																	supplierShortNameRu:
																		position.supplierShortNameRu,
																	supplierShortNameIt:
																		position.supplierShortNameIt,
																	supplierFullName: position.supplier?.name,
																	modelValueRu: position.modelValueRu,
																	modelValueIt: position.modelValueIt,
																	parameters: position.parameters || [],
																	locale,
															  })
															: position.description || ''

													return (
														<tr key={position.id} className='hover:bg-gray-50'>
															<td 
																className='py-2 px-3 text-xs'
																style={{ 
																	width: '40%', 
																	maxWidth: '400px',
																	wordBreak: 'break-word'
																}}
															>
																<div className='flex flex-col'>
																	<div className='break-words whitespace-normal'>
																		{productDescription}
																	</div>
																	{/* Вторая строка: customNotes (Informazioni aggiuntive) */}
																	{position.customNotes && (
																		<div className='mt-1 text-xs text-gray-600 italic break-words whitespace-normal'>
																			{position.customNotes}
																		</div>
																	)}
																</div>
															</td>
															<td className='py-2 px-3'>
																<Input
																	type='number'
																	value={position.quantity || ''}
																	onChange={e =>
																		updatePosition(
																			groupIndex,
																			positionIndex,
																			'quantity',
																			e.target.value === ''
																				? 1
																				: parseFloat(e.target.value) || 1
																		)
																	}
																	onFocus={e => {
																		// При фокусе, если значение = 1, очищаем поле для удобства ввода
																		if (position.quantity === 1) {
																			e.target.select()
																		}
																	}}
																	placeholder='1'
																	className='text-center w-full h-8 text-xs'
																	min='1'
																	step='1'
																/>
															</td>
															<td className='py-2 px-3'>
																<Input
																	type='number'
																	value={
																		position.unitPrice === 0
																			? ''
																			: position.unitPrice
																	}
																	onChange={e =>
																		updatePosition(
																			groupIndex,
																			positionIndex,
																			'unitPrice',
																			e.target.value === ''
																				? 0
																				: parseFloat(e.target.value) || 0
																		)
																	}
																	onFocus={e => {
																		// При фокусе выделяем весь текст для быстрой замены
																		e.target.select()
																	}}
																	placeholder='0.00'
																	className='text-right w-full h-8 text-xs'
																	min='0'
																	step='0.01'
																/>
															</td>
															<td className='py-2 px-3'>
																<Input
																	type='number'
																	value={
																		position.discount === 0
																			? ''
																			: position.discount
																	}
																	onChange={e =>
																		updatePosition(
																			groupIndex,
																			positionIndex,
																			'discount',
																			e.target.value === ''
																				? 0
																				: parseFloat(e.target.value) || 0
																		)
																	}
																	onFocus={e => {
																		// При фокусе выделяем весь текст
																		e.target.select()
																	}}
																	placeholder='0'
																	className='text-center w-full h-8 text-xs'
																	min='0'
																	max='100'
																	step='1'
																/>
															</td>
															<td className='py-2 px-3'>
																<Select
																	value={String(position.vatRate)}
																	onValueChange={value =>
																		updatePosition(
																			groupIndex,
																			positionIndex,
																			'vatRate',
																			parseFloat(value)
																		)
																	}
																>
																	<SelectTrigger className='w-full h-8 text-xs'>
																		<SelectValue />
																	</SelectTrigger>
																	<SelectContent>
																		{vatRates.map(rate => (
																			<SelectItem
																				key={rate.id}
																				value={String(rate.percentage)}
																			>
																				{rate.percentage}%
																			</SelectItem>
																		))}
																	</SelectContent>
																</Select>
															</td>
															<td className='py-2 px-3 text-right font-medium text-green-600'>
																€{position.total.toFixed(2)}
															</td>
															<td className='py-2 px-3 text-center'>
																<Button
																	variant='ghost'
																	size='sm'
																	onClick={() =>
																		removePosition(groupIndex, positionIndex)
																	}
																	className='h-6 w-6 p-0'
																>
																	<X className='w-4 h-4 text-red-600' />
																</Button>
															</td>
														</tr>
													)
												})}
											</tbody>
										</table>
									</div>
								) : (
									<div className='text-center py-6 text-sm text-gray-500 bg-white rounded-lg border-2 border-dashed'>
										{t('noProductsInGroup')}
									</div>
								)}
							</Card>
						))}
					</div>
				)}
			</Card>

			{/* Итоги + Примечания в одну строку */}
			<div className='grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-3 mb-4'>
				{/* Примечания */}
				<Card className='p-4'>
					<Label htmlFor='notes' className='text-sm font-medium'>
						{t('notes')}
					</Label>
					<Textarea
						id='notes'
						value={formData.notes}
						onChange={e =>
							setFormData(prev => ({ ...prev, notes: e.target.value }))
						}
						placeholder={t('notes')}
						className='mt-2'
						rows={4}
					/>
				</Card>

				{/* 💰 ШАГ 3: ИТОГОВАЯ СУММА */}
				{formData.groups.length > 0 && (
					<Card className='p-4 border-2 border-green-200'>
						<div className='flex items-center justify-between mb-4'>
							<div className='flex items-center gap-3'>
								<div
									className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
										formData.total > 0
											? 'bg-green-100 text-green-700'
											: 'bg-blue-100 text-blue-700'
									}`}
								>
									{formData.total > 0 ? '✓' : '3'}
								</div>
								<div>
									<div className='text-xs text-gray-500'>
										{locale === 'ru' ? 'Шаг' : 'Passo'} 3 {locale === 'ru' ? 'из' : 'di'} 3
									</div>
									<h3 className='font-semibold text-lg'>{t('stepTotals')}</h3>
								</div>
							</div>
							{formData.total > 0 && (
								<div className='text-green-600 font-medium text-sm'>
									✓ {locale === 'ru' ? 'Завершено' : 'Completato'}
								</div>
							)}
						</div>

						<div className='space-y-2 text-sm'>
							{/* Промежуточный итог */}
							<div className='flex justify-between items-center py-1'>
								<span className='text-gray-600'>{t('subtotal')}</span>
								<span className='font-medium text-gray-900'>
									€{formData.subtotal.toFixed(2)}
								</span>
							</div>

							{/* Скидка */}
							{formData.discount > 0 && (
								<div className='flex justify-between items-center py-1'>
									<span className='text-gray-600'>{t('totalDiscount')}</span>
									<span className='font-medium text-red-600'>
										-€{formData.discount.toFixed(2)}
									</span>
								</div>
							)}

							{/* Итог без НДС */}
							<div className='flex justify-between items-center py-1'>
								<span className='text-gray-700 font-medium'>{t('subtotalBeforeVat')}</span>
								<span className='font-semibold text-gray-900'>
									€{(formData.subtotal - formData.discount).toFixed(2)}
								</span>
							</div>

							{/* НДС - показываем только если есть */}
							{formData.vatAmount > 0 && (
								<div className='flex justify-between items-center py-1'>
									<span className='text-gray-600'>{t('totalVat')}</span>
									<span className='font-medium text-gray-900'>
										€{formData.vatAmount.toFixed(2)}
									</span>
								</div>
							)}

							{/* Разделитель */}
							<div className='border-t border-gray-300 my-2' />

							{/* ИТОГО - выделен зеленым цветом */}
							<div className='space-y-2'>
								<div className='flex justify-between items-center py-2 px-3 bg-green-50 rounded-lg border border-green-200'>
									<span className='text-base font-semibold text-green-800'>
										{formData.vatAmount > 0 ? t('totalWithVat') : t('totalWithoutVat')}
									</span>
									<span className='text-2xl font-bold text-green-700'>
										€{formData.total.toFixed(2)}
									</span>
								</div>
								{/* Интерактивная информативная строка если без НДС */}
								{formData.vatAmount === 0 && (
									<TooltipProvider>
										<div className='pt-1'>
											<Tooltip delayDuration={200}>
												<TooltipTrigger asChild>
													<div className='flex items-center gap-1.5 text-xs text-gray-600 hover:text-amber-700 transition-colors cursor-help group'>
														<Info className='h-3.5 w-3.5 text-amber-600 group-hover:text-amber-700' />
														<span className='font-medium'>
															{locale === 'ru' 
																? 'Цена без НДС'
																: 'Prezzo senza IVA'}
														</span>
													</div>
												</TooltipTrigger>
												<TooltipContent side='top' className='max-w-xs'>
													<p className='text-xs leading-relaxed'>
														{locale === 'ru' 
															? 'Указанная сумма не включает НДС согласно применимому налоговому законодательству.'
															: 'L\'importo indicato non include l\'IVA secondo la normativa fiscale applicabile.'}
													</p>
												</TooltipContent>
											</Tooltip>
										</div>
									</TooltipProvider>
								)}
							</div>
						</div>
					</Card>
				)}
			</div>

			{/* Кнопки */}
			<div className='flex justify-end gap-3'>
				{/* Кнопка просмотра PDF (только для существующих предложений) */}
				{proposal?.id && onPreview && (
					<Button variant='outline' onClick={onPreview} disabled={loading}>
						<Eye className='w-4 h-4 mr-2' />
						PDF
					</Button>
				)}

				<Button
					variant='outline'
					onClick={onCancel}
					disabled={loading}
					className='border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400'
				>
					<X className='w-4 h-4 mr-2' />
					{t('cancel')}
				</Button>

				<Button
					onClick={handleSave}
					disabled={
						loading || !formData.clientId || formData.groups.length === 0
					}
					className='bg-green-600 hover:bg-green-700 text-white'
				>
					<Save className='w-4 h-4 mr-2' />
					{loading ? t('saving') : t('save')}
				</Button>
			</div>

			{/* Конфигуратор */}
			<ProductConfiguratorV2
				isOpen={showConfigurator}
				onClose={() => {
					setShowConfigurator(false)
					setCurrentGroupIndex(null)
				}}
				onProductCreated={handleConfiguratorV2Complete}
			/>

			{/* Модальное окно создания клиента */}
			<ClientFormModal
				isOpen={showNewClientModal}
				onClose={() => {
					setShowNewClientModal(false)
					setNewClientData(null)
				}}
				onSave={handleClientCreated}
				initialData={newClientData}
			/>

			{/* Модальное окно редактирования клиента */}
			<ClientFormModal
				isOpen={showEditClientModal}
				onClose={() => setShowEditClientModal(false)}
				onSave={handleClientUpdated}
				initialData={
					selectedClient
						? {
								type: selectedClient.type as 'individual' | 'company',
								firstName: selectedClient.firstName || '',
								lastName: selectedClient.lastName || '',
								companyName: selectedClient.companyName || '',
								phone: selectedClient.phone || '',
								email: selectedClient.email || '',
								address: selectedClient.address || '',
								codiceFiscale: selectedClient.codiceFiscale || '',
								partitaIVA: selectedClient.partitaIVA || '',
								legalAddress: selectedClient.legalAddress || '',
								contactPerson: selectedClient.contactPerson || '',
								source: selectedClient.source || '',
								notes: selectedClient.notes || '',
						  }
						: undefined
				}
			/>

			{/* Модальное окно управления статусами */}
			<Dialog open={showStatusManager} onOpenChange={setShowStatusManager}>
				<DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
					<DialogHeader>
						<DialogTitle>
							{locale === 'ru' ? 'Управление статусами' : 'Gestione Stati'}
						</DialogTitle>
					</DialogHeader>
					<DocumentStatusesManager />
				</DialogContent>
			</Dialog>
		</div>
	)
}
