'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PhoneInput } from '@/components/ui/phone-input'
import { useLanguage } from '@/contexts/LanguageContext'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { User, Building, Save, X } from 'lucide-react'

interface ClientFormInlineProps {
	onSave: (client: any) => void
	onCancel: () => void
}

export function ClientFormInline({ onSave, onCancel }: ClientFormInlineProps) {
	const { t } = useLanguage()
	const [loading, setLoading] = useState(false)
	const [clientType, setClientType] = useState<'individual' | 'company'>(
		'individual'
	)

	const [formData, setFormData] = useState({
		type: 'individual' as 'individual' | 'company',
		firstName: '',
		lastName: '',
		companyName: '',
		phone: '',
		email: '',
		address: '',
		codiceFiscale: '',
		partitaIVA: '',
		legalAddress: '',
		contactPerson: '',
		source: '',
		notes: '',
	})

	const handleSubmit = async () => {
		// Валидация
		if (
			formData.type === 'individual' &&
			(!formData.firstName || !formData.lastName)
		) {
			alert(t('requiredField'))
			return
		}
		if (formData.type === 'company' && !formData.companyName) {
			alert(t('requiredField'))
			return
		}
		if (!formData.phone) {
			alert(t('requiredField'))
			return
		}

		setLoading(true)
		try {
			const response = await fetch('/api/clients', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
			})

			if (response.ok) {
				const newClient = await response.json()
				onSave(newClient)
			} else {
				alert(t('errorAdding'))
			}
		} catch (error) {
			console.error('Error creating client:', error)
			alert(t('errorAdding'))
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='space-y-4 max-w-4xl'>
			{/* Тип клиента */}
			<div className='flex gap-3'>
				<Button
					type='button'
					variant={clientType === 'individual' ? 'default' : 'outline'}
					onClick={() => {
						setClientType('individual')
						setFormData(prev => ({ ...prev, type: 'individual' }))
					}}
					className='flex-1'
				>
					<User className='h-4 w-4 mr-2' />
					{t('individual')}
				</Button>
				<Button
					type='button'
					variant={clientType === 'company' ? 'default' : 'outline'}
					onClick={() => {
						setClientType('company')
						setFormData(prev => ({ ...prev, type: 'company' }))
					}}
					className='flex-1'
				>
					<Building className='h-4 w-4 mr-2' />
					{t('company')}
				</Button>
			</div>

			{/* Основные данные - 2 колонки */}
			<div className='grid grid-cols-2 gap-4'>
				{clientType === 'individual' ? (
					<>
						<div>
							<Label htmlFor='firstName'>{t('firstNamePlaceholder')}</Label>
							<Input
								id='firstName'
								value={formData.firstName}
								onChange={e =>
									setFormData(prev => ({ ...prev, firstName: e.target.value }))
								}
								className='mt-1'
							/>
						</div>
						<div>
							<Label htmlFor='lastName'>{t('lastNamePlaceholder')}</Label>
							<Input
								id='lastName'
								value={formData.lastName}
								onChange={e =>
									setFormData(prev => ({ ...prev, lastName: e.target.value }))
								}
								className='mt-1'
							/>
						</div>
					</>
				) : (
					<div className='col-span-2'>
						<Label htmlFor='companyName'>{t('companyNamePlaceholder')}</Label>
						<Input
							id='companyName'
							value={formData.companyName}
							onChange={e =>
								setFormData(prev => ({ ...prev, companyName: e.target.value }))
							}
							className='mt-1'
						/>
					</div>
				)}

				<div>
					<Label htmlFor='phone'>{t('phonePlaceholder')}</Label>
					<PhoneInput
						value={formData.phone}
						onChange={phone => setFormData(prev => ({ ...prev, phone }))}
						className='mt-1'
					/>
				</div>

				<div>
					<Label htmlFor='email'>{t('emailPlaceholder')}</Label>
					<Input
						id='email'
						type='email'
						value={formData.email}
						onChange={e =>
							setFormData(prev => ({ ...prev, email: e.target.value }))
						}
						className='mt-1'
					/>
				</div>

				<div className='col-span-2'>
					<Label htmlFor='address'>{t('addressPlaceholder')}</Label>
					<Input
						id='address'
						value={formData.address}
						onChange={e =>
							setFormData(prev => ({ ...prev, address: e.target.value }))
						}
						className='mt-1'
					/>
				</div>
			</div>

			{/* Кнопки */}
			<div className='flex justify-end gap-3 pt-4 border-t'>
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
					onClick={handleSubmit}
					disabled={loading}
					className='bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:bg-gray-400'
				>
					<Save className='w-4 h-4 mr-2' />
					{loading ? t('saving') : t('save')}
				</Button>
			</div>
		</div>
	)
}
