'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { ProductConfigurator } from '@/components/product-configurator'
import { Plus, Trash2, Edit, Save, X } from 'lucide-react'

interface Client {
	id: number
	firstName?: string
	lastName?: string
	companyName?: string
	phone: string
	email?: string
}

interface VATRate {
	id: string
	name: string
	percentage: number
	isDefault: boolean
}

interface Configuration {
	categoryId: string
	supplierId: number
	supplierCategoryId: string
	parameters: Record<string, any>
}

interface ProposalPosition {
	id?: string
	categoryId: string
	supplierCategoryId: string
	configuration: Configuration
	unitPrice: number
	quantity: number
	discount: number
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
	clientId: number
	groups: ProposalGroup[]
	vatRate: number
	subtotal: number
	discount: number
	vatAmount: number
	total: number
	notes?: string
}

interface ProposalFormProps {
	proposal?: ProposalDocument
	onSave: (proposal: ProposalDocument) => void
	onCancel: () => void
}

export function ProposalForm({
	proposal,
	onSave,
	onCancel,
}: ProposalFormProps) {
	const [clients, setClients] = useState<Client[]>([])
	const [vatRates, setVatRates] = useState<VATRate[]>([])
	const [showConfigurator, setShowConfigurator] = useState(false)
	const [editingGroup, setEditingGroup] = useState<string | null>(null)
	const [newGroupName, setNewGroupName] = useState('')
	const [loading, setLoading] = useState(false)

	const [formData, setFormData] = useState<ProposalDocument>({
		clientId: 0,
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

	useEffect(() => {
		recalculateTotals()
	}, [formData.groups, formData.vatRate])

	const fetchClients = async () => {
		try {
			const response = await fetch('/api/clients')
			const data = await response.json()
			setClients(data)
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

		formData.groups.forEach(group => {
			group.positions.forEach(position => {
				const positionSubtotal = position.unitPrice * position.quantity
				const positionDiscount = positionSubtotal * (position.discount / 100)
				subtotal += positionSubtotal
				totalDiscount += positionDiscount
			})
		})

		const vatAmount = (subtotal - totalDiscount) * (formData.vatRate / 100)
		const total = subtotal - totalDiscount + vatAmount

		setFormData(prev => ({
			...prev,
			subtotal,
			discount: totalDiscount,
			vatAmount,
			total,
		}))
	}

	const handleClientChange = (clientId: string) => {
		setFormData(prev => ({ ...prev, clientId: parseInt(clientId) }))
	}

	const handleVATChange = (vatRateId: string) => {
		const vatRate = vatRates.find(rate => rate.id === vatRateId)
		if (vatRate) {
			setFormData(prev => ({ ...prev, vatRate: vatRate.percentage }))
		}
	}

	const addGroup = () => {
		if (newGroupName.trim()) {
			const newGroup: ProposalGroup = {
				id: Date.now().toString(),
				name: newGroupName.trim(),
				positions: [],
			}
			setFormData(prev => ({
				...prev,
				groups: [...prev.groups, newGroup],
			}))
			setNewGroupName('')
			setEditingGroup(newGroup.id || null)
		}
	}

	const removeGroup = (groupId: string) => {
		setFormData(prev => ({
			...prev,
			groups: prev.groups.filter(group => group.id !== groupId),
		}))
	}

	const handleConfiguratorComplete = (config: Configuration) => {
		if (!editingGroup) return

		const newPosition: ProposalPosition = {
			id: Date.now().toString(),
			categoryId: config.categoryId,
			supplierCategoryId: config.supplierCategoryId,
			configuration: config,
			unitPrice: 0,
			quantity: 1,
			discount: 0,
			total: 0,
			description: generateDescription(config),
		}

		setFormData(prev => ({
			...prev,
			groups: prev.groups.map(group =>
				group.id === editingGroup
					? { ...group, positions: [...group.positions, newPosition] }
					: group
			),
		}))

		setShowConfigurator(false)
	}

	const generateDescription = (config: Configuration): string => {
		// Простая генерация описания из конфигурации
		const params = Object.entries(config.parameters)
			.map(([key, value]) => `${key}: ${value}`)
			.join(', ')
		return `Продукт (${params})`
	}

	const updatePosition = (
		groupId: string,
		positionId: string,
		field: keyof ProposalPosition,
		value: any
	) => {
		setFormData(prev => ({
			...prev,
			groups: prev.groups.map(group =>
				group.id === groupId
					? {
							...group,
							positions: group.positions.map(position =>
								position.id === positionId
									? { ...position, [field]: value }
									: position
							),
					  }
					: group
			),
		}))
	}

	const removePosition = (groupId: string, positionId: string) => {
		setFormData(prev => ({
			...prev,
			groups: prev.groups.map(group =>
				group.id === groupId
					? {
							...group,
							positions: group.positions.filter(pos => pos.id !== positionId),
					  }
					: group
			),
		}))
	}

	const handleSave = async () => {
		if (!formData.clientId || formData.groups.length === 0) {
			alert(
				'Пожалуйста, выберите клиента и добавьте хотя бы одну группу товаров'
			)
			return
		}

		setLoading(true)
		try {
			await onSave(formData)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='max-w-6xl mx-auto p-6'>
			<div className='mb-6'>
				<h2 className='text-2xl font-bold mb-2'>
					{proposal ? 'Редактировать предложение' : 'Новое предложение'}
				</h2>
			</div>

			{/* Основные данные */}
			<Card className='p-6 mb-6'>
				<h3 className='text-lg font-semibold mb-4'>Основные данные</h3>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<div>
						<Label htmlFor='client'>Клиент *</Label>
						<Select
							value={formData.clientId.toString()}
							onValueChange={handleClientChange}
						>
							<SelectTrigger>
								<SelectValue placeholder='Выберите клиента' />
							</SelectTrigger>
							<SelectContent>
								{clients.map(client => (
									<SelectItem key={client.id} value={client.id.toString()}>
										{client.companyName ||
											`${client.firstName} ${client.lastName}`}{' '}
										- {client.phone}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label htmlFor='vat'>НДС</Label>
						<Select
							value={
								vatRates.find(rate => rate.percentage === formData.vatRate)?.id
							}
							onValueChange={handleVATChange}
						>
							<SelectTrigger>
								<SelectValue placeholder='Выберите ставку НДС' />
							</SelectTrigger>
							<SelectContent>
								{vatRates.map(rate => (
									<SelectItem key={rate.id} value={rate.id}>
										{rate.name} ({rate.percentage}%)
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className='mt-4'>
					<Label htmlFor='notes'>Примечания</Label>
					<Textarea
						id='notes'
						value={formData.notes}
						onChange={e =>
							setFormData(prev => ({ ...prev, notes: e.target.value }))
						}
						placeholder='Дополнительные примечания к предложению'
					/>
				</div>
			</Card>

			{/* Группы товаров */}
			<div className='space-y-6'>
				<div className='flex items-center justify-between'>
					<h3 className='text-lg font-semibold'>Группы товаров</h3>
					<div className='flex items-center space-x-2'>
						<Input
							placeholder='Название группы'
							value={newGroupName}
							onChange={e => setNewGroupName(e.target.value)}
							className='w-48'
						/>
						<Button onClick={addGroup} disabled={!newGroupName.trim()}>
							<Plus className='w-4 h-4 mr-2' />
							Добавить группу
						</Button>
					</div>
				</div>

				{formData.groups.map(group => (
					<Card key={group.id} className='p-6'>
						<div className='flex items-center justify-between mb-4'>
							<h4 className='text-lg font-medium'>{group.name}</h4>
							<div className='flex items-center space-x-2'>
								<Button
									variant='outline'
									size='sm'
									onClick={() => setEditingGroup(group.id!)}
								>
									<Plus className='w-4 h-4 mr-2' />
									Добавить товар
								</Button>
								<Button
									variant='outline'
									size='sm'
									onClick={() => removeGroup(group.id!)}
								>
									<Trash2 className='w-4 h-4' />
								</Button>
							</div>
						</div>

						{/* Позиции группы */}
						{group.positions.length > 0 ? (
							<div className='space-y-3'>
								{group.positions.map(position => (
									<div key={position.id} className='border rounded-lg p-4'>
										<div className='grid grid-cols-2 md:grid-cols-5 gap-4 items-end'>
											<div className='md:col-span-2'>
												<Label className='text-sm font-medium'>Описание</Label>
												<div className='text-sm text-gray-600'>
													{position.description}
												</div>
											</div>
											<div>
												<Label htmlFor={`price-${position.id}`}>Цена (€)</Label>
												<Input
													id={`price-${position.id}`}
													type='number'
													step='0.01'
													value={position.unitPrice}
													onChange={e =>
														updatePosition(
															group.id!,
															position.id!,
															'unitPrice',
															parseFloat(e.target.value) || 0
														)
													}
												/>
											</div>
											<div>
												<Label htmlFor={`qty-${position.id}`}>Количество</Label>
												<Input
													id={`qty-${position.id}`}
													type='number'
													value={position.quantity}
													onChange={e =>
														updatePosition(
															group.id!,
															position.id!,
															'quantity',
															parseInt(e.target.value) || 1
														)
													}
												/>
											</div>
											<div>
												<Label htmlFor={`discount-${position.id}`}>
													Скидка (%)
												</Label>
												<div className='flex items-center space-x-1'>
													<Input
														id={`discount-${position.id}`}
														type='number'
														step='0.01'
														value={position.discount}
														onChange={e =>
															updatePosition(
																group.id!,
																position.id!,
																'discount',
																parseFloat(e.target.value) || 0
															)
														}
													/>
													<Button
														variant='outline'
														size='sm'
														onClick={() =>
															removePosition(group.id!, position.id!)
														}
													>
														<X className='w-4 h-4' />
													</Button>
												</div>
											</div>
										</div>

										{/* Итог позиции */}
										<div className='mt-2 text-right'>
											<span className='text-sm text-gray-600'>
												Итого: €
												{(
													position.unitPrice *
													position.quantity *
													(1 - position.discount / 100)
												).toFixed(2)}
											</span>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className='text-center py-8 text-gray-500'>
								<p>В группе пока нет товаров</p>
								<p className='text-sm'>Нажмите "Добавить товар" для начала</p>
							</div>
						)}
					</Card>
				))}
			</div>

			{/* Итоги */}
			{formData.groups.length > 0 && (
				<Card className='p-6 mt-6'>
					<h3 className='text-lg font-semibold mb-4'>Итоги предложения</h3>
					<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
						<div>
							<Label className='text-sm text-gray-600'>Сумма позиций</Label>
							<div className='text-lg font-medium'>
								€{formData.subtotal.toFixed(2)}
							</div>
						</div>
						<div>
							<Label className='text-sm text-gray-600'>Скидка</Label>
							<div className='text-lg font-medium'>
								€{formData.discount.toFixed(2)}
							</div>
						</div>
						<div>
							<Label className='text-sm text-gray-600'>
								НДС ({formData.vatRate}%)
							</Label>
							<div className='text-lg font-medium'>
								€{formData.vatAmount.toFixed(2)}
							</div>
						</div>
						<div>
							<Label className='text-sm text-gray-600'>Итого</Label>
							<div className='text-xl font-bold'>
								€{formData.total.toFixed(2)}
							</div>
						</div>
					</div>
				</Card>
			)}

			{/* Кнопки действий */}
			<div className='flex justify-end space-x-3 mt-6'>
				<Button variant='outline' onClick={onCancel}>
					Отмена
				</Button>
				<Button
					onClick={handleSave}
					disabled={
						loading || !formData.clientId || formData.groups.length === 0
					}
				>
					{loading ? 'Сохранение...' : 'Сохранить предложение'}
					<Save className='w-4 h-4 ml-2' />
				</Button>
			</div>

			{/* Конфигуратор */}
			<Dialog open={showConfigurator} onOpenChange={setShowConfigurator}>
				<DialogContent className='max-w-6xl max-h-[90vh] overflow-y-auto'>
					<DialogHeader>
						<DialogTitle>Конфигуратор продукта</DialogTitle>
					</DialogHeader>
					<ProductConfigurator
						onComplete={handleConfiguratorComplete}
						onCancel={() => setShowConfigurator(false)}
					/>
				</DialogContent>
			</Dialog>
		</div>
	)
}
