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

interface PartnerFormData {
	name: string
	phone: string
	email: string
	contactPerson: string
	address: string
	type: string
	region: string
	commission: string
	codiceFiscale: string
	partitaIVA: string
	legalAddress: string
	status: string
	notes: string
}

interface PartnerFormModalProps {
	isOpen: boolean
	onClose: () => void
	onSave: (data: PartnerFormData) => void
	initialData?: Partial<PartnerFormData>
}

export function PartnerFormModal({
	isOpen,
	onClose,
	onSave,
	initialData,
}: PartnerFormModalProps) {
	const { t } = useLanguage()
	const [formData, setFormData] = useState<PartnerFormData>({
		name: '',
		phone: '+39 ',
		email: '',
		contactPerson: '',
		address: '',
		type: '',
		region: '',
		commission: '',
		codiceFiscale: '',
		partitaIVA: '',
		legalAddress: '',
		status: 'active',
		notes: '',
	})

	const [errors, setErrors] = useState<Record<string, string>>({})

	useEffect(() => {
		if (initialData) {
			setFormData(prev => ({ ...prev, ...initialData }))
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
			name: '',
			phone: '',
			email: '',
			contactPerson: '',
			address: '',
			type: '',
			region: '',
			commission: '',
			codiceFiscale: '',
			partitaIVA: '',
			legalAddress: '',
			status: 'active',
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
						{initialData ? t('editPartner') : t('createPartner')}
					</DialogTitle>
					<DialogDescription>{t('fillPartnerInfo')}</DialogDescription>
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
									placeholder={t('addressPlaceholder')}
								/>
							</div>

							{/* Тип партнера */}
							<div>
								<Select
									value={formData.type}
									onValueChange={value =>
										setFormData({ ...formData, type: value })
									}
								>
									<SelectTrigger>
										<SelectValue placeholder={t('partnerType')} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='architect'>{t('architect')}</SelectItem>
										<SelectItem value='agent'>{t('agent')}</SelectItem>
										<SelectItem value='engineer'>{t('engineer')}</SelectItem>
										<SelectItem value='designer'>{t('designer')}</SelectItem>
										<SelectItem value='dealer'>{t('dealer')}</SelectItem>
										<SelectItem value='distributor'>
											{t('distributor')}
										</SelectItem>
										<SelectItem value='other'>{t('other')}</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Регион работы */}
							<div>
								<Input
									id='region'
									value={formData.region}
									onChange={e =>
										setFormData({ ...formData, region: e.target.value })
									}
									placeholder={t('regionWork')}
								/>
							</div>

							{/* Процент комиссии */}
							<div>
								<Input
									id='commission'
									type='number'
									value={formData.commission}
									onChange={e =>
										setFormData({ ...formData, commission: e.target.value })
									}
									placeholder={t('commissionPercent')}
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

							{/* Статус */}
							<div>
								<Select
									value={formData.status}
									onValueChange={value =>
										setFormData({ ...formData, status: value })
									}
								>
									<SelectTrigger>
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
