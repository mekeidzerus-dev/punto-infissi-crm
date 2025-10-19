'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Star, Save, X } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface VATRate {
	id: string
	name: string
	percentage: number | string
	description?: string
	isDefault: boolean
	isActive: boolean
}

export function VATRatesManager() {
	const { t } = useLanguage()
	const [vatRates, setVatRates] = useState<VATRate[]>([])
	const [showForm, setShowForm] = useState(false)
	const [editingRate, setEditingRate] = useState<VATRate | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	const [formData, setFormData] = useState({
		name: '',
		percentage: '',
		description: '',
		isDefault: false,
	})

	useEffect(() => {
		fetchVatRates()
	}, [])

	const fetchVatRates = async () => {
		try {
			setIsLoading(true)
			const response = await fetch('/api/vat-rates')
			const data = await response.json()
			setVatRates(data)
		} catch (error) {
			console.error('Error fetching VAT rates:', error)
		} finally {
			setIsLoading(false)
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		try {
			const payload = {
				name: formData.name,
				percentage: parseFloat(formData.percentage),
				description: formData.description || null,
				isDefault: formData.isDefault,
				isActive: true,
			}

			if (editingRate) {
				// Update existing rate
				await fetch(`/api/vat-rates/${editingRate.id}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload),
				})
			} else {
				// Create new rate
				await fetch('/api/vat-rates', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload),
				})
			}

			await fetchVatRates()
			handleClose()
		} catch (error) {
			console.error('Error saving VAT rate:', error)
		}
	}

	const handleEdit = (rate: VATRate) => {
		setEditingRate(rate)
		setFormData({
			name: rate.name,
			percentage: String(rate.percentage),
			description: rate.description || '',
			isDefault: rate.isDefault,
		})
		setShowForm(true)
	}

	const handleDelete = async (rateId: string) => {
		if (!confirm(t('confirmDelete'))) {
			return
		}

		try {
			await fetch(`/api/vat-rates/${rateId}`, {
				method: 'DELETE',
			})
			await fetchVatRates()
		} catch (error) {
			console.error('Error deleting VAT rate:', error)
		}
	}

	const handleSetDefault = async (rateId: string) => {
		try {
			await fetch(`/api/vat-rates/${rateId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ isDefault: true }),
			})
			await fetchVatRates()
		} catch (error) {
			console.error('Error setting default VAT rate:', error)
		}
	}

	const handleClose = () => {
		setShowForm(false)
		setEditingRate(null)
		setFormData({
			name: '',
			percentage: '',
			description: '',
			isDefault: false,
		})
	}

	return (
		<div className='space-y-4'>
			<div className='flex items-center justify-between'>
				<h2 className='text-xl font-semibold'>{t('vatRate')}</h2>
				<Button
					onClick={() => setShowForm(true)}
					className='bg-green-600 hover:bg-green-700 text-white'
				>
					<Plus className='w-4 h-4 mr-2' />
					{t('add')}
				</Button>
			</div>

			<Card className='p-6'>
				{isLoading ? (
					<div className='text-center py-8 text-gray-500'>{t('loading')}</div>
				) : vatRates.length === 0 ? (
					<div className='text-center py-8'>
						<div className='text-gray-500 mb-4'>{t('noDataFound')}</div>
						<Button onClick={() => setShowForm(true)}>
							<Plus className='w-4 h-4 mr-2' />
							{t('add')} {t('vatRate')}
						</Button>
					</div>
				) : (
					<div className='overflow-x-auto'>
						<table className='w-full'>
							<thead>
								<tr className='border-b'>
									<th className='text-left py-3 px-4 font-medium'>
										{t('name')}
									</th>
									<th className='text-left py-3 px-4 font-medium'>
										{t('vat')}
									</th>
									<th className='text-left py-3 px-4 font-medium'>
										{t('description')}
									</th>
									<th className='text-center py-3 px-4 font-medium'>
										{t('default')}
									</th>
									<th className='text-center py-3 px-4 font-medium'>
										{t('actions')}
									</th>
								</tr>
							</thead>
							<tbody>
								{vatRates.map(rate => (
									<tr key={rate.id} className='border-b hover:bg-gray-50'>
										<td className='py-3 px-4'>{rate.name}</td>
										<td className='py-3 px-4 font-medium'>
											{Number(rate.percentage).toFixed(2)}%
										</td>
										<td className='py-3 px-4 text-gray-600'>
											{rate.description || '—'}
										</td>
										<td className='py-3 px-4 text-center'>
											{rate.isDefault ? (
												<Star className='w-5 h-5 mx-auto text-yellow-500 fill-yellow-500' />
											) : (
												<Button
													variant='ghost'
													size='sm'
													onClick={() => handleSetDefault(rate.id)}
													title={t('setAsDefault')}
												>
													<Star className='w-4 h-4 text-gray-400' />
												</Button>
											)}
										</td>
										<td className='py-3 px-4'>
											<div className='flex items-center justify-center space-x-2'>
												<Button
													variant='outline'
													size='sm'
													onClick={() => handleEdit(rate)}
												>
													<Edit className='w-4 h-4' />
												</Button>
												<Button
													variant='outline'
													size='sm'
													onClick={() => handleDelete(rate.id)}
													disabled={rate.isDefault}
													className='text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:text-gray-400'
												>
													<Trash2 className='w-4 h-4' />
												</Button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</Card>

			{/* Form Dialog */}
			<Dialog open={showForm} onOpenChange={setShowForm}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{editingRate ? t('edit') : t('add')} {t('vatRate')}
						</DialogTitle>
					</DialogHeader>

					<form onSubmit={handleSubmit} className='space-y-4'>
						<div>
							<Label htmlFor='name'>
								{t('name')} <span className='text-red-500'>*</span>
							</Label>
							<Input
								id='name'
								value={formData.name}
								onChange={e =>
									setFormData({ ...formData, name: e.target.value })
								}
								placeholder='IVA 22%'
								required
							/>
						</div>

						<div>
							<Label htmlFor='percentage'>
								{t('vat')} (%) <span className='text-red-500'>*</span>
							</Label>
							<Input
								id='percentage'
								type='number'
								step='0.01'
								min='0'
								max='100'
								value={formData.percentage}
								onChange={e =>
									setFormData({ ...formData, percentage: e.target.value })
								}
								placeholder='22.00'
								required
							/>
						</div>

						<div>
							<Label htmlFor='description'>{t('description')}</Label>
							<Input
								id='description'
								value={formData.description}
								onChange={e =>
									setFormData({ ...formData, description: e.target.value })
								}
								placeholder='Стандартная ставка / Aliquota standard'
							/>
						</div>

						<div className='flex items-center space-x-2'>
							<input
								type='checkbox'
								id='isDefault'
								checked={formData.isDefault}
								onChange={e =>
									setFormData({ ...formData, isDefault: e.target.checked })
								}
								className='w-4 h-4'
							/>
							<Label htmlFor='isDefault' className='cursor-pointer'>
								{t('setAsDefault')}
							</Label>
						</div>

						<div className='flex justify-end gap-3 pt-4'>
							<Button
								type='button'
								variant='outline'
								onClick={handleClose}
								className='border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400'
							>
								<X className='w-4 h-4 mr-2' />
								{t('cancel')}
							</Button>
							<Button
								type='submit'
								className='bg-green-600 hover:bg-green-700 text-white'
							>
								<Save className='w-4 h-4 mr-2' />
								{t('save')}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	)
}
