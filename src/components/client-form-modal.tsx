'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PhoneInput } from '@/components/ui/phone-input'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { User, Building, Save, X } from 'lucide-react'
import {
	validateCodiceFiscale,
	validatePartitaIVA,
} from '@/lib/italian-validation'
import { validatePhoneForCountry, getCountryByDialCode } from '@/lib/countries'
import { useLanguage } from '@/contexts/LanguageContext'

interface ClientFormData {
	type: 'individual' | 'company'
	firstName: string
	lastName: string
	companyName: string
	phone: string
	email: string
	address: string
	// Реквизиты (только для юрлиц)
	codiceFiscale: string
	partitaIVA: string
	legalAddress: string
	contactPerson: string
	// Дополнительно
	source: string
	notes: string
}

interface ClientFormModalProps {
	isOpen: boolean
	onClose: () => void
	onSave: (data: ClientFormData) => void
	initialData?: Partial<ClientFormData>
}

export function ClientFormModal({
	isOpen,
	onClose,
	onSave,
	initialData,
}: ClientFormModalProps) {
	const { t } = useLanguage()
	const [formData, setFormData] = useState<ClientFormData>({
		type: 'individual',
		firstName: '',
		lastName: '',
		companyName: '',
		phone: '+39 ',
		email: '',
		address: '',
		codiceFiscale: '',
		partitaIVA: '',
		legalAddress: '',
		contactPerson: '',
		source: '',
		notes: '',
	})

	const [sources, setSources] = useState<
		Array<{ id: number; name: string; isActive: boolean }>
	>([])
	const [errors, setErrors] = useState<Record<string, string>>({})

	// Загрузка источников из API
	useEffect(() => {
		if (isOpen) {
			fetchSources()
		}
	}, [isOpen])

	const fetchSources = async () => {
		try {
			const response = await fetch('/api/dictionaries?type=sources')
			if (response.ok) {
				const data = await response.json()
				setSources(data.filter((s: any) => s.isActive))
			}
		} catch (error) {
			console.error('Error fetching sources:', error)
		}
	}

	// Заполнение формы при редактировании
	useEffect(() => {
		if (initialData) {
			setFormData(prev => ({ ...prev, ...initialData }))
		}
	}, [initialData])

	const validate = (): boolean => {
		const newErrors: Record<string, string> = {}

		// Проверка имени/названия
		if (formData.type === 'individual') {
			if (!formData.firstName.trim()) {
				newErrors.firstName = t('requiredField')
			}
			if (!formData.lastName.trim()) {
				newErrors.lastName = t('requiredField')
			}
		} else {
			if (!formData.companyName.trim()) {
				newErrors.companyName = t('requiredField')
			}
		}

		// Проверка телефона
		if (
			!formData.phone.trim() ||
			formData.phone.replace(/[^\d]/g, '').length <= 1
		) {
			newErrors.phone = t('requiredField')
		} else {
			const country = getCountryByDialCode(formData.phone)
			if (country && !validatePhoneForCountry(formData.phone, country)) {
				newErrors.phone = `${t('invalidPhoneFormat')} ${country.name}`
			}
		}

		// Валидация email (если заполнен)
		if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = t('invalidEmailFormat')
		}

		// Валидация Codice Fiscale
		if (
			formData.codiceFiscale &&
			!validateCodiceFiscale(formData.codiceFiscale)
		) {
			newErrors.codiceFiscale = t('invalidCodiceFiscaleFormat')
		}

		// Валидация Partita IVA
		if (formData.partitaIVA && !validatePartitaIVA(formData.partitaIVA)) {
			newErrors.partitaIVA = t('invalidPartitaIVAFormat')
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = () => {
		if (validate()) {
			onSave(formData)
			handleClose()
		}
	}

	const handleClose = () => {
		setFormData({
			type: 'individual',
			firstName: '',
			lastName: '',
			companyName: '',
			phone: '+39 ',
			email: '',
			address: '',
			codiceFiscale: '',
			partitaIVA: '',
			legalAddress: '',
			contactPerson: '',
			source: '',
			notes: '',
		})
		setErrors({})
		onClose()
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className='max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>
						{initialData ? t('editClient') : t('createClient')}
					</DialogTitle>
					<DialogDescription>{t('fillClientInfo')}</DialogDescription>
				</DialogHeader>

				<div className='space-y-4 py-4'>
					{/* Тумблер Физлицо/Юрлицо */}
					<div className='flex items-center justify-center gap-4 p-3 bg-gray-50 rounded-lg'>
						<button
							type='button'
							onClick={() => setFormData({ ...formData, type: 'individual' })}
							className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
								formData.type === 'individual'
									? 'bg-green-600 text-white shadow-md'
									: 'bg-white text-gray-600 hover:bg-gray-100'
							}`}
						>
							<User className='h-4 w-4' />
							{t('individualShort')}
						</button>
						<div className='h-6 w-px bg-gray-300' />
						<button
							type='button'
							onClick={() => setFormData({ ...formData, type: 'company' })}
							className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
								formData.type === 'company'
									? 'bg-green-600 text-white shadow-md'
									: 'bg-white text-gray-600 hover:bg-gray-100'
							}`}
						>
							<Building className='h-4 w-4' />
							{t('companyShort')}
						</button>
					</div>

					{/* ЕДИНАЯ СЕТКА - ВСЕ ПОЛЯ ВЫРОВНЕНЫ */}
					<div className='sticker-card-v2 p-4'>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3'>
							{/* Имя / Название компании */}
							{formData.type === 'individual' ? (
								<>
									<div>
										<Input
											id='firstName'
											value={formData.firstName}
											onChange={e =>
												setFormData({ ...formData, firstName: e.target.value })
											}
											placeholder={t('firstNamePlaceholder')}
											className={errors.firstName ? 'border-red-500' : ''}
										/>
										{errors.firstName && (
											<p className='text-xs text-red-600 mt-1'>
												{errors.firstName}
											</p>
										)}
									</div>
									<div>
										<Input
											id='lastName'
											value={formData.lastName}
											onChange={e =>
												setFormData({ ...formData, lastName: e.target.value })
											}
											placeholder={t('lastNamePlaceholder')}
											className={errors.lastName ? 'border-red-500' : ''}
										/>
										{errors.lastName && (
											<p className='text-xs text-red-600 mt-1'>
												{errors.lastName}
											</p>
										)}
									</div>
								</>
							) : (
								<>
									<div>
										<Input
											id='companyName'
											value={formData.companyName}
											onChange={e =>
												setFormData({
													...formData,
													companyName: e.target.value,
												})
											}
											placeholder={t('companyNamePlaceholder')}
											className={errors.companyName ? 'border-red-500' : ''}
										/>
										{errors.companyName && (
											<p className='text-xs text-red-600 mt-1'>
												{errors.companyName}
											</p>
										)}
									</div>
									<div>
										<Input
											id='contactPerson'
											value={formData.contactPerson}
											onChange={e =>
												setFormData({
													...formData,
													contactPerson: e.target.value,
												})
											}
											placeholder={t('contactPersonPlaceholder')}
										/>
									</div>
								</>
							)}

							{/* Телефон */}
							<div>
								<PhoneInput
									value={formData.phone}
									onChange={phone => setFormData({ ...formData, phone })}
									placeholder={t('phonePlaceholder')}
									defaultCountry='IT'
									className={errors.phone ? 'border-red-500' : ''}
								/>
								{errors.phone && (
									<p className='text-xs text-red-600 mt-1'>{errors.phone}</p>
								)}
							</div>

							{/* Email */}
							<div>
								<Input
									id='email'
									type='email'
									value={formData.email}
									onChange={e =>
										setFormData({ ...formData, email: e.target.value })
									}
									placeholder={t('emailPlaceholder')}
									className={errors.email ? 'border-red-500' : ''}
								/>
								{errors.email && (
									<p className='text-xs text-red-600 mt-1'>{errors.email}</p>
								)}
							</div>

							{/* Адрес */}
							<div>
								<Input
									id='address'
									value={formData.address}
									onChange={e =>
										setFormData({ ...formData, address: e.target.value })
									}
									placeholder={t('addressPlaceholder')}
								/>
							</div>

							{/* РЕКВИЗИТЫ (только для юрлиц) */}
							{formData.type === 'company' && (
								<>
									{/* Codice Fiscale */}
									<div>
										<Input
											id='codiceFiscale'
											value={formData.codiceFiscale}
											onChange={e =>
												setFormData({
													...formData,
													codiceFiscale: e.target.value.toUpperCase(),
												})
											}
											placeholder='Codice Fiscale'
											maxLength={16}
											className={errors.codiceFiscale ? 'border-red-500' : ''}
										/>
										{errors.codiceFiscale && (
											<p className='text-xs text-red-600 mt-1'>
												{errors.codiceFiscale}
											</p>
										)}
									</div>

									{/* Partita IVA */}
									<div>
										<Input
											id='partitaIVA'
											value={formData.partitaIVA}
											onChange={e =>
												setFormData({ ...formData, partitaIVA: e.target.value })
											}
											placeholder='Partita IVA'
											maxLength={11}
											className={errors.partitaIVA ? 'border-red-500' : ''}
										/>
										{errors.partitaIVA && (
											<p className='text-xs text-red-600 mt-1'>
												{errors.partitaIVA}
											</p>
										)}
									</div>

									{/* Юридический адрес */}
									<div>
										<Input
											id='legalAddress'
											value={formData.legalAddress}
											onChange={e =>
												setFormData({
													...formData,
													legalAddress: e.target.value,
												})
											}
											placeholder={t('legalAddressPlaceholder')}
										/>
									</div>
								</>
							)}

							{/* Источник */}
							<div>
								<Select
									value={formData.source}
									onValueChange={value =>
										setFormData({ ...formData, source: value })
									}
								>
									<SelectTrigger id='source'>
										<SelectValue placeholder={t('sourcePlaceholder')} />
									</SelectTrigger>
									<SelectContent>
										{sources.map(source => (
											<SelectItem key={source.id} value={source.name}>
												{source.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{sources.length === 0 && (
									<p className='text-xs text-gray-500 mt-1'>
										{t('addSourcesInSettings')}
									</p>
								)}
							</div>

							{/* Пустая ячейка для выравнивания */}
							<div></div>

							{/* Примечания - на всю ширину */}
							<div className='md:col-span-2'>
								<Textarea
									id='notes'
									value={formData.notes}
									onChange={e =>
										setFormData({ ...formData, notes: e.target.value })
									}
									placeholder={t('notesPlaceholder')}
									rows={3}
									className='resize-none'
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Кнопки */}
				<div className='flex justify-end gap-3 pt-4 border-t'>
					<Button
						variant='outline'
						onClick={handleClose}
						className='border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400'
					>
						<X className='w-4 h-4 mr-2' />
						{t('cancel')}
					</Button>
					<Button
						onClick={handleSubmit}
						className='bg-green-600 hover:bg-green-700 text-white'
					>
						<Save className='w-4 h-4 mr-2' />
						{initialData ? t('save') : t('createItem')}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
