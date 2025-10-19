'use client'

import { useState, useEffect } from 'react'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Save, X } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface VATRate {
	id: string
	name: string
	percentage: number | string
	description?: string
	isDefault: boolean
	isActive: boolean
}

interface VATRateSelectWithCreateProps {
	value: string
	onValueChange: (value: string) => void
	className?: string
}

export function VATRateSelectWithCreate({
	value,
	onValueChange,
	className,
}: VATRateSelectWithCreateProps) {
	const { t } = useLanguage()
	const [vatRates, setVatRates] = useState<VATRate[]>([])
	const [showCreateDialog, setShowCreateDialog] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	const [formData, setFormData] = useState({
		name: '',
		percentage: '',
		description: '',
	})

	useEffect(() => {
		fetchVatRates()
	}, [])

	const fetchVatRates = async () => {
		try {
			const response = await fetch('/api/vat-rates')
			const data = await response.json()
			setVatRates(data)
		} catch (error) {
			console.error('Error fetching VAT rates:', error)
		}
	}

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)

		try {
			const response = await fetch('/api/vat-rates', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: formData.name,
					percentage: parseFloat(formData.percentage),
					description: formData.description || null,
					isDefault: false,
					isActive: true,
				}),
			})

			if (response.ok) {
				const newRate = await response.json()
				await fetchVatRates()
				onValueChange(String(newRate.percentage))
				handleClose()
			}
		} catch (error) {
			console.error('Error creating VAT rate:', error)
		} finally {
			setIsLoading(false)
		}
	}

	const handleClose = () => {
		setShowCreateDialog(false)
		setFormData({
			name: '',
			percentage: '',
			description: '',
		})
	}

	return (
		<>
			<div className='flex items-center gap-2'>
				<Select value={value} onValueChange={onValueChange}>
					<SelectTrigger className={className}>
						<SelectValue placeholder={t('selectVatRate')} />
					</SelectTrigger>
					<SelectContent>
						{vatRates.map(rate => (
							<SelectItem key={rate.id} value={String(rate.percentage)}>
								{rate.name} ({Number(rate.percentage).toFixed(2)}%)
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Button
					type='button'
					variant='outline'
					size='sm'
					onClick={() => setShowCreateDialog(true)}
					title={t('add') + ' ' + t('vatRate')}
				>
					<Plus className='w-4 h-4' />
				</Button>
			</div>

			{/* Create Dialog */}
			<Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{t('add')} {t('vatRate')}
						</DialogTitle>
					</DialogHeader>

					<form onSubmit={handleCreate} className='space-y-4'>
						<div>
							<Label htmlFor='new-vat-name'>
								{t('name')} <span className='text-red-500'>*</span>
							</Label>
							<Input
								id='new-vat-name'
								value={formData.name}
								onChange={e =>
									setFormData({ ...formData, name: e.target.value })
								}
								placeholder='IVA 15%'
								required
							/>
						</div>

						<div>
							<Label htmlFor='new-vat-percentage'>
								{t('vat')} (%) <span className='text-red-500'>*</span>
							</Label>
							<Input
								id='new-vat-percentage'
								type='number'
								step='0.01'
								min='0'
								max='100'
								value={formData.percentage}
								onChange={e =>
									setFormData({ ...formData, percentage: e.target.value })
								}
								placeholder='15.00'
								required
							/>
						</div>

						<div>
							<Label htmlFor='new-vat-description'>{t('description')}</Label>
							<Input
								id='new-vat-description'
								value={formData.description}
								onChange={e =>
									setFormData({ ...formData, description: e.target.value })
								}
								placeholder='Пониженная ставка / Aliquota ridotta'
							/>
						</div>

						<div className='flex justify-end gap-3 pt-4'>
							<Button
								type='button'
								variant='outline'
								onClick={handleClose}
								disabled={isLoading}
								className='border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400'
							>
								<X className='w-4 h-4 mr-2' />
								{t('cancel')}
							</Button>
							<Button
								type='submit'
								disabled={isLoading}
								className='bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:bg-gray-400'
							>
								<Plus className='w-4 h-4 mr-2' />
								{isLoading ? t('saving') : t('add')}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</>
	)
}
