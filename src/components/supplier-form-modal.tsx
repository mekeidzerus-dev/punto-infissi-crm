'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PhoneInput } from '@/components/ui/phone-input'
import { Save, X } from 'lucide-react'
import {
	validateCodiceFiscale,
	validatePartitaIVA,
} from '@/lib/italian-validation'
import { validatePhoneForCountry, getCountryByDialCode } from '@/lib/countries'
import { useLanguage } from '@/contexts/LanguageContext'
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
import { SupplierCategoriesManager } from '@/components/supplier-categories-manager'
import SupplierParameterOverrides from '@/components/supplier-parameter-overrides'

interface SupplierFormData {
	id?: number
	name: string
	shortName?: string // Короткое название на русском
	shortNameIt?: string // Короткое название на итальянском
	phone: string
	email: string
	contactPerson: string
	address: string
	codiceFiscale: string
	partitaIVA: string
	legalAddress: string
	paymentTerms: string
	deliveryDays: string
	minOrderAmount: string
	rating: string
	status: string
	notes: string
}

interface SupplierFormModalProps {
	isOpen: boolean
	onClose: () => void
	onSave: (data: SupplierFormData) => void
	initialData?: Partial<SupplierFormData>
}

export function SupplierFormModal({
	isOpen,
	onClose,
	onSave,
	initialData,
}: SupplierFormModalProps) {
	const { t, locale } = useLanguage()
	const [formData, setFormData] = useState<SupplierFormData>({
		id: undefined,
		name: '',
		shortName: '',
		shortNameIt: '',
		phone: '+39 ',
		email: '',
		contactPerson: '',
		address: '',
		codiceFiscale: '',
		partitaIVA: '',
		legalAddress: '',
		paymentTerms: '',
		deliveryDays: '',
		minOrderAmount: '',
		rating: '5',
		status: 'active',
		notes: '',
	})

	const [errors, setErrors] = useState<Record<string, string>>({})
	const [supplierId, setSupplierId] = useState<number | null>(null)
	const [supplierCategoryIds, setSupplierCategoryIds] = useState<string[]>([])

	useEffect(() => {
		if (initialData) {
			// Преобразуем null в пустые строки
			const sanitizedData = {
				...initialData,
				shortName: initialData.shortName ?? '',
				shortNameIt: initialData.shortNameIt ?? '',
				email: initialData.email ?? '',
				contactPerson: initialData.contactPerson ?? '',
				address: initialData.address ?? '',
				codiceFiscale: initialData.codiceFiscale ?? '',
				partitaIVA: initialData.partitaIVA ?? '',
				legalAddress: initialData.legalAddress ?? '',
				paymentTerms: initialData.paymentTerms ?? '',
				deliveryDays: initialData.deliveryDays?.toString() ?? '',
				minOrderAmount: initialData.minOrderAmount?.toString() ?? '',
				rating: initialData.rating?.toString() ?? '5',
				notes: initialData.notes ?? '',
			}
			setFormData(prev => ({ ...prev, ...sanitizedData }))
			// Если это редактирование, устанавливаем ID поставщика
			if (initialData.id) {
				setSupplierId(initialData.id)
			}
		}
	}, [initialData])

	const validate = (): boolean => {
		const newErrors: Record<string, string> = {}

		if (!formData.name.trim()) {
			newErrors.name = t('requiredField')
		}

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

		if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = t('invalidEmailFormat')
		}

		if (
			formData.codiceFiscale &&
			!validateCodiceFiscale(formData.codiceFiscale)
		) {
			newErrors.codiceFiscale = t('invalidCodiceFiscaleFormat')
		}

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
			id: undefined,
			name: '',
			shortName: '',
			shortNameIt: '',
			phone: '+39 ',
			email: '',
			contactPerson: '',
			address: '',
			codiceFiscale: '',
			partitaIVA: '',
			legalAddress: '',
			paymentTerms: '',
			deliveryDays: '',
			minOrderAmount: '',
			rating: '5',
			status: 'active',
			notes: '',
		})
		setErrors({})
		setSupplierId(null)
		onClose()
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className='max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>
						{initialData ? t('editSupplier') : t('createSupplier')}
					</DialogTitle>
					<DialogDescription>{t('fillSupplierInfo')}</DialogDescription>
				</DialogHeader>

				<div className='space-y-4 py-4'>
					{/* ЕДИНАЯ СЕТКА */}
					<div className='sticker-card-v2 p-4'>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3'>
							{/* Название */}
							<div>
								<Input
									id='name'
									value={formData.name}
									onChange={e =>
										setFormData({ ...formData, name: e.target.value })
									}
									placeholder={t('companyNamePlaceholder')}
									className={errors.name ? 'border-red-500' : ''}
								/>
								{errors.name && (
									<p className='text-xs text-red-600 mt-1'>{errors.name}</p>
								)}
							</div>

							{/* Короткое название (RU) */}
							<div>
								<Input
									id='shortName'
									value={formData.shortName || ''}
									onChange={e =>
										setFormData({ ...formData, shortName: e.target.value })
									}
									placeholder={
										locale === 'ru'
											? 'Короткое название (RU)'
											: 'Nome breve (RU)'
									}
									maxLength={50}
								/>
							</div>

							{/* Короткое название (IT) */}
							<div>
								<Input
									id='shortNameIt'
									value={formData.shortNameIt || ''}
									onChange={e =>
										setFormData({ ...formData, shortNameIt: e.target.value })
									}
									placeholder={
										locale === 'ru'
											? 'Короткое название (IT)'
											: 'Nome breve (IT)'
									}
									maxLength={50}
								/>
							</div>

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

							{/* Контактное лицо */}
							<div>
								<Input
									id='contactPerson'
									value={formData.contactPerson}
									onChange={e =>
										setFormData({ ...formData, contactPerson: e.target.value })
									}
									placeholder={t('contactPersonPlaceholder')}
								/>
							</div>

							{/* Адрес */}
							<div>
								<Input
									id='address'
									value={formData.address}
									onChange={e =>
										setFormData({ ...formData, address: e.target.value })
									}
									placeholder={t('warehouseAddress')}
								/>
							</div>

							{/* Codice Fiscale */}
							<div>
								<Input
									id='codiceFiscale'
									value={formData.codiceFiscale}
									onChange={e =>
										setFormData({ ...formData, codiceFiscale: e.target.value })
									}
									placeholder='Codice Fiscale'
								/>
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
								/>
							</div>

							{/* Юридический адрес */}
							<div>
								<Input
									id='legalAddress'
									value={formData.legalAddress}
									onChange={e =>
										setFormData({ ...formData, legalAddress: e.target.value })
									}
									placeholder='Юридический адрес'
								/>
							</div>

							{/* Условия оплаты */}
							<div>
								<Select
									value={formData.paymentTerms}
									onValueChange={value =>
										setFormData({ ...formData, paymentTerms: value })
									}
								>
									<SelectTrigger>
										<SelectValue placeholder={t('paymentTerms')} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='prepayment'>
											{t('prepayment')}
										</SelectItem>
										<SelectItem value='postpayment'>
											{t('postpayment')}
										</SelectItem>
										<SelectItem value='deferred-7'>{t('deferred7')}</SelectItem>
										<SelectItem value='deferred-14'>
											{t('deferred14')}
										</SelectItem>
										<SelectItem value='deferred-30'>
											{t('deferred30')}
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Срок поставки */}
							<div>
								<Input
									id='deliveryDays'
									type='number'
									value={formData.deliveryDays}
									onChange={e =>
										setFormData({ ...formData, deliveryDays: e.target.value })
									}
									placeholder={t('deliveryDaysPlaceholder')}
								/>
							</div>

							{/* Минимальная сумма заказа */}
							<div>
								<Input
									id='minOrderAmount'
									type='number'
									value={formData.minOrderAmount}
									onChange={e =>
										setFormData({ ...formData, minOrderAmount: e.target.value })
									}
									placeholder={t('minOrderAmountPlaceholder')}
								/>
							</div>

							{/* Рейтинг */}
							<div>
								<Select
									value={formData.rating}
									onValueChange={value =>
										setFormData({ ...formData, rating: value })
									}
								>
									<SelectTrigger>
										<SelectValue placeholder={locale === 'ru' ? 'Рейтинг' : 'Valutazione'} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='5'>⭐⭐⭐⭐⭐</SelectItem>
										<SelectItem value='4'>⭐⭐⭐⭐</SelectItem>
										<SelectItem value='3'>⭐⭐⭐</SelectItem>
										<SelectItem value='2'>⭐⭐</SelectItem>
										<SelectItem value='1'>⭐</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Статус */}
							<div>
								<Select
									value={formData.status}
									onValueChange={value =>
										setFormData({ ...formData, status: value })
									}
								>
									<SelectTrigger data-testid='supplier-status-trigger'>
										<SelectValue placeholder={t('status')} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='active'>{t('activeStatus')}</SelectItem>
										<SelectItem value='inactive'>
											{t('inactiveStatus')}
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Пустая ячейка */}
							<div></div>

							{/* Примечания */}
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

				{/* Управление категориями - только при редактировании */}
				{supplierId && (
					<>
						<div className='mt-6'>
							<SupplierCategoriesManager
								supplierId={supplierId}
								supplierName={formData.name}
								onCategoriesChange={setSupplierCategoryIds}
							/>
						</div>

						{/* Переопределения параметров - только если есть категории */}
						{supplierCategoryIds.length > 0 && (
							<div className='mt-6'>
								<SupplierParameterOverrides
									supplierId={supplierId}
									categoryIds={supplierCategoryIds}
								/>
							</div>
						)}
					</>
				)}

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
