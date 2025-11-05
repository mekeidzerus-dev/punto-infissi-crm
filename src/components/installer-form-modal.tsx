'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PhoneInput } from '@/components/ui/phone-input'
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
import { User, Building, Save, X } from 'lucide-react'

interface InstallerFormData {
	type: 'individual' | 'ip' | 'company'
	name: string
	phone: string
	email: string
	specialization: string
	experience: string
	hasTools: string
	hasTransport: string
	rateType: string
	ratePrice: string
	schedule: string
	availability: string
	rating: string
	status: string
	notes: string
}

interface InstallerFormModalProps {
	isOpen: boolean
	onClose: () => void
	onSave: (data: InstallerFormData) => void
	initialData?: Partial<InstallerFormData>
}

export function InstallerFormModal({
	isOpen,
	onClose,
	onSave,
	initialData,
}: InstallerFormModalProps) {
	const { t, locale } = useLanguage()
	const [formData, setFormData] = useState<InstallerFormData>({
		type: 'individual',
		name: '',
		phone: '+39 ',
		email: '',
		specialization: '',
		experience: '',
		hasTools: 'yes',
		hasTransport: 'yes',
		rateType: '',
		ratePrice: '',
		schedule: '',
		availability: 'available',
		rating: '5',
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
			name: '',
			phone: '',
			email: '',
			specialization: '',
			experience: '',
			hasTools: 'yes',
			hasTransport: 'yes',
			rateType: '',
			ratePrice: '',
			schedule: '',
			availability: 'available',
			rating: '5',
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
						{initialData ? t('editInstaller') : t('createInstaller')}
					</DialogTitle>
					<DialogDescription>{t('fillInstallerInfo')}</DialogDescription>
				</DialogHeader>

				<div className='space-y-4 py-4'>
					{/* Тумблер Физлицо/ИП/Компания */}
					<div className='flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-lg'>
						<button
							type='button'
							onClick={() => setFormData({ ...formData, type: 'individual' })}
							className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
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
							onClick={() => setFormData({ ...formData, type: 'ip' })}
							className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
								formData.type === 'ip'
									? 'bg-green-600 text-white shadow-md'
									: 'bg-white text-gray-600 hover:bg-gray-100'
							}`}
						>
							{t('ipShort')}
						</button>
						<div className='h-6 w-px bg-gray-300' />
						<button
							type='button'
							onClick={() => setFormData({ ...formData, type: 'company' })}
							className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
								formData.type === 'company'
									? 'bg-green-600 text-white shadow-md'
									: 'bg-white text-gray-600 hover:bg-gray-100'
							}`}
						>
							<Building className='h-4 w-4' />
							{t('companyShort')}
						</button>
					</div>

					{/* ЕДИНАЯ СЕТКА */}
					<div className='sticker-card-v2 p-4'>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3'>
							{/* ФИО / Название */}
							<div>
								<Input
									id='name'
									value={formData.name}
									onChange={e =>
										setFormData({ ...formData, name: e.target.value })
									}
									placeholder={
										formData.type === 'individual'
											? t('fullName') + ' *'
											: t('teamName') + ' *'
									}
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

							{/* Специализация */}
							<div>
								<Select
									value={formData.specialization}
									onValueChange={value =>
										setFormData({ ...formData, specialization: value })
									}
								>
									<SelectTrigger>
										<SelectValue placeholder={t('specialization')} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='windows'>{t('windows')}</SelectItem>
										<SelectItem value='doors'>{t('doors')}</SelectItem>
										<SelectItem value='balconies'>{t('balconies')}</SelectItem>
										<SelectItem value='all'>{t('allTypes')}</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Опыт работы */}
							<div>
								<Input
									id='experience'
									type='number'
									value={formData.experience}
									onChange={e =>
										setFormData({ ...formData, experience: e.target.value })
									}
									placeholder={t('experienceYears')}
								/>
							</div>

							{/* Инструмент */}
							<div>
								<Select
									value={formData.hasTools}
									onValueChange={value =>
										setFormData({ ...formData, hasTools: value })
									}
								>
									<SelectTrigger>
										<SelectValue placeholder={t('hasToolsQuestion')} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='yes'>{t('hasTools')}</SelectItem>
										<SelectItem value='no'>{t('noTools')}</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Транспорт */}
							<div>
								<Select
									value={formData.hasTransport}
									onValueChange={value =>
										setFormData({ ...formData, hasTransport: value })
									}
								>
									<SelectTrigger>
										<SelectValue placeholder={t('hasTransportQuestion')} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='yes'>{t('hasTransport')}</SelectItem>
										<SelectItem value='no'>{t('noTransport')}</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Тариф */}
							<div>
								<Select
									value={formData.rateType}
									onValueChange={value =>
										setFormData({ ...formData, rateType: value })
									}
								>
									<SelectTrigger>
										<SelectValue placeholder={t('rateType')} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='per-unit'>{t('perUnit')}</SelectItem>
										<SelectItem value='per-hour'>{t('perHour')}</SelectItem>
										<SelectItem value='per-project'>
											{t('perProject')}
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Цена */}
							<div>
								<Input
									id='ratePrice'
									type='number'
									value={formData.ratePrice}
									onChange={e =>
										setFormData({ ...formData, ratePrice: e.target.value })
									}
									placeholder={t('basePrice') + ' (€)'}
								/>
							</div>

							{/* График работы */}
							<div>
								<Input
									id='schedule'
									value={formData.schedule}
									onChange={e =>
										setFormData({ ...formData, schedule: e.target.value })
									}
									placeholder={t('schedule')}
								/>
							</div>

							{/* Доступность */}
							<div>
								<Select
									value={formData.availability}
									onValueChange={value =>
										setFormData({ ...formData, availability: value })
									}
								>
									<SelectTrigger>
										<SelectValue placeholder={t('availability')} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='available'>
											{t('availableStatus')}
										</SelectItem>
										<SelectItem value='busy'>{t('busyStatus')}</SelectItem>
										<SelectItem value='vacation'>
											{t('vacationStatus')}
										</SelectItem>
									</SelectContent>
								</Select>
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
