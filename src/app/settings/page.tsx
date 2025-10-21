'use client'

import { useState, useEffect } from 'react'
import { DashboardLayoutStickerV2 } from '@/components/dashboard-layout-sticker-v2'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import {
	Settings as SettingsIcon,
	Save,
	X,
	Globe,
	Plus,
	Edit,
	Trash2,
	Tag,
	Upload,
	Image as ImageIcon,
	Building2,
	Mail,
	Phone,
	MapPin,
	BookOpen,
	ChevronDown,
	ChevronUp,
} from 'lucide-react'
import { DictionariesManager } from '@/components/dictionaries-manager'
import { VATRatesManager } from '@/components/vat-rates-manager'
import { ProductCategoriesManager } from '@/components/product-categories-manager'
import { ParametersManager } from '@/components/parameters-manager'
import { UserSuggestionsAdmin } from '@/components/user-suggestions-admin'
import { PendingApprovalsAdmin } from '@/components/pending-approvals-admin'
import { useLanguage } from '@/contexts/LanguageContext'
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface Currency {
	code: string
	name: string
	symbol: string
}

interface Status {
	id: number
	name: string
	color: string
	isDefault: boolean
}

const CURRENCIES: Currency[] = [
	{ code: 'EUR', name: 'Евро', symbol: '€' },
	{ code: 'RUB', name: 'Российский рубль', symbol: '₽' },
	{ code: 'USD', name: 'Доллар США', symbol: '$' },
]

