'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLanguage } from '@/contexts/LanguageContext'
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
	ProductConfigurator,
	Configuration,
} from '@/components/product-configurator'
import { ClientFormModal } from '@/components/client-form-modal'
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
} from 'lucide-react'
import { calculateProductPrice } from '@/lib/price-calculator'

interface Client {
	id: number
	firstName?: string
	lastName?: string
	companyName?: string
	phone: string
	email?: string
	type: string
}

interface VATRate {
	id: string
	name: string
	percentage: number
	isDefault: boolean
}

interface ProposalPosition {
	id?: string
	categoryId: string
	supplierCategoryId: string
	configuration: Configuration
	unitPrice: number
	quantity: number
	discount: number
	vatRate: number
	vatAmount: number
	total: number
	description?: string
}

interface ProposalGroup {
	id?: string
	name: string
	description?: string
	positions: ProposalPosition[]
}

interface ProposalDocument {
	id?: string
	number?: string
	proposalDate?: string
	validUntil?: string
	clientId: number
	responsibleManager?: string
	status?: string
	groups: ProposalGroup[]
	vatRate: number
	subtotal: number
	discount: number
	vatAmount: number
	total: number
	notes?: string
}

interface ProposalFormProps {
	proposal?: ProposalDocument | any // Поддержка различных типов
	onSave: (proposal: any) => void
	onCancel: () => void
	onPreview?: () => void
}

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
	const { t } = useLanguage()
	const [clients, setClients] = useState<Client[]>([])
	const [vatRates, setVatRates] = useState<VATRate[]>([])
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
		vatRate: 22.0,
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
	}, [])

	// Обновляем formData когда приходит proposal для редактирования
	useEffect(() => {
		if (proposal) {
			setFormData({
				...proposal,
				proposalDate: proposal.proposalDate
					? new Date(proposal.proposalDate).toISOString().split('T')[0]
					: new Date().toISOString().split('T')[0],
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
			const response = await fetch('/api/clients')
			const data = await response.json()
			setClients(data)
			setFilteredClients(data)
		} catch (error) {
			console.error('Error fetching clients:', error)
		}
	}

	const fetchVATRates = async () => {
		try {
			const response = await fetch('/api/vat-rates')
			const data = await response.json()
			setVatRates(data)
			const defaultRate = data.find((rate: VATRate) => rate.isDefault)
			if (defaultRate && !proposal) {
				setFormData(prev => ({ ...prev, vatRate: defaultRate.percentage }))
			}
		} catch (error) {
			console.error('Error fetching VAT rates:', error)
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
			const response = await fetch('/api/clients', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(clientData),
			})

			if (response.ok) {
				const createdClient = await response.json()
				console.log('✅ Клиент создан:', createdClient)

				// Обновляем список клиентов
				await fetchClients()

				// Автоматически выбираем нового клиента
				setFormData(prev => ({ ...prev, clientId: createdClient.id }))
				setShowNewClientModal(false)
				setClientSearchTerm('')
				setShowClientSearch(false)
			} else {
				const error = await response.json()
				console.error('❌ Ошибка создания клиента:', error)
				alert(`${t('errorSaving')}: ${error.error || 'Unknown error'}`)
			}
		} catch (error) {
			console.error('❌ Ошибка:', error)
			alert(t('errorSaving'))
		}
	}

	const handleClientUpdated = async (clientData: any) => {
		try {
			if (!selectedClient) return

			// Обновляем клиента в БД
			const response = await fetch(`/api/clients/${selectedClient.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(clientData),
			})

			if (response.ok) {
				const updatedClient = await response.json()
				console.log('✅ Клиент обновлён:', updatedClient)

				// Обновляем список клиентов
				await fetchClients()

				// Закрываем модальное окно
				setShowEditClientModal(false)
			} else {
				const error = await response.json()
				console.error('❌ Ошибка обновления клиента:', error)
				alert(`${t('errorSaving')}: ${error.error || 'Unknown error'}`)
			}
		} catch (error) {
			console.error('❌ Ошибка обновления клиента:', error)
			alert(t('errorSaving'))
		}
	}

	// Умный парсинг ввода для создания клиента
	const parseClientInput = (input: string) => {
		const trimmed = input.trim()
		if (!trimmed) return null

		// Проверяем на email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (emailRegex.test(trimmed)) {
			return { email: trimmed }
		}

		// Проверяем на телефон (содержит цифры и +)
		const phoneRegex = /^[\+]?[\d\s\-\(\)]+$/
		if (phoneRegex.test(trimmed) && /\d/.test(trimmed)) {
			return { phone: trimmed }
		}

		// Проверяем на имя и фамилию (2 слова)
		const words = trimmed.split(/\s+/)
		if (words.length === 2) {
			return { firstName: words[0], lastName: words[1] }
		}

		// Если одно слово - считаем именем
		if (words.length === 1) {
			return { firstName: words[0] }
		}

		// Если больше 2 слов - считаем компанией
		return { companyName: trimmed }
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

	const handleConfiguratorComplete = async (config: Configuration) => {
		if (currentGroupIndex === null) return

		const defaultVatRate = vatRates.find(v => v.isDefault)?.percentage || 22.0

		// Генерируем умное описание продукта
		let description = 'Продукт'

		try {
			// Пытаемся загрузить параметры категории для форматирования
			const categoryParamsRes = await fetch(
				`/api/category-parameters?categoryId=${config.categoryId}`
			)
			if (categoryParamsRes.ok) {
				const categoryParams = await categoryParamsRes.json()
				const parts: string[] = []

				for (const cp of categoryParams) {
					const param = cp.parameter
					const value = config.parameters[param.id]

					if (value === undefined || value === null || value === '') continue

					let formattedValue = String(value)

					// Форматируем по типу
					if (param.type === 'NUMBER') {
						formattedValue = `${value}${param.unit || ''}`
					} else if (
						(param.type === 'SELECT' || param.type === 'COLOR') &&
						param.values
					) {
						const valueObj = param.values.find((v: any) => v.value === value)
						if (valueObj) {
							formattedValue = valueObj.valueIt || valueObj.value
							if (valueObj.ralCode) {
								formattedValue += ` (${valueObj.ralCode})`
							}
						}
					}

					parts.push(`${param.nameIt || param.name}: ${formattedValue}`)
				}

				if (config.customNotes) {
					parts.push(`Note: ${config.customNotes}`)
				}

				description = parts.length > 0 ? parts.join(' | ') : 'Продукт'
			}
		} catch (error) {
			console.error('Error generating description:', error)
			description = generateDescription(config)
		}

		// 🎯 АВТОМАТИЧЕСКИЙ РАСЧЕТ ЦЕНЫ на основе параметров продукта
		const priceBreakdown = calculateProductPrice(config)
		const calculatedPrice = priceBreakdown.total

		// Логируем детали расчета для отладки
		if (calculatedPrice > 0) {
			console.log('💰 Автоматический расчет цены:')
			console.log(priceBreakdown.details.join('\n'))
			console.log(`\n✅ Итоговая цена: €${calculatedPrice.toFixed(2)}`)
		}

		const newPosition: ProposalPosition = {
			id: Date.now().toString(),
			categoryId: config.categoryId,
			supplierCategoryId: config.supplierCategoryId,
			configuration: config,
			unitPrice: calculatedPrice, // Используем рассчитанную цену вместо 0
			quantity: 1,
			discount: 0,
			vatRate: defaultVatRate,
			vatAmount: 0,
			total: 0,
			description,
		}

		setFormData(prev => ({
			...prev,
			groups: prev.groups.map((group, i) =>
				i === currentGroupIndex
					? { ...group, positions: [...group.positions, newPosition] }
					: group
			),
		}))

		setShowConfigurator(false)
		setCurrentGroupIndex(null)
	}

	const generateDescription = (config: Configuration): string => {
		// Генерируем описание продукта из параметров
		// Формат: "Ширина: 1400мм, Высота: 2000мм, Материал: ПВХ, Цвет: Белый (RAL 9010)"

		const parts: string[] = []

		// Мапинг ID параметров к понятным названиям
		// Параметры теперь хранятся по ID, нужно их декодировать
		Object.entries(config.parameters).forEach(([paramId, value]) => {
			if (value === undefined || value === null || value === '') return

			// Для временной совместимости просто показываем значение
			// В будущем это будет заменено на реальные названия из БД
			parts.push(String(value))
		})

		// Если есть заметки, добавляем их
		if (config.customNotes) {
			parts.push(`Note: ${config.customNotes}`)
		}

		return parts.length > 0 ? parts.join(' | ') : 'Продукт'
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
			alert(t('selectClientAndAddGroups'))
			return
		}

		setLoading(true)
		try {
			await onSave(formData)
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
							onValueChange={value =>
								setFormData(prev => ({ ...prev, status: value }))
							}
						>
							<SelectTrigger className='h-9 text-sm mt-1'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='draft'>{t('draft')}</SelectItem>
								<SelectItem value='sent'>{t('sent')}</SelectItem>
								<SelectItem value='confirmed'>{t('confirmed')}</SelectItem>
								<SelectItem value='expired'>{t('expired')}</SelectItem>
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
								{t('step')} 1 {t('of')} 3
							</div>
							<h3 className='font-semibold text-lg'>{t('stepClientInfo')}</h3>
						</div>
					</div>
					{selectedClient && (
						<div className='text-green-600 font-medium text-sm'>
							✓ {t('completed')}
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
													alert(`${t('callClient')}: ${selectedClient.phone}`)
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
													onClick={() => {
														const parsedData =
															parseClientInput(clientSearchTerm)
														if (parsedData) {
															// Создаём клиента с предзаполненными данными
															const clientData = {
																type: 'individual',
																...parsedData,
																// Заполняем остальные поля по умолчанию
																firstName: parsedData.firstName || '',
																lastName: parsedData.lastName || '',
																companyName: parsedData.companyName || '',
																phone: parsedData.phone || '',
																email: parsedData.email || '',
																address: '',
																codiceFiscale: '',
																partitaIVA: '',
																legalAddress: '',
																contactPerson: '',
																source: 'Passaparola',
																notes: '',
															}
															handleClientCreated(clientData)
														} else {
															setShowNewClientModal(true)
														}
													}}
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
								{t('step')} 2 {t('of')} 3
							</div>
							<h3 className='font-semibold text-lg'>{t('stepProducts')}</h3>
						</div>
					</div>
					{formData.groups.length > 0 &&
						formData.groups.some(g => g.positions.length > 0) && (
							<div className='text-green-600 font-medium text-sm'>
								✓ {t('completed')}
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
													<th className='text-left py-2 px-3 font-medium'>
														{t('description')}
													</th>
													<th className='text-center py-2 px-3 font-medium w-20'>
														{t('quantity')}
													</th>
													<th className='text-right py-2 px-3 font-medium w-24'>
														{t('price')}
													</th>
													<th className='text-center py-2 px-3 font-medium w-20'>
														{t('discount')}
													</th>
													<th className='text-center py-2 px-3 font-medium w-20'>
														{t('vat')}
													</th>
													<th className='text-right py-2 px-3 font-medium w-24'>
														{t('total')}
													</th>
													<th className='w-12'></th>
												</tr>
											</thead>
											<tbody className='divide-y'>
												{group.positions.map((position, positionIndex) => (
													<tr key={position.id} className='hover:bg-gray-50'>
														<td className='py-2 px-3 text-xs'>
															<div className='flex items-center justify-between'>
																<span>{position.description}</span>
																{/* Индикатор автоматического расчета цены */}
																{position.unitPrice > 0 && (
																	<span
																		className='ml-2 text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded'
																		title='Цена рассчитана автоматически'
																	>
																		💰 AUTO
																	</span>
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
												))}
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
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4'>
				{/* Примечания */}
				<Card className='p-6'>
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
						rows={5}
					/>
				</Card>

				{/* Разделитель */}
				<div className='h-1 bg-gradient-to-r from-green-200 via-green-300 to-green-200 mb-6 rounded-full' />

				{/* 💰 ШАГ 3: ИТОГОВАЯ СУММА */}
				{formData.groups.length > 0 && (
					<Card className='p-6 border-2 border-green-200'>
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
										{t('step')} 3 {t('of')} 3
									</div>
									<h3 className='font-semibold text-lg'>{t('stepTotals')}</h3>
								</div>
							</div>
							{formData.total > 0 && (
								<div className='text-green-600 font-medium text-sm'>
									✓ {t('completed')}
								</div>
							)}
						</div>

						<div className='space-y-2 text-sm'>
							{/* Промежуточный итог */}
							<div className='flex justify-between'>
								<span className='text-gray-600'>{t('subtotal')}</span>
								<span className='font-medium'>
									€{formData.subtotal.toFixed(2)}
								</span>
							</div>

							{/* Скидка */}
							{formData.discount > 0 && (
								<div className='flex justify-between'>
									<span className='text-gray-600'>{t('totalDiscount')}</span>
									<span className='font-medium text-red-600'>
										-€{formData.discount.toFixed(2)}
									</span>
								</div>
							)}

							{/* Разделитель */}
							<div className='border-t my-2' />

							{/* Итог без НДС */}
							<div className='flex justify-between'>
								<span className='font-medium'>{t('subtotalBeforeVat')}</span>
								<span className='font-semibold'>
									€{(formData.subtotal - formData.discount).toFixed(2)}
								</span>
							</div>

							{/* НДС (отдельно) или уведомление о расчёте позже */}
							{formData.vatAmount > 0 ? (
								<div className='flex justify-between'>
									<span className='text-gray-600'>{t('totalVat')}</span>
									<span className='font-medium text-blue-600'>
										+€{formData.vatAmount.toFixed(2)}
									</span>
								</div>
							) : (
								<div className='flex justify-between'>
									<span className='text-gray-600'>{t('totalVat')}</span>
									<span className='font-medium text-amber-600'>
										{t('vatNotIncluded')}
									</span>
								</div>
							)}

							{/* Разделитель */}
							<div className='border-t border-gray-300 my-2' />

							{/* ИТОГО с НДС или без НДС */}
							<div className='flex justify-between items-center bg-green-50 -mx-4 px-4 py-3 rounded-lg'>
								<span className='text-lg font-bold text-green-800'>
									{formData.vatAmount > 0
										? t('totalWithVat')
										: t('totalWithoutVat')}
								</span>
								<span className='text-2xl font-bold text-green-600'>
									€{formData.total.toFixed(2)}
								</span>
							</div>

							{/* Важное уведомление, если НДС = 0 */}
							{formData.vatAmount === 0 && (
								<div className='mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg'>
									<div className='flex items-start gap-2'>
										<span className='text-amber-600 text-lg'>⚠️</span>
										<div className='text-xs text-amber-800'>
											<strong>{t('important')}:</strong>{' '}
											{t('vatWillBeCalculatedLater')}
										</div>
									</div>
								</div>
							)}
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
			<Dialog open={showConfigurator} onOpenChange={setShowConfigurator}>
				<DialogContent className='max-w-6xl max-h-[90vh] overflow-y-auto'>
					<DialogHeader>
						<DialogTitle>{t('productConfigurator')}</DialogTitle>
					</DialogHeader>
					<ProductConfigurator
						onComplete={handleConfiguratorComplete}
						onCancel={() => {
							setShowConfigurator(false)
							setCurrentGroupIndex(null)
						}}
					/>
				</DialogContent>
			</Dialog>

			{/* Модальное окно создания клиента */}
			<ClientFormModal
				isOpen={showNewClientModal}
				onClose={() => setShowNewClientModal(false)}
				onSave={handleClientCreated}
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
		</div>
	)
}
