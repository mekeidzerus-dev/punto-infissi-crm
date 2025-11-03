'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { logger } from '@/lib/logger'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
	Building2,
	Phone,
	Mail,
	MapPin,
	Globe,
	Save,
	Image as ImageIcon,
	Upload,
} from 'lucide-react'

interface Currency {
	code: string
	name: string
	symbol: string
}

const CURRENCIES: Currency[] = [
	{ code: 'EUR', name: 'Евро', symbol: '€' },
	{ code: 'RUB', name: 'Российский рубль', symbol: '₽' },
	{ code: 'USD', name: 'Доллар США', symbol: '$' },
]

export function GeneralSettings() {
	const [selectedCurrency, setSelectedCurrency] = useState<string>('EUR')
	const [isSaving, setIsSaving] = useState(false)
	const [favicon, setFavicon] = useState<string>('')
	const [faviconPreview, setFaviconPreview] = useState<string>('')
	const [logo, setLogo] = useState<string>('')
	const [logoPreview, setLogoPreview] = useState<string>('')

	// Состояние для данных компании
	const [companyData, setCompanyData] = useState({
		name: '',
		phone: '',
		email: '',
		address: '',
	})

	const currentCurrency = CURRENCIES.find(c => c.code === selectedCurrency)

	// Загрузка данных при монтировании
	useEffect(() => {
		loadOrganizationData()
	}, [])

	const loadOrganizationData = async () => {
		try {
			const response = await fetch('/api/organization')
			if (response.ok) {
				const org = await response.json()

				// Фавикон
				if (org.faviconUrl) {
					setFavicon(org.faviconUrl)
					setFaviconPreview(org.faviconUrl)
					localStorage.setItem('punto-infissi-favicon-path', org.faviconUrl)
					window.dispatchEvent(new Event('favicon-updated'))
				}

				// Логотип
				if (org.logoUrl) {
					setLogo(org.logoUrl)
					setLogoPreview(org.logoUrl)
					localStorage.setItem('punto-infissi-logo-path', org.logoUrl)
					window.dispatchEvent(new Event('logo-updated'))
				}

				// Данные компании
				setCompanyData({
					name: org.name || '',
					phone: org.phone || '',
					email: org.email || '',
					address: org.address || '',
				})
				
				// Валюта
				if (org.currency) {
					setSelectedCurrency(org.currency)
				}
			}
		} catch (error) {
			logger.error('Error loading organization data:', error)
		}
	}

	const handleSave = async () => {
		setIsSaving(true)
		try {
			// Сохранение данных компании
			const response = await fetch('/api/organization', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: companyData.name,
					phone: companyData.phone,
					email: companyData.email,
					address: companyData.address,
					currency: selectedCurrency,
				}),
			})

			if (response.ok) {
				alert('Настройки сохранены!')
			} else {
				alert('Ошибка сохранения настроек')
			}
		} catch (error) {
			logger.error('Error saving settings:', error)
			alert('Ошибка сохранения настроек')
		} finally {
			setIsSaving(false)
		}
	}

	// Обработчики для фавикона
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
				localStorage.setItem('punto-infissi-favicon-path', data.path)
				window.dispatchEvent(new Event('favicon-updated'))
				alert('Фавикон загружен и применен!')
			} else {
				alert('Ошибка загрузки: ' + data.error)
				setFaviconPreview('')
			}
		} catch (error) {
			logger.error('Ошибка загрузки фавикона:', error)
			alert('Ошибка загрузки файла на сервер')
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
				localStorage.setItem('punto-infissi-logo-path', data.path)
				window.dispatchEvent(new Event('logo-updated'))
				alert('Логотип загружен и применен!')
			} else {
				alert('Ошибка загрузки: ' + data.error)
				setLogoPreview('')
			}
		} catch (error) {
			logger.error('Ошибка загрузки логотипа:', error)
			alert('Ошибка загрузки файла на сервер')
		}
	}

	return (
		<div className='space-y-6'>
			{/* Данные компании */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<Building2 className='h-5 w-5 text-blue-600' />
						Компания
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<div className='flex items-center gap-2'>
								<Building2 className='h-4 w-4 text-gray-500' />
								<Label htmlFor='companyName'>Название</Label>
							</div>
							<Input
								id='companyName'
								value={companyData.name}
								onChange={e =>
									setCompanyData({
										...companyData,
										name: e.target.value,
									})
								}
								placeholder='PUNTO INFISSI'
							/>
						</div>
						<div className='space-y-2'>
							<div className='flex items-center gap-2'>
								<Phone className='h-4 w-4 text-gray-500' />
								<Label htmlFor='companyPhone'>Телефон</Label>
							</div>
							<Input
								id='companyPhone'
								value={companyData.phone}
								onChange={e =>
									setCompanyData({
										...companyData,
										phone: e.target.value,
									})
								}
								placeholder='+39 333 123 4567'
							/>
						</div>
						<div className='space-y-2'>
							<div className='flex items-center gap-2'>
								<Mail className='h-4 w-4 text-gray-500' />
								<Label htmlFor='companyEmail'>Email</Label>
							</div>
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
								placeholder='info@puntoinfissi.it'
							/>
						</div>
						<div className='space-y-2'>
							<div className='flex items-center gap-2'>
								<MapPin className='h-4 w-4 text-gray-500' />
								<Label htmlFor='companyAddress'>Адрес</Label>
							</div>
							<Input
								id='companyAddress'
								value={companyData.address}
								onChange={e =>
									setCompanyData({
										...companyData,
										address: e.target.value,
									})
								}
								placeholder='Via Roma 123, Milano'
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Валюта */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<Globe className='h-5 w-5 text-green-600' />
						Валюта
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='space-y-2'>
						<div className='flex items-center gap-2'>
							<Globe className='h-4 w-4 text-gray-500' />
							<Label htmlFor='currency'>Основная валюта</Label>
						</div>
						<Select
							value={selectedCurrency}
							onValueChange={setSelectedCurrency}
						>
							<SelectTrigger>
								<SelectValue placeholder='Выберите валюту' />
							</SelectTrigger>
							<SelectContent>
								{CURRENCIES.map(currency => (
									<SelectItem key={currency.code} value={currency.code}>
										<div className='flex items-center gap-2'>
											<span className='font-mono text-lg'>
												{currency.symbol}
											</span>
											<span>{currency.name}</span>
											<span className='text-gray-500'>({currency.code})</span>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{currentCurrency && (
						<div className='p-3 bg-green-50 rounded-lg'>
							<div className='flex items-center gap-3'>
								<span className='text-3xl font-mono'>
									{currentCurrency.symbol}
								</span>
								<div>
									<div className='font-medium'>{currentCurrency.name}</div>
									<div className='text-sm text-gray-600'>
										{currentCurrency.code}
									</div>
								</div>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Логотип и фавикон */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<ImageIcon className='h-5 w-5 text-purple-600' />
						Брендинг
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-6'>
					{/* Логотип */}
					<div className='space-y-4'>
						<div className='flex items-center gap-2'>
							<ImageIcon className='h-4 w-4 text-gray-500' />
							<Label>Логотип компании</Label>
						</div>

						<div className='flex items-center gap-4'>
							{logoPreview && (
								<div className='w-16 h-16 border rounded-lg overflow-hidden bg-gray-50'>
									<img
										src={logoPreview}
										alt='Логотип'
										className='w-full h-full object-contain'
									/>
								</div>
							)}

							<div className='flex-1'>
								<input
									type='file'
									id='logo-upload'
									accept='image/*'
									onChange={handleLogoUpload}
									className='hidden'
								/>
								<Button
									onClick={() =>
										document.getElementById('logo-upload')?.click()
									}
									variant='outline'
									size='sm'
								>
									<Upload className='h-4 w-4 mr-2' />
									Загрузить логотип
								</Button>
							</div>
						</div>
					</div>

					<Separator />

					{/* Фавикон */}
					<div className='space-y-4'>
						<div className='flex items-center gap-2'>
							<ImageIcon className='h-4 w-4 text-gray-500' />
							<Label>Фавикон</Label>
						</div>

						<div className='flex items-center gap-4'>
							{faviconPreview && (
								<div className='w-8 h-8 border rounded overflow-hidden bg-gray-50'>
									<img
										src={faviconPreview}
										alt='Фавикон'
										className='w-full h-full object-contain'
									/>
								</div>
							)}

							<div className='flex-1'>
								<input
									type='file'
									id='favicon-upload'
									accept='image/*'
									onChange={handleFaviconUpload}
									className='hidden'
								/>
								<Button
									onClick={() =>
										document.getElementById('favicon-upload')?.click()
									}
									variant='outline'
									size='sm'
								>
									<Upload className='h-4 w-4 mr-2' />
									Загрузить фавикон
								</Button>
							</div>
						</div>
					</div>
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
	)
}