export default function SettingsPage() {
	const { t } = useLanguage()
	const [selectedCurrency, setSelectedCurrency] = useState<string>('EUR')
	const [isSaving, setIsSaving] = useState(false)
	const [favicon, setFavicon] = useState<string>('')
	const [faviconPreview, setFaviconPreview] = useState<string>('')

	// Collapsible states
	const [isCompanyOpen, setIsCompanyOpen] = useState(true)
	const [isFaviconOpen, setIsFaviconOpen] = useState(false)
	const [isStatusesOpen, setIsStatusesOpen] = useState(false)
	const [isVATOpen, setIsVATOpen] = useState(false)
	const [isDictionariesOpen, setIsDictionariesOpen] = useState(false)

	// Состояние для данных компании
	const [companyData, setCompanyData] = useState({
		name: 'PUNTO INFISSI',
		phone: '',
		email: '',
		address: '',
	})

	// Состояние для логотипа
	const [logo, setLogo] = useState<string>('')
	const [logoPreview, setLogoPreview] = useState<string>('')

	// Состояние для справочника статусов
	const [statuses, setStatuses] = useState<Status[]>([
		{ id: 1, name: 'Черновик', color: 'gray', isDefault: true },
		{ id: 2, name: 'Отправлено', color: 'blue', isDefault: false },
		{ id: 3, name: 'В производстве', color: 'yellow', isDefault: false },
		{ id: 4, name: 'Готово', color: 'green', isDefault: false },
		{ id: 5, name: 'Отменен', color: 'red', isDefault: false },
	])
	const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
	const [editingStatus, setEditingStatus] = useState<Status | null>(null)
	const [statusFormData, setStatusFormData] = useState({
		name: '',
		color: 'blue',
		isDefault: false,
	})

	// Загружаем сохраненные настройки при монтировании
	useEffect(() => {
		// Загружаем данные из базы данных
		const loadOrganizationData = async () => {
			try {
				const response = await fetch('/api/organization')
				if (response.ok) {
					const org = await response.json()

					// Логотип из БД
					if (org.logoUrl) {
						setLogo(org.logoUrl)
						setLogoPreview(org.logoUrl)
						localStorage.setItem('punto-infissi-logo-path', org.logoUrl)
						window.dispatchEvent(new Event('logo-updated'))
					}

					// Фавикон из БД
					if (org.faviconUrl) {
						setFavicon(org.faviconUrl)
						setFaviconPreview(org.faviconUrl)
						localStorage.setItem('punto-infissi-favicon-path', org.faviconUrl)
						window.dispatchEvent(new Event('favicon-updated'))
					}

					// Данные компании
					if (org.name) {
						setCompanyData(prev => ({
							...prev,
							name: org.name,
						}))
					}

					console.log('✅ Loaded organization data from database')
				}
			} catch (error) {
				console.error('❌ Failed to load organization data:', error)

				// Fallback: пробуем загрузить из localStorage
				const savedFaviconPath = localStorage.getItem(
					'punto-infissi-favicon-path'
				)
				if (savedFaviconPath) {
					setFavicon(savedFaviconPath)
					setFaviconPreview(savedFaviconPath)
				}

				const savedLogoPath = localStorage.getItem('punto-infissi-logo-path')
				if (savedLogoPath) {
					setLogo(savedLogoPath)
					setLogoPreview(savedLogoPath)
				}

				const savedCompanyData = localStorage.getItem(
					'punto-infissi-company-data'
				)
				if (savedCompanyData) {
					try {
						setCompanyData(JSON.parse(savedCompanyData))
					} catch (e) {
						console.error('Ошибка загрузки данных компании:', e)
					}
				}
			}
		}

		loadOrganizationData()
	}, [])

	const handleFaviconUpload = async (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = e.target.files?.[0]
		if (!file) return

		// Показываем предпросмотр
		const reader = new FileReader()
		reader.onloadend = () => {
			setFaviconPreview(reader.result as string)
		}
		reader.readAsDataURL(file)

		// Загружаем файл на сервер
		const formData = new FormData()
		formData.append('file', file)

		try {
			const response = await fetch('/api/favicon', {
				method: 'POST',
				body: formData,
			})

			const data = await response.json()

			if (data.success) {
				setFavicon(data.path)
				// Оставляем превью как base64 для немедленного отображения
				// (faviconPreview уже установлен через FileReader выше)
				// Сохраняем путь в localStorage
				localStorage.setItem('punto-infissi-favicon-path', data.path)
				// Триггерим событие для немедленного обновления
				window.dispatchEvent(new Event('favicon-updated'))
				alert('Фавикон загружен и применен!')
			} else {
				alert('Ошибка загрузки: ' + data.error)
				// Сбрасываем превью при ошибке
				setFaviconPreview('')
			}
		} catch (error) {
			console.error('Ошибка загрузки фавикона:', error)
			alert('Ошибка загрузки файла на сервер')
		}
	}

	const handleFaviconReset = async () => {
		try {
			const response = await fetch('/api/favicon', {
				method: 'DELETE',
			})

			const data = await response.json()

			if (data.success) {
				setFavicon('')
				setFaviconPreview('')
				localStorage.removeItem('punto-infissi-favicon-path')
				window.dispatchEvent(new Event('favicon-updated'))
				alert('Фавикон сброшен!')
			}
		} catch (error) {
			console.error('Ошибка сброса фавикона:', error)
			alert('Ошибка сброса фавикона')
		}
	}

	// Обработчики для логотипа
	const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		// Показываем предпросмотр
		const reader = new FileReader()
		reader.onloadend = () => {
			setLogoPreview(reader.result as string)
		}
		reader.readAsDataURL(file)

		// Загружаем файл на сервер
		const formData = new FormData()
		formData.append('file', file)

		try {
			const response = await fetch('/api/logo', {
				method: 'POST',
				body: formData,
			})

			const data = await response.json()

			if (data.success) {
				setLogo(data.path)
				// Сохраняем путь в localStorage
				localStorage.setItem('punto-infissi-logo-path', data.path)
				// Триггерим событие для немедленного обновления
				window.dispatchEvent(new Event('logo-updated'))
				alert('Логотип загружен и применен!')
			} else {
				alert('Ошибка загрузки: ' + data.error)
				// Сбрасываем превью при ошибке
				setLogoPreview('')
			}
		} catch (error) {
			console.error('Ошибка загрузки логотипа:', error)
			alert('Ошибка загрузки файла на сервер')
		}
	}

	const handleLogoReset = async () => {
		try {
			const response = await fetch('/api/logo', {
				method: 'DELETE',
			})

			const data = await response.json()

			if (data.success) {
				setLogo('')
				setLogoPreview('')
				localStorage.removeItem('punto-infissi-logo-path')
				window.dispatchEvent(new Event('logo-updated'))
				alert('Логотип сброшен!')
			}
		} catch (error) {
			console.error('Ошибка сброса логотипа:', error)
			alert('Ошибка сброса логотипа')
		}
	}

	const handleSave = async () => {
		setIsSaving(true)

		// Сохраняем настройки в localStorage
		localStorage.setItem('punto-infissi-currency', selectedCurrency)
		localStorage.setItem('punto-infissi-statuses', JSON.stringify(statuses))
		localStorage.setItem(
			'punto-infissi-company-data',
			JSON.stringify(companyData)
		)

		// Имитация сохранения
		await new Promise(resolve => setTimeout(resolve, 500))

		setIsSaving(false)
		alert('Настройки сохранены!')
	}

	const currentCurrency = CURRENCIES.find(c => c.code === selectedCurrency)

	// Обработчики для справочника статусов
	const handleStatusSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		if (editingStatus) {
			// Если устанавливаем основной статус, снимаем флаг с других
			if (statusFormData.isDefault) {
				setStatuses(
					statuses.map(status =>
						status.id === editingStatus.id
							? { ...status, ...statusFormData }
							: { ...status, isDefault: false }
					)
				)
			} else {
				setStatuses(
					statuses.map(status =>
						status.id === editingStatus.id
							? { ...status, ...statusFormData }
							: status
					)
				)
			}
		} else {
			const newStatus: Status = {
				id: Math.max(...statuses.map(s => s.id)) + 1,
				...statusFormData,
			}
			// Если новый статус основной, снимаем флаг с других
			if (statusFormData.isDefault) {
				setStatuses([
					...statuses.map(s => ({ ...s, isDefault: false })),
					newStatus,
				])
			} else {
				setStatuses([...statuses, newStatus])
			}
		}

		setIsStatusDialogOpen(false)
		setEditingStatus(null)
		setStatusFormData({ name: '', color: 'blue', isDefault: false })
	}

	const handleEditStatus = (status: Status) => {
		setEditingStatus(status)
		setStatusFormData({
			name: status.name,
			color: status.color,
			isDefault: status.isDefault,
		})
		setIsStatusDialogOpen(true)
	}

	const handleDeleteStatus = (id: number) => {
		if (!confirm('Вы уверены, что хотите удалить этот статус?')) return
		setStatuses(statuses.filter(status => status.id !== id))
	}

	const getColorBadgeVariant = (color: string) => {
		switch (color) {
			case 'red':
				return 'destructive'
			case 'green':
				return 'default'
			case 'yellow':
				return 'secondary'
			case 'blue':
				return 'default'
			case 'gray':
				return 'outline'
			default:
				return 'secondary'
		}
	}

	return (
		<DashboardLayoutStickerV2>
			<div className='space-y-6'>
				<div>
					<h1 className='text-3xl font-bold text-gray-900'>{t('settings')}</h1>
					<p className='text-gray-600'>{t('systemSettings')}</p>
				</div>

				{/* Настройки компании */}
				<Collapsible open={isCompanyOpen} onOpenChange={setIsCompanyOpen}>
					<Card>
						<CollapsibleTrigger className='w-full'>
							<CardHeader className='cursor-pointer hover:bg-gray-50 transition-colors'>
								<CardTitle className='flex items-center justify-between'>
									<div className='flex items-center gap-2'>
										<Building2 className='h-5 w-5' />
										{t('companySettings')}
									</div>
									{isCompanyOpen ? (
										<ChevronUp className='h-5 w-5 text-gray-400' />
									) : (
										<ChevronDown className='h-5 w-5 text-gray-400' />
									)}
								</CardTitle>
							</CardHeader>
						</CollapsibleTrigger>
						<CollapsibleContent>
							<CardContent className='space-y-6 pt-0'>
								{/* Логотип компании */}
								<div>
									<Label htmlFor='logo'>Логотип компании</Label>
									<div className='mt-2 flex items-center gap-4'>
										<div className='flex-1'>
											<Input
												id='logo'
												type='file'
												accept='image/png,image/jpeg,image/jpg,image/webp,image/svg+xml'
												onChange={handleLogoUpload}
												className='cursor-pointer'
											/>
										</div>
										{logoPreview && (
											<div className='w-20 h-12 border rounded-lg flex items-center justify-center bg-gray-50'>
												<img
													src={logoPreview}
													alt='Logo preview'
													className='max-h-10 max-w-16 object-contain'
												/>
											</div>
										)}
									</div>
									<p className='text-sm text-gray-500 mt-1'>
										Рекомендуемый размер: до 350x100 пикселей (PNG, JPEG, WebP,
										SVG)
									</p>
									{logoPreview && (
										<div className='mt-3'>
											<Button
												variant='outline'
												size='sm'
												onClick={handleLogoReset}
												className='w-full text-red-600 hover:bg-red-50 border-red-300 hover:border-red-400'
											>
												Сбросить логотип
											</Button>
										</div>
									)}
								</div>

								<Separator />

								{/* Данные компании */}
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div>
										<Label htmlFor='companyName'>Название компании *</Label>
										<Input
											id='companyName'
											value={companyData.name}
											onChange={e =>
												setCompanyData({ ...companyData, name: e.target.value })
											}
											placeholder='Введите название компании'
											className='mt-2'
										/>
									</div>
									<div>
										<Label htmlFor='companyPhone'>Телефон</Label>
										<Input
											id='companyPhone'
											value={companyData.phone}
											onChange={e =>
												setCompanyData({
													...companyData,
													phone: e.target.value,
												})
											}
											placeholder='+7 (999) 123-45-67'
											className='mt-2'
										/>
									</div>
									<div>
										<Label htmlFor='companyEmail'>Email</Label>
										<Input
											id='companyEmail'
											type='email'
											value={companyData.email}
											onChange={e =>
												setCompanyData({
													...companyData,
													email: e.target.value,
												})
											}
											placeholder='info@company.com'
											className='mt-2'
										/>
									</div>
									<div>
										<Label htmlFor='companyAddress'>Адрес</Label>
										<Input
											id='companyAddress'
											value={companyData.address}
											onChange={e =>
												setCompanyData({
													...companyData,
													address: e.target.value,
												})
											}
											placeholder='г. Москва, ул. Примерная, д. 1'
											className='mt-2'
										/>
									</div>
								</div>

								{/* Информация о печатных формах */}
								<div className='p-4 bg-blue-50 rounded-lg'>
									<h4 className='font-medium text-blue-900 mb-2'>
										📄 Использование в документах
									</h4>
									<p className='text-sm text-blue-800'>
										Логотип и данные компании будут автоматически использоваться
										при формировании:
									</p>
									<ul className='text-sm text-blue-700 mt-2 space-y-1'>
										<li>• Счетов и счетов-фактур</li>
										<li>• Договоров и предложений</li>
										<li>• Накладных и актов</li>
										<li>• Других печатных форм</li>
									</ul>
								</div>
							</CardContent>
						</CollapsibleContent>
					</Card>
				</Collapsible>

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
					{/* Фавикон */}
					<Collapsible open={isFaviconOpen} onOpenChange={setIsFaviconOpen}>
						<Card>
							<CollapsibleTrigger className='w-full'>
								<CardHeader className='cursor-pointer hover:bg-gray-50 transition-colors'>
									<CardTitle className='flex items-center justify-between'>
										<div className='flex items-center gap-2'>
											<ImageIcon className='h-5 w-5' />
											{t('siteFavicon')}
										</div>
										{isFaviconOpen ? (
											<ChevronUp className='h-5 w-5 text-gray-400' />
										) : (
											<ChevronDown className='h-5 w-5 text-gray-400' />
										)}
									</CardTitle>
								</CardHeader>
							</CollapsibleTrigger>
							<CollapsibleContent>
								<CardContent className='space-y-4 pt-0'>
									<div>
										<Label htmlFor='favicon'>Загрузить фавикон</Label>
										<div className='mt-2 flex items-center gap-4'>
											<div className='flex-1'>
												<Input
													id='favicon'
													type='file'
													accept='image/png,image/x-icon,image/svg+xml'
													onChange={handleFaviconUpload}
													className='cursor-pointer'
												/>
											</div>
											{faviconPreview && (
												<div className='w-16 h-16 border rounded-lg flex items-center justify-center bg-gray-50'>
													<img
														src={faviconPreview}
														alt='Favicon preview'
														className='w-8 h-8 object-contain'
													/>
												</div>
											)}
										</div>
										<p className='text-sm text-gray-500 mt-1'>
											Рекомендуемый размер: 32x32 или 64x64 пикселей (PNG, ICO,
											SVG)
										</p>
									</div>

									{faviconPreview && (
										<div className='space-y-3'>
											<div className='p-3 bg-green-50 rounded-lg'>
												<p className='text-sm font-medium text-green-900'>
													✅ Фавикон загружен и применен!
												</p>
												<p className='text-xs text-green-700 mt-1'>
													Посмотрите на вкладку браузера - иконка должна
													измениться
												</p>
											</div>
											<Button
												variant='outline'
												size='sm'
												onClick={handleFaviconReset}
												className='w-full text-red-600 hover:bg-red-50 border-red-300 hover:border-red-400'
											>
												Сбросить фавикон
											</Button>
										</div>
									)}
								</CardContent>
							</CollapsibleContent>
						</Card>
					</Collapsible>

					{/* Валюта */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Globe className='h-5 w-5' />
								Валюта
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div>
								<Label htmlFor='currency'>Основная валюта</Label>
								<Select
									value={selectedCurrency}
									onValueChange={setSelectedCurrency}
								>
									<SelectTrigger className='mt-2'>
										<SelectValue placeholder='Выберите валюту' />
									</SelectTrigger>
									<SelectContent>
										{CURRENCIES.map(currency => (
											<SelectItem key={currency.code} value={currency.code}>
												<span className='flex items-center gap-2'>
													<span className='font-medium'>{currency.symbol}</span>
													<span>
														{currency.name} ({currency.code})
													</span>
												</span>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<p className='text-sm text-gray-500 mt-1'>
									Валюта по умолчанию для всех расчетов и документов
								</p>
							</div>

							{currentCurrency && (
								<div className='p-3 bg-blue-50 rounded-lg'>
									<p className='text-sm font-medium text-blue-900'>
										Текущая валюта: {currentCurrency.symbol}{' '}
										{currentCurrency.name}
									</p>
									<p className='text-xs text-blue-700 mt-1'>
										Все цены будут отображаться в этой валюте
									</p>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Информация о системе */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<SettingsIcon className='h-5 w-5' />
								Информация о системе
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div>
								<Label>Версия системы</Label>
								<p className='text-sm text-gray-600 mt-1'>v1.0.0</p>
							</div>
							<Separator />
							<div>
								<Label>Дата последнего обновления</Label>
								<p className='text-sm text-gray-600 mt-1'>
									{new Date().toLocaleDateString('ru-RU')}
								</p>
							</div>
							<Separator />
							<div>
								<Label>Статус системы</Label>
								<div className='flex items-center gap-2 mt-1'>
									<div className='w-2 h-2 bg-green-500 rounded-full'></div>
									<p className='text-sm text-gray-600'>Активна</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Справочник статусов */}
				<Card>
					<CardHeader>
						<div className='flex justify-between items-center'>
							<CardTitle className='flex items-center gap-2'>
								<Tag className='h-5 w-5' />
								Справочник статусов
							</CardTitle>
							<Dialog
								open={isStatusDialogOpen}
								onOpenChange={setIsStatusDialogOpen}
							>
								<DialogTrigger asChild>
									<Button
										size='sm'
										onClick={() => {
											setEditingStatus(null)
											setStatusFormData({
												name: '',
												color: 'blue',
												isDefault: false,
											})
										}}
									>
										<Plus className='h-4 w-4 mr-2' />
										Добавить статус
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>
											{editingStatus ? 'Редактировать статус' : 'Новый статус'}
										</DialogTitle>
										<DialogDescription>
											{editingStatus
												? 'Измените данные статуса'
												: 'Создайте новый статус для заказов и предложений'}
										</DialogDescription>
									</DialogHeader>
									<form onSubmit={handleStatusSubmit} className='space-y-4'>
										<div>
											<Label htmlFor='statusName'>Название *</Label>
											<Input
												id='statusName'
												value={statusFormData.name}
												onChange={e =>
													setStatusFormData({
														...statusFormData,
														name: e.target.value,
													})
												}
												required
												placeholder='Например: В работе'
											/>
										</div>
										<div>
											<Label htmlFor='statusColor'>Цвет</Label>
											<Select
												value={statusFormData.color}
												onValueChange={value =>
													setStatusFormData({ ...statusFormData, color: value })
												}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value='gray'>Серый</SelectItem>
													<SelectItem value='blue'>Синий</SelectItem>
													<SelectItem value='green'>Зелёный</SelectItem>
													<SelectItem value='yellow'>Жёлтый</SelectItem>
													<SelectItem value='red'>Красный</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className='flex items-center space-x-2'>
											<Checkbox
												id='isDefault'
												checked={statusFormData.isDefault}
												onCheckedChange={checked =>
													setStatusFormData({
														...statusFormData,
														isDefault: checked as boolean,
													})
												}
											/>
											<Label
												htmlFor='isDefault'
												className='font-normal cursor-pointer'
											>
												Основной статус (по умолчанию)
											</Label>
										</div>
										<p className='text-sm text-gray-500'>
											Основной статус будет автоматически присваиваться новым
											записям
										</p>
										<div className='flex justify-end gap-3'>
											<Button
												type='button'
												variant='outline'
												onClick={() => setIsStatusDialogOpen(false)}
												className='border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400'
											>
												<X className='h-4 w-4 mr-2' />
												Отмена
											</Button>
											<Button
												type='submit'
												className='bg-green-600 hover:bg-green-700 text-white'
											>
												<Save className='h-4 w-4 mr-2' />
												{editingStatus ? 'Сохранить' : 'Создать'}
											</Button>
										</div>
									</form>
								</DialogContent>
							</Dialog>
						</div>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Название</TableHead>
									<TableHead>Цвет</TableHead>
									<TableHead>Статус</TableHead>
									<TableHead className='text-right'>Действия</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{statuses.map(status => (
									<TableRow key={status.id}>
										<TableCell className='font-medium'>{status.name}</TableCell>
										<TableCell>
											<Badge variant={getColorBadgeVariant(status.color)}>
												{status.color}
											</Badge>
										</TableCell>
										<TableCell>
											{status.isDefault && (
												<Badge variant='default'>Основной</Badge>
											)}
										</TableCell>
										<TableCell className='text-right'>
											<div className='flex justify-end space-x-2'>
												<Button
													variant='outline'
													size='sm'
													onClick={() => handleEditStatus(status)}
												>
													<Edit className='h-4 w-4' />
												</Button>
												<Button
													variant='outline'
													size='sm'
													onClick={() => handleDeleteStatus(status.id)}
													className='text-red-600 hover:bg-red-50'
												>
													<Trash2 className='h-4 w-4' />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>

						{statuses.length === 0 && (
							<div className='text-center py-8 text-gray-500'>
								Статусы не добавлены
							</div>
						)}
					</CardContent>
				</Card>

				{/* Дополнительные настройки */}
				<Card>
					<CardHeader>
						<CardTitle>Дополнительные настройки</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div>
								<Label>Уведомления по email</Label>
								<p className='text-sm text-gray-500 mt-1'>
									Получать уведомления о новых заказах
								</p>
							</div>
							<div className='flex items-center justify-end'>
								<Select defaultValue='enabled'>
									<SelectTrigger className='w-32'>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='enabled'>Включено</SelectItem>
										<SelectItem value='disabled'>Отключено</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<Separator />

						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div>
								<Label>Автоматическое сохранение</Label>
								<p className='text-sm text-gray-500 mt-1'>
									Автоматически сохранять изменения каждые 5 минут
								</p>
							</div>
							<div className='flex items-center justify-end'>
								<Select defaultValue='enabled'>
									<SelectTrigger className='w-32'>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='enabled'>Включено</SelectItem>
										<SelectItem value='disabled'>Отключено</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Справочники */}
				<Card className='sticker-card-v2'>
					<CardHeader>
						<div className='flex items-center gap-2'>
							<BookOpen className='h-5 w-5 text-gray-600' />
							<div>
								<CardTitle>Справочники</CardTitle>
								<p className='text-sm text-gray-600 mt-1'>
									Управление справочниками системы
								</p>
							</div>
						</div>
					</CardHeader>
					<CardContent className='space-y-6'>
						{/* Источники клиентов */}
						<DictionariesManager
							type='sources'
							title='Источники клиентов'
							description='Откуда клиенты узнают о вашей компании'
						/>

						{/* Категории продуктов */}
						<ProductCategoriesManager />

						{/* Параметры продуктов */}
						<div className='mt-8'>
							<h3 className='text-base font-semibold mb-4'>
								Параметры продуктов / Parametri prodotti
							</h3>
							<ParametersManager />
						</div>

						{/* Параметры на согласовании - НОВАЯ СИСТЕМА */}
						<div className='mt-8'>
							<h3 className='text-base font-semibold mb-4'>
								Параметры на согласовании / Pending approvals
							</h3>
							<PendingApprovalsAdmin />
						</div>

						{/* Предложения пользователей - СТАРАЯ СИСТЕМА */}
						<div className='mt-8'>
							<h3 className='text-base font-semibold mb-4 text-gray-400'>
								[Устаревшее] Предложения пользователей / User suggestions
							</h3>
							<div className='opacity-50'>
								<UserSuggestionsAdmin />
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Ставки НДС */}
				<Card>
					<CardContent className='pt-6'>
						<VATRatesManager />
					</CardContent>
				</Card>

				{/* Кнопка сохранения */}
				<div className='flex justify-end'>
					<Button onClick={handleSave} disabled={isSaving} className='min-w-32'>
						<Save className='h-4 w-4 mr-2' />
						{isSaving ? 'Сохранение...' : 'Сохранить'}
					</Button>
				</div>
			</div>
		</DashboardLayoutStickerV2>
	)
}
