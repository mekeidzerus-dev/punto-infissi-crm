'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLanguage } from '@/contexts/LanguageContext'
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
import {
	ProductConfigurator,
	Configuration,
} from '@/components/product-configurator'
import { Plus, Trash2, Save, X, Search, UserPlus, Calendar } from 'lucide-react'

interface Client {
	id: number
	firstName?: string
	lastName?: string
	companyName?: string
	phone: string
	email?: string
	type: string
}

interface VATRate {
	id: string
	name: string
	percentage: number
	isDefault: boolean
}

interface ProposalPosition {
	id?: string
	categoryId: string
	supplierCategoryId: string
	configuration: Configuration
	unitPrice: number
	quantity: number
	discount: number
	vatRate: number
	vatAmount: number
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
	proposalDate?: string
	clientId: number
	responsibleManager?: string
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

export function ProposalFormV2({
	proposal,
	onSave,
	onCancel,
}: ProposalFormProps) {
	const { t } = useLanguage()
	const [clients, setClients] = useState<Client[]>([])
	const [vatRates, setVatRates] = useState<VATRate[]>([])
	const [showConfigurator, setShowConfigurator] = useState(false)
	const [currentGroupIndex, setCurrentGroupIndex] = useState<number | null>(
		null
	)
	const [loading, setLoading] = useState(false)

	// Поиск клиента
	const [clientSearchTerm, setClientSearchTerm] = useState('')
	const [showClientSearch, setShowClientSearch] = useState(false)
	const [showNewClientForm, setShowNewClientForm] = useState(false)
	const [filteredClients, setFilteredClients] = useState<Client[]>([])

	const [formData, setFormData] = useState<ProposalDocument>({
		proposalDate: new Date().toISOString().split('T')[0],
		clientId: 0,
		responsibleManager: 'Администратор', // TODO: Получать из контекста пользователя
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

	useEffect(() => {
		if (clientSearchTerm) {
			const filtered = clients.filter(client => {
				const searchLower = clientSearchTerm.toLowerCase()
				const fullName =
					client.companyName || `${client.firstName} ${client.lastName}`
				return (
					fullName.toLowerCase().includes(searchLower) ||
					client.phone.includes(searchLower) ||
					client.email?.toLowerCase().includes(searchLower)
				)
			})
			setFilteredClients(filtered)
		} else {
			setFilteredClients(clients)
		}
	}, [clientSearchTerm, clients])

	const fetchClients = async () => {
		try {
			const response = await fetch('/api/clients')
			const data = await response.json()
			setClients(data)
			setFilteredClients(data)
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

	const handleClientSelect = (clientId: number) => {
		setFormData(prev => ({ ...prev, clientId }))
		setShowClientSearch(false)
		setClientSearchTerm('')
	}

	const handleCreateNewClient = async () => {
		// TODO: Открыть форму создания клиента
		setShowNewClientForm(true)
	}

	const handleVATChange = (vatRateId: string) => {
		const vatRate = vatRates.find(rate => rate.id === vatRateId)
		if (vatRate) {
			setFormData(prev => ({ ...prev, vatRate: vatRate.percentage }))
		}
	}

	const addGroup = () => {
		const newGroup: ProposalGroup = {
			id: Date.now().toString(),
			name: `Gruppo ${formData.groups.length + 1}`,
			positions: [],
		}
		setFormData(prev => ({
			...prev,
			groups: [...prev.groups, newGroup],
		}))
	}

	const removeGroup = (groupIndex: number) => {
		setFormData(prev => ({
			...prev,
			groups: prev.groups.filter((_, i) => i !== groupIndex),
		}))
	}

	const updateGroupName = (groupIndex: number, name: string) => {
		setFormData(prev => ({
			...prev,
			groups: prev.groups.map((group, i) =>
				i === groupIndex ? { ...group, name } : group
			),
		}))
	}

	const handleConfiguratorComplete = (config: Configuration) => {
		if (currentGroupIndex === null) return

		const newPosition: ProposalPosition = {
			id: Date.now().toString(),
			categoryId: config.categoryId,
			supplierCategoryId: config.supplierCategoryId,
			configuration: config,
			unitPrice: 0,
			quantity: 1,
			discount: 0,
			vatRate: 22.0,
			vatAmount: 0,
			total: 0,
			description: generateDescription(config),
		}

		setFormData(prev => ({
			...prev,
			groups: prev.groups.map((group, i) =>
				i === currentGroupIndex
					? { ...group, positions: [...group.positions, newPosition] }
					: group
			),
		}))

		setShowConfigurator(false)
		setCurrentGroupIndex(null)
	}

	const generateDescription = (config: Configuration): string => {
		const params = Object.entries(config.parameters)
			.map(([key, value]) => `${key}: ${value}`)
			.join(', ')
		return params
	}

	const updatePosition = (
		groupIndex: number,
		positionIndex: number,
		field: keyof ProposalPosition,
		value: any
	) => {
		setFormData(prev => ({
			...prev,
			groups: prev.groups.map((group, gi) =>
				gi === groupIndex
					? {
							...group,
							positions: group.positions.map((position, pi) =>
								pi === positionIndex
									? { ...position, [field]: value }
									: position
							),
					  }
					: group
			),
		}))
	}

	const removePosition = (groupIndex: number, positionIndex: number) => {
		setFormData(prev => ({
			...prev,
			groups: prev.groups.map((group, gi) =>
				gi === groupIndex
					? {
							...group,
							positions: group.positions.filter(
								(_, pi) => pi !== positionIndex
							),
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

	const selectedClient = clients.find(c => c.id === formData.clientId)

	return (
		<div className='max-w-7xl mx-auto'>
			{/* Шапка документа */}
			<Card className='p-6 mb-6'>
				<div className='flex items-center justify-between mb-6'>
					<div>
						<h2 className='text-2xl font-bold text-gray-900'>
							{proposal ? 'Редактировать предложение' : 'Nuovo preventivo'}
						</h2>
						<p className='text-sm text-gray-500 mt-1'>
							Заполните данные предложения для клиента
						</p>
					</div>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
					{/* Дата предложения */}
					<div>
						<Label htmlFor='proposalDate' className='flex items-center gap-2'>
							<Calendar className='h-4 w-4 text-gray-500' />
							Data preventivo *
						</Label>
						<Input
							id='proposalDate'
							type='date'
							value={formData.proposalDate}
							onChange={e =>
								setFormData(prev => ({ ...prev, proposalDate: e.target.value }))
							}
							className='mt-2'
						/>
					</div>

					{/* Ответственный */}
					<div>
						<Label htmlFor='responsibleManager'>Responsabile *</Label>
						<Input
							id='responsibleManager'
							value={formData.responsibleManager}
							onChange={e =>
								setFormData(prev => ({
									...prev,
									responsibleManager: e.target.value,
								}))
							}
							placeholder='Имя ответственного'
							className='mt-2'
						/>
					</div>

					{/* НДС */}
					<div>
						<Label htmlFor='vat'>IVA</Label>
						<Select
							value={
								vatRates.find(rate => rate.percentage === formData.vatRate)?.id
							}
							onValueChange={handleVATChange}
						>
							<SelectTrigger className='mt-2'>
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

				{/* Выбор клиента */}
				<div className='mt-6'>
					<Label className='flex items-center gap-2 mb-2'>
						<Search className='h-4 w-4 text-gray-500' />
						Cliente *
					</Label>

					{selectedClient ? (
						<Card className='p-4 bg-blue-50 border-blue-200'>
							<div className='flex items-center justify-between'>
								<div>
									<div className='font-medium text-gray-900'>
										{selectedClient.companyName ||
											`${selectedClient.firstName} ${selectedClient.lastName}`}
									</div>
									<div className='text-sm text-gray-600 mt-1'>
										📞 {selectedClient.phone}
										{selectedClient.email && ` • ✉️ ${selectedClient.email}`}
									</div>
								</div>
								<Button
									variant='outline'
									size='sm'
									onClick={() => {
										setFormData(prev => ({ ...prev, clientId: 0 }))
										setShowClientSearch(true)
									}}
								>
									Изменить
								</Button>
							</div>
						</Card>
					) : (
						<div className='space-y-3'>
							<Input
								placeholder='Cerca cliente per nome, telefono, email...'
								value={clientSearchTerm}
								onChange={e => {
									setClientSearchTerm(e.target.value)
									setShowClientSearch(true)
								}}
								onFocus={() => setShowClientSearch(true)}
								className='text-base'
							/>

							{showClientSearch && (
								<Card className='max-h-64 overflow-y-auto'>
									{filteredClients.length > 0 ? (
										<div className='divide-y'>
											{filteredClients.map(client => (
												<div
													key={client.id}
													className='p-3 hover:bg-gray-50 cursor-pointer transition-colors'
													onClick={() => handleClientSelect(client.id)}
												>
													<div className='font-medium'>
														{client.companyName ||
															`${client.firstName} ${client.lastName}`}
													</div>
													<div className='text-sm text-gray-600 mt-1'>
														{client.phone}
														{client.email && ` • ${client.email}`}
													</div>
												</div>
											))}
										</div>
									) : (
										<div className='p-6 text-center'>
											<div className='text-gray-500 mb-3'>
												Cliente non trovato
											</div>
											<Button
												onClick={handleCreateNewClient}
												variant='outline'
												size='sm'
											>
												<UserPlus className='h-4 w-4 mr-2' />
												Crea nuovo cliente
											</Button>
										</div>
									)}
								</Card>
							)}
						</div>
					)}
				</div>
			</Card>

			{/* Группы товаров */}
			<Card className='p-6 mb-6'>
				<div className='flex items-center justify-between mb-6'>
					<h3 className='text-lg font-semibold text-gray-900'>
						Elenco prodotti
					</h3>
					<Button onClick={addGroup} size='sm'>
						<Plus className='w-4 h-4 mr-2' />
						Aggiungi gruppo
					</Button>
				</div>

				{formData.groups.length === 0 ? (
					<div className='text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg'>
						<div className='text-lg mb-2'>Nessun gruppo di prodotti</div>
						<p className='text-sm'>Aggiungi un gruppo per iniziare</p>
					</div>
				) : (
					<div className='space-y-6'>
						{formData.groups.map((group, groupIndex) => (
							<Card key={group.id} className='p-6 bg-gray-50'>
								<div className='flex items-center justify-between mb-4'>
									<Input
										value={group.name}
										onChange={e => updateGroupName(groupIndex, e.target.value)}
										className='font-medium text-lg max-w-md bg-white'
									/>
									<div className='flex items-center space-x-2'>
										<Button
											variant='outline'
											size='sm'
											onClick={() => {
												setCurrentGroupIndex(groupIndex)
												setShowConfigurator(true)
											}}
										>
											<Plus className='w-4 h-4 mr-2' />
											Aggiungi prodotto
										</Button>
										<Button
											variant='outline'
											size='sm'
											onClick={() => removeGroup(groupIndex)}
										>
											<Trash2 className='w-4 h-4 text-red-600' />
										</Button>
									</div>
								</div>

								{/* Таблица позиций */}
								{group.positions.length > 0 ? (
									<div className='bg-white rounded-lg overflow-hidden border'>
										<table className='w-full'>
											<thead className='bg-gray-100 border-b'>
												<tr>
													<th className='text-left py-3 px-4 font-medium text-sm'>
														Descrizione
													</th>
													<th className='text-center py-3 px-4 font-medium text-sm w-24'>
														Q.tà
													</th>
													<th className='text-right py-3 px-4 font-medium text-sm w-32'>
														Prezzo €
													</th>
													<th className='text-center py-3 px-4 font-medium text-sm w-24'>
														Sconto %
													</th>
													<th className='text-right py-3 px-4 font-medium text-sm w-32'>
														Totale €
													</th>
													<th className='text-center py-3 px-4 font-medium text-sm w-20'></th>
												</tr>
											</thead>
											<tbody className='divide-y'>
												{group.positions.map((position, positionIndex) => {
													const positionTotal =
														position.unitPrice *
														position.quantity *
														(1 - position.discount / 100)
													return (
														<tr key={position.id} className='hover:bg-gray-50'>
															<td className='py-3 px-4'>
																<div className='text-sm'>
																	{position.description}
																</div>
															</td>
															<td className='py-3 px-4'>
																<Input
																	type='number'
																	value={position.quantity}
																	onChange={e =>
																		updatePosition(
																			groupIndex,
																			positionIndex,
																			'quantity',
																			parseFloat(e.target.value) || 1
																		)
																	}
																	className='text-center w-full'
																	min='1'
																	step='1'
																/>
															</td>
															<td className='py-3 px-4'>
																<Input
																	type='number'
																	value={position.unitPrice}
																	onChange={e =>
																		updatePosition(
																			groupIndex,
																			positionIndex,
																			'unitPrice',
																			parseFloat(e.target.value) || 0
																		)
																	}
																	className='text-right w-full'
																	min='0'
																	step='0.01'
																/>
															</td>
															<td className='py-3 px-4'>
																<Input
																	type='number'
																	value={position.discount}
																	onChange={e =>
																		updatePosition(
																			groupIndex,
																			positionIndex,
																			'discount',
																			parseFloat(e.target.value) || 0
																		)
																	}
																	className='text-center w-full'
																	min='0'
																	max='100'
																	step='1'
																/>
															</td>
															<td className='py-3 px-4 text-right font-medium'>
																€{positionTotal.toFixed(2)}
															</td>
															<td className='py-3 px-4 text-center'>
																<Button
																	variant='outline'
																	size='sm'
																	className='text-red-600 hover:bg-red-50'
																	onClick={() =>
																		removePosition(groupIndex, positionIndex)
																	}
																>
																	<X className='w-4 h-4 text-red-600' />
																</Button>
															</td>
														</tr>
													)
												})}
											</tbody>
										</table>
									</div>
								) : (
									<div className='text-center py-8 text-gray-500 bg-white rounded-lg border-2 border-dashed'>
										<p className='text-sm'>Nessun prodotto in questo gruppo</p>
									</div>
								)}
							</Card>
						))}
					</div>
				)}
			</Card>

			{/* Итоги */}
			{formData.groups.length > 0 && (
				<Card className='p-6 mb-6'>
					<h3 className='text-lg font-semibold mb-4'>Totale preventivo</h3>
					<div className='space-y-3'>
						<div className='flex justify-between text-sm'>
							<span className='text-gray-600'>Subtotale</span>
							<span className='font-medium'>
								€{formData.subtotal.toFixed(2)}
							</span>
						</div>
						{formData.discount > 0 && (
							<div className='flex justify-between text-sm'>
								<span className='text-gray-600'>Sconto</span>
								<span className='font-medium text-red-600'>
									-€{formData.discount.toFixed(2)}
								</span>
							</div>
						)}
						<div className='flex justify-between text-sm'>
							<span className='text-gray-600'>IVA ({formData.vatRate}%)</span>
							<span className='font-medium'>
								€{formData.vatAmount.toFixed(2)}
							</span>
						</div>
						<div className='border-t pt-3 flex justify-between'>
							<span className='text-lg font-semibold'>Totale</span>
							<span className='text-2xl font-bold text-green-600'>
								€{formData.total.toFixed(2)}
							</span>
						</div>
					</div>
				</Card>
			)}

			{/* Примечания */}
			<Card className='p-6 mb-6'>
				<Label htmlFor='notes'>Note</Label>
				<Textarea
					id='notes'
					value={formData.notes}
					onChange={e =>
						setFormData(prev => ({ ...prev, notes: e.target.value }))
					}
					placeholder='Note aggiuntive sul preventivo...'
					className='mt-2'
					rows={4}
				/>
			</Card>

			{/* Кнопки действий */}
			<div className='flex justify-end space-x-3'>
				<Button variant='outline' onClick={onCancel} disabled={loading}>
					Annulla
				</Button>
				<Button
					onClick={handleSave}
					disabled={
						loading || !formData.clientId || formData.groups.length === 0
					}
				>
					{loading ? 'Salvataggio...' : 'Salva preventivo'}
					<Save className='w-4 h-4 ml-2' />
				</Button>
			</div>

			{/* Конфигуратор */}
			<Dialog open={showConfigurator} onOpenChange={setShowConfigurator}>
				<DialogContent className='max-w-6xl max-h-[90vh] overflow-y-auto'>
					<DialogHeader>
						<DialogTitle>Configuratore prodotto</DialogTitle>
					</DialogHeader>
					<ProductConfigurator
						onComplete={handleConfiguratorComplete}
						onCancel={() => {
							setShowConfigurator(false)
							setCurrentGroupIndex(null)
						}}
					/>
				</DialogContent>
			</Dialog>
		</div>
	)
}
