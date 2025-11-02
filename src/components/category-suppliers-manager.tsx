'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Building2, Plus, Edit, Trash2, Search, X } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { logger } from '@/lib/logger'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'

interface Supplier {
	id: number
	name: string
	phone: string
	email: string
	contactPerson: string
	status: string
}

interface SupplierCategory {
	id: string
	supplierId: number
	categoryId: string
	supplier: Supplier
	isActive: boolean
	createdAt: string
}

interface CategorySuppliersManagerProps {
	categoryId: string
	categoryName: string
	onSuppliersChange?: (suppliers: number[]) => void
}

export function CategorySuppliersManager({
	categoryId,
	categoryName,
	onSuppliersChange,
}: CategorySuppliersManagerProps) {
	const { t } = useLanguage()
	const [suppliers, setSuppliers] = useState<Supplier[]>([])
	const [supplierCategories, setSupplierCategories] = useState<
		SupplierCategory[]
	>([])
	const [loading, setLoading] = useState(false)
	const [searchTerm, setSearchTerm] = useState('')
	const [showAddModal, setShowAddModal] = useState(false)
	const [availableSuppliers, setAvailableSuppliers] = useState<Supplier[]>([])
	const [selectedSupplierIds, setSelectedSupplierIds] = useState<number[]>([])

	// Загружаем всех поставщиков и связи категории
	useEffect(() => {
		fetchData()
	}, [categoryId])

	const fetchData = async () => {
		try {
			setLoading(true)

			// Загружаем всех поставщиков
			const suppliersResponse = await fetch('/api/suppliers')
			const suppliersData = await suppliersResponse.json()
			setSuppliers(suppliersData)

			// Загружаем связи категории с поставщиками
			const supplierCategoriesResponse = await fetch(
				`/api/supplier-categories?categoryId=${categoryId}`
			)
			const supplierCategoriesData = await supplierCategoriesResponse.json()
			setSupplierCategories(supplierCategoriesData)

			// Определяем доступных поставщиков (тех, кто еще не связан с этой категорией)
			const linkedSupplierIds = supplierCategoriesData.map(
				(sc: SupplierCategory) => sc.supplierId
			)
			const available = suppliersData.filter(
				(supplier: Supplier) => !linkedSupplierIds.includes(supplier.id)
			)
			setAvailableSuppliers(available)
		} catch (error) {
			logger.error('Error fetching data:', error)
		} finally {
			setLoading(false)
		}
	}

	// Добавляем одного поставщика в категорию (для обратной совместимости)
	const addSupplier = async (supplierId: number) => {
		await addMultipleSuppliers([supplierId])
	}

	// Добавляем несколько поставщиков в категорию
	const addMultipleSuppliers = async (supplierIds: number[]) => {
		try {
			setLoading(true)

			// Добавляем каждого поставщика
			const promises = supplierIds.map(supplierId =>
				fetch('/api/supplier-categories', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						supplierId,
						categoryId,
						parameters: {},
					}),
				})
			)

			const responses = await Promise.all(promises)
			const allSuccessful = responses.every(response => response.ok)

			if (allSuccessful) {
				// Обновляем данные
				await fetchData()

				// Уведомляем родительский компонент
				if (onSuppliersChange) {
					const updatedSupplierIds = [
						...supplierCategories.map(sc => sc.supplierId),
						...supplierIds,
					]
					onSuppliersChange(updatedSupplierIds)
				}

				// Очищаем выбор и закрываем модальное окно
				setSelectedSupplierIds([])
				setShowAddModal(false)
			} else {
				alert(t('errorUpdating'))
			}
		} catch (error) {
			logger.error('Error adding suppliers:', error)
			alert(t('errorUpdating'))
		} finally {
			setLoading(false)
		}
	}

	// Обработчики для множественного выбора
	const toggleSupplierSelection = (supplierId: number) => {
		setSelectedSupplierIds(prev =>
			prev.includes(supplierId)
				? prev.filter(id => id !== supplierId)
				: [...prev, supplierId]
		)
	}

	const selectAllSuppliers = () => {
		const allIds = availableSuppliers.map(supplier => supplier.id)
		setSelectedSupplierIds(allIds)
	}

	const clearAllSelections = () => {
		setSelectedSupplierIds([])
	}

	const confirmSelection = () => {
		if (selectedSupplierIds.length > 0) {
			addMultipleSuppliers(selectedSupplierIds)
		}
	}

	// Удаляем связь поставщик-категория
	const removeSupplier = async (supplierCategoryId: string) => {
		try {
			const response = await fetch(
				`/api/supplier-categories/${supplierCategoryId}`,
				{
					method: 'DELETE',
				}
			)

			if (!response.ok) {
				const errorData = await response.json()
				alert(errorData.error || t('errorDeleting'))
				return
			}

			// Обновляем данные
			await fetchData()

			// Уведомляем родительский компонент
			if (onSuppliersChange) {
				const updatedSupplierIds = supplierCategories
					.filter(sc => sc.id !== supplierCategoryId)
					.map(sc => sc.supplierId)
				onSuppliersChange(updatedSupplierIds)
			}
		} catch (error) {
			logger.error('Error removing supplier:', error)
			alert(t('errorDeleting'))
		}
	}

	// Фильтрация поставщиков по поисковому запросу
	const filteredSuppliers = suppliers.filter(
		supplier =>
			supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
			supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
	)

	if (loading) {
		return (
			<Card className='sticker-card-v2'>
				<div className='p-4 text-center text-gray-500'>{t('loading')}...</div>
			</Card>
		)
	}

	return (
		<Card className='sticker-card-v2'>
			<div className='p-4'>
				<div className='flex items-center justify-between mb-4'>
					<div className='flex items-center gap-2'>
						<Building2 className='h-5 w-5 text-gray-600' />
						<h3 className='text-lg font-semibold'>{t('suppliers')}</h3>
						<Badge variant='secondary' className='text-xs'>
							{supplierCategories.length} {t('linked')}
						</Badge>
					</div>
					<Button
						onClick={() => setShowAddModal(true)}
						variant='outline'
						size='sm'
						className='bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
						disabled={availableSuppliers.length === 0}
					>
						<Plus className='h-4 w-4 mr-2' />
						{t('addSupplier')}
					</Button>
				</div>

				<p className='text-sm text-gray-600 mb-4'>
					{t('suppliersForCategory', { category: categoryName })}
				</p>

				{/* Поиск */}
				<div className='mb-4'>
					<div className='relative'>
						<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
						<Input
							placeholder={t('searchSuppliers')}
							value={searchTerm}
							onChange={e => setSearchTerm(e.target.value)}
							className='pl-10 bg-gray-50 border-gray-200 rounded-xl'
						/>
					</div>
				</div>

				{/* Таблица поставщиков */}
				{supplierCategories.length > 0 ? (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className='text-xs'>Название</TableHead>
								<TableHead className='text-xs'>Контактное лицо</TableHead>
								<TableHead className='text-xs'>Телефон</TableHead>
								<TableHead className='text-xs'>Email</TableHead>
								<TableHead className='text-xs'>Статус</TableHead>
								<TableHead className='text-right text-xs'>Действия</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{supplierCategories
								.filter(
									sc =>
										searchTerm === '' ||
										sc.supplier.name
											.toLowerCase()
											.includes(searchTerm.toLowerCase()) ||
										sc.supplier.contactPerson
											.toLowerCase()
											.includes(searchTerm.toLowerCase()) ||
										sc.supplier.email
											.toLowerCase()
											.includes(searchTerm.toLowerCase())
								)
								.map(supplierCategory => (
									<TableRow
										key={supplierCategory.id}
										className='hover:bg-gray-50'
									>
										<TableCell className='font-medium text-sm'>
											{supplierCategory.supplier.name}
										</TableCell>
										<TableCell className='text-sm text-gray-600'>
											{supplierCategory.supplier.contactPerson}
										</TableCell>
										<TableCell className='text-sm text-gray-600'>
											{supplierCategory.supplier.phone}
										</TableCell>
										<TableCell className='text-sm text-gray-600'>
											{supplierCategory.supplier.email}
										</TableCell>
										<TableCell>
											<Badge
												variant={
													supplierCategory.supplier.status === 'active'
														? 'default'
														: 'secondary'
												}
												className='text-xs'
											>
												{supplierCategory.supplier.status === 'active'
													? 'Активен'
													: 'Неактивен'}
											</Badge>
										</TableCell>
										<TableCell className='text-right'>
											<Button
												variant='outline'
												size='sm'
												onClick={() => removeSupplier(supplierCategory.id)}
												className='text-red-600 hover:bg-red-50'
											>
												<Trash2 className='h-4 w-4' />
											</Button>
										</TableCell>
									</TableRow>
								))}
						</TableBody>
					</Table>
				) : (
					<div className='text-center py-8 text-gray-500'>
						<Building2 className='h-12 w-12 mx-auto mb-4 text-gray-300' />
						<p className='text-lg font-medium mb-2'>{t('noLinkedSuppliers')}</p>
						<p className='text-sm'>{t('addSuppliersToCategory')}</p>
					</div>
				)}

				{/* Статистика */}
				<div className='mt-4 pt-4 border-t border-gray-200'>
					<div className='flex justify-between text-sm text-gray-600'>
						<span>
							{t('totalSuppliers')}: {suppliers.length}
						</span>
						<span>
							{t('linked')}: {supplierCategories.length}
						</span>
						<span>
							{t('available')}: {availableSuppliers.length}
						</span>
					</div>
				</div>
			</div>

			{/* Модальное окно добавления поставщика */}
			<Dialog
				open={showAddModal}
				onOpenChange={open => {
					setShowAddModal(open)
					if (!open) {
						setSelectedSupplierIds([])
					}
				}}
			>
				<DialogContent className='max-w-2xl w-[95vw] max-h-[80vh] overflow-y-auto'>
					<DialogHeader>
						<DialogTitle className='flex items-center gap-2'>
							<Plus className='h-5 w-5' />
							{t('addSuppliersToCategory')}
						</DialogTitle>
						<DialogDescription>{t('selectSuppliersToAdd')}</DialogDescription>
					</DialogHeader>

					<div className='space-y-4 py-4'>
						{/* Поиск */}
						<div className='relative'>
							<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
							<Input
								placeholder={t('searchSuppliers')}
								value={searchTerm}
								onChange={e => setSearchTerm(e.target.value)}
								className='pl-10'
							/>
						</div>

						{/* Кнопки управления выбором */}
						{availableSuppliers.length > 0 && (
							<div className='flex gap-2'>
								<Button
									variant='outline'
									size='sm'
									onClick={selectAllSuppliers}
									disabled={
										selectedSupplierIds.length === availableSuppliers.length
									}
								>
									{t('selectAll')}
								</Button>
								<Button
									variant='outline'
									size='sm'
									onClick={clearAllSelections}
									disabled={selectedSupplierIds.length === 0}
								>
									{t('clearAll')}
								</Button>
								<div className='ml-auto text-sm text-gray-500 flex items-center'>
									{t('selected')}: {selectedSupplierIds.length} /{' '}
									{availableSuppliers.length}
								</div>
							</div>
						)}

						{/* Список поставщиков */}
						{availableSuppliers.length > 0 ? (
							<div className='space-y-2 max-h-60 overflow-y-auto'>
								{availableSuppliers.map(supplier => (
									<div
										key={supplier.id}
										className={`p-3 border rounded-lg transition-colors cursor-pointer ${
											selectedSupplierIds.includes(supplier.id)
												? 'border-green-300 bg-green-50'
												: 'border-gray-200 hover:bg-gray-50'
										}`}
										onClick={() => toggleSupplierSelection(supplier.id)}
									>
										<div className='flex items-center gap-3'>
											<Checkbox
												checked={selectedSupplierIds.includes(supplier.id)}
												onChange={() => toggleSupplierSelection(supplier.id)}
												onClick={e => e.stopPropagation()}
											/>
											<div className='flex-1'>
												<h4 className='font-medium text-gray-900'>
													{supplier.name}
												</h4>
												{supplier.contactPerson && (
													<p className='text-sm text-gray-500'>
														{supplier.contactPerson}
													</p>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className='text-center py-8 text-gray-500'>
								<p>{t('noAvailableSuppliers')}</p>
							</div>
						)}

						{/* Кнопки действий */}
						{selectedSupplierIds.length > 0 && (
							<div className='flex justify-end gap-3 pt-4 border-t'>
								<Button
									variant='outline'
									onClick={() => {
										setSelectedSupplierIds([])
										setShowAddModal(false)
									}}
								>
									{t('cancel')}
								</Button>
								<Button
									onClick={confirmSelection}
									disabled={loading}
									className='bg-green-600 hover:bg-green-700'
								>
									{loading
										? t('adding')
										: `${t('addSelected')} (${selectedSupplierIds.length})`}
								</Button>
							</div>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</Card>
	)
}
