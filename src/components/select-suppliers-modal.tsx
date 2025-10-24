'use client'

import { useState, useEffect } from 'react'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Search,
	Building2,
	Star,
	Settings,
	X,
	MapPin,
	ShoppingCart,
	Truck,
	Edit,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { SupplierCard } from './supplier-card'
import { SupplierFormModal } from './supplier-form-modal'

interface Supplier {
	id: number
	name: string
	rating: number
	logo?: string
	parametersCount: number
	categoriesCount: number
	notes: string
	paymentTerms: string
	deliveryDays: number
	minOrderAmount: number
	contactPerson: string
	email: string
	phone: string
	address: string
}

interface SelectSuppliersModalProps {
	isOpen: boolean
	onClose: () => void
	onSuppliersSelected: (supplierIds: number[]) => void
	categoryId: string
}

export function SelectSuppliersModal({
	isOpen,
	onClose,
	onSuppliersSelected,
	categoryId,
}: SelectSuppliersModalProps) {
	const { t } = useLanguage()
	const [suppliers, setSuppliers] = useState<Supplier[]>([])
	const [loading, setLoading] = useState(false)
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedSuppliers, setSelectedSuppliers] = useState<number[]>([])
	const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
	const [showEditModal, setShowEditModal] = useState(false)

	// Загружаем данные при открытии модалки
	useEffect(() => {
		if (isOpen) {
			loadModalData()
		}
	}, [isOpen, categoryId])

	const loadModalData = async () => {
		setLoading(true)
		try {
			// Загружаем всех поставщиков
			const suppliersResponse = await fetch('/api/suppliers')
			const suppliers = await suppliersResponse.json()
			setSuppliers(suppliers)

			// Загружаем уже привязанных к категории
			const categorySuppliersResponse = await fetch(
				`/api/supplier-categories?categoryId=${categoryId}`
			)
			const categorySuppliers = await categorySuppliersResponse.json()
			const supplierIds = categorySuppliers.map((item: any) => item.supplierId)
			setSelectedSuppliers(supplierIds)
		} catch (error) {
			console.error('Error loading modal data:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleSupplierToggle = async (supplierId: number) => {
		const isCurrentlySelected = selectedSuppliers.includes(supplierId)

		try {
			if (isCurrentlySelected) {
				// СНИМАЕМ ВЫДЕЛЕНИЕ - ОТВЯЗЫВАЕМ
				await fetch('/api/supplier-categories', {
					method: 'DELETE',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ categoryId, supplierId }),
				})

				setSelectedSuppliers(prev => prev.filter(id => id !== supplierId))
			} else {
				// ДОБАВЛЯЕМ ВЫДЕЛЕНИЕ - ПРИВЯЗЫВАЕМ
				await fetch('/api/supplier-categories', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ categoryId, supplierId }),
				})

				setSelectedSuppliers(prev => [...prev, supplierId])
			}

			// НЕ закрываем модалку - позволяем выбирать несколько
			// НЕ вызываем onSuppliersSelected - изменения уже применены
		} catch (error) {
			console.error('Error toggling supplier:', error)
		}
	}

	const handleSelectAll = () => {
		if (selectedSuppliers.length === suppliers.length) {
			setSelectedSuppliers([])
		} else {
			setSelectedSuppliers(suppliers.map(s => s.id))
		}
	}

	const handleClose = () => {
		// Обновляем данные при закрытии модалки
		onSuppliersSelected(selectedSuppliers)
		onClose()
	}

	const filteredSuppliers = suppliers.filter(supplier =>
		supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
	)

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='max-w-4xl max-h-[80vh] overflow-hidden'>
				<DialogHeader>
					<DialogTitle className='text-xl font-semibold'>
						{t('selectSuppliersForCategory')}
					</DialogTitle>
				</DialogHeader>

				<div className='flex flex-col h-full'>
					{/* Поиск и фильтры */}
					<div className='flex items-center gap-4 mb-6'>
						<div className='relative flex-1'>
							<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
							<Input
								placeholder={t('searchSuppliers')}
								value={searchTerm}
								onChange={e => setSearchTerm(e.target.value)}
								className='pl-10'
							/>
						</div>
						<Button
							variant='outline'
							onClick={handleSelectAll}
							className='whitespace-nowrap'
						>
							{selectedSuppliers.length === suppliers.length
								? t('deselectAll')
								: t('selectAll')}
						</Button>
					</div>

					{/* Список поставщиков */}
					<div className='flex-1 overflow-y-auto max-h-[50vh]'>
						{loading ? (
							<div className='flex items-center justify-center h-64'>
								<div className='text-gray-500'>{t('loading')}</div>
							</div>
						) : (
							<div className='grid grid-cols-3 gap-3'>
								{filteredSuppliers.map(supplier => (
									<SupplierCard
										key={supplier.id}
										supplier={supplier}
										isSelected={selectedSuppliers.includes(supplier.id)}
										onClick={() => handleSupplierToggle(supplier.id)}
										onEdit={supplier => {
											setEditingSupplier(supplier)
											setShowEditModal(true)
										}}
										showEditButton={true}
									/>
								))}
							</div>
						)}
					</div>

					{/* Кнопки действий */}
					<div className='flex items-center justify-between pt-4 border-t border-gray-200'>
						<div className='text-sm text-gray-600'>
							{t('selectedSuppliers')}: {selectedSuppliers.length}
						</div>
						<Button variant='outline' onClick={handleClose}>
							{t('close')}
						</Button>
					</div>
				</div>
			</DialogContent>

			{/* Модальное окно редактирования поставщика */}
			{showEditModal && editingSupplier && (
				<SupplierFormModal
					isOpen={showEditModal}
					onClose={() => {
						setShowEditModal(false)
						setEditingSupplier(null)
					}}
					onSave={async supplierData => {
						try {
							// Сохраняем изменения в API
							await fetch('/api/suppliers', {
								method: 'PUT',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({
									id: editingSupplier.id,
									...supplierData,
								}),
							})

							// Обновляем список поставщиков
							await loadModalData()
							setShowEditModal(false)
							setEditingSupplier(null)
						} catch (error) {
							console.error('Error saving supplier:', error)
						}
					}}
					initialData={editingSupplier}
				/>
			)}
		</Dialog>
	)
}
