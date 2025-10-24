'use client'

import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
	X,
	ArrowLeft,
	List,
	Plus,
	Edit,
	Trash2,
	Settings,
	Building2,
	Check,
	CreditCard,
	Truck,
	MapPin,
	ShoppingCart,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { showSupplierInactiveToast } from '@/lib/toast'
import { Card, CardContent } from '@/components/ui/card'
import { AddCategoryModal } from '@/components/add-category-modal'
import { SupplierCard } from './supplier-card'
import { SelectSuppliersModal } from './select-suppliers-modal'
import { ParametersConfiguration } from './parameters-configuration'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'

interface ProductConfiguratorV2Props {
	isOpen: boolean
	onClose: () => void
	onProductCreated: (product: unknown) => void
}

interface CategoryWithCounts {
	id: string
	name: string
	icon: string
	description?: string
	parametersCount: number
	suppliersCount: number
}

// Функция для безопасного рендеринга иконки (SVG из базы)
const renderIcon = (icon: string) => {
	if (icon && icon.includes('<svg')) {
		return (
			<div
				className='w-12 h-12 flex items-center justify-center text-gray-700'
				dangerouslySetInnerHTML={{ __html: icon }}
			/>
		)
	}

	// Fallback на иконку по умолчанию
	return (
		<div className='w-12 h-12 flex items-center justify-center text-gray-700'>
			<List className='h-6 w-6' />
		</div>
	)
}

export function ProductConfiguratorV2({
	isOpen,
	onClose,
}: ProductConfiguratorV2Props) {
	const { t } = useLanguage()

	// Состояние конфигуратора
	const [currentStep, setCurrentStep] = useState(1)
	const [selectedCategory, setSelectedCategory] =
		useState<CategoryWithCounts | null>(null)
	const [selectedSupplier, setSelectedSupplier] = useState<{
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
		status: string
	} | null>(null)

	// Состояние для категорий
	const [categories, setCategories] = useState<CategoryWithCounts[]>([])
	const [categoriesLoading, setCategoriesLoading] = useState(true)

	// Состояние для поставщиков категории
	const [categorySuppliers, setCategorySuppliers] = useState<
		Array<{
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
			status: string
		}>
	>([])
	const [suppliersLoading, setSuppliersLoading] = useState(false)
	const [showSupplierModal, setShowSupplierModal] = useState(false)

	// Состояние для модалки категорий
	const [showAddModal, setShowAddModal] = useState(false)
	const [editingCategory, setEditingCategory] =
		useState<CategoryWithCounts | null>(null)

	// Загрузка категорий при открытии
	useEffect(() => {
		if (isOpen) {
			loadCategories()
		}
	}, [isOpen])

	// Загрузка категорий
	const loadCategories = async () => {
		setCategoriesLoading(true)
		try {
			const response = await fetch('/api/categories/with-counts')
			if (response.ok) {
				const data = await response.json()
				setCategories(data)
			} else {
				console.error('Failed to load categories')
			}
		} catch (error) {
			console.error('Error loading categories:', error)
		} finally {
			setCategoriesLoading(false)
		}
	}

	// Загрузка поставщиков для выбранной категории
	const loadCategorySuppliers = useCallback(async () => {
		if (!selectedCategory) return

		try {
			setSuppliersLoading(true)
			const response = await fetch(
				`/api/supplier-categories?categoryId=${selectedCategory.id}`
			)
			if (response.ok) {
				const data = await response.json()
				// Преобразуем данные из формата API в плоскую структуру
				const suppliers = data.map((item: any) => ({
					id: item.supplier.id,
					name: item.supplier.name,
					rating: item.supplier.rating,
					logo: item.supplier.logo,
					parametersCount: selectedCategory?.parametersCount || 0, // Реальное количество параметров категории
					categoriesCount: 0, // TODO: добавить подсчет категорий
					notes: item.supplier.notes,
					paymentTerms: item.supplier.paymentTerms,
					deliveryDays: item.supplier.deliveryDays,
					minOrderAmount: item.supplier.minOrderAmount,
					contactPerson: item.supplier.contactPerson,
					email: item.supplier.email,
					phone: item.supplier.phone,
					address: item.supplier.address,
					status: item.supplier.status,
				}))
				setCategorySuppliers(suppliers)
			} else {
				console.error('Failed to load category suppliers')
			}
		} catch (error) {
			console.error('Error loading category suppliers:', error)
		} finally {
			setSuppliersLoading(false)
		}
	}, [selectedCategory])

	// Загрузка поставщиков при переходе на шаг 2
	useEffect(() => {
		if (currentStep === 2 && selectedCategory) {
			loadCategorySuppliers()
		}
	}, [currentStep, selectedCategory, loadCategorySuppliers])

	// Обработчики
	const handleClose = () => {
		setCurrentStep(1)
		setSelectedCategory(null)
		setSelectedSupplier(null) // Добавляю сброс поставщика
		onClose()
	}

	const handleBack = () => {
		if (currentStep > 1) {
			setCurrentStep(prev => prev - 1)
			// При возврате на шаг 1 сбрасываем поставщика
			if (currentStep === 2) {
				setSelectedSupplier(null)
			}
		}
	}

	const handleCategorySelect = (category: CategoryWithCounts) => {
		setSelectedCategory(category)
		setSelectedSupplier(null) // Сбрасываем поставщика при выборе новой категории

		// Автоматический переход к следующему шагу
		setTimeout(() => {
			setCurrentStep(2)
		}, 300)
	}

	// Обработчики для категорий
	const handleAddCategory = () => {
		setEditingCategory(null)
		setShowAddModal(true)
	}

	const handleEditClick = (
		e: React.MouseEvent,
		category: CategoryWithCounts
	) => {
		e.stopPropagation()
		setEditingCategory(category)
		setShowAddModal(true)
	}

	const handleDeleteClick = async (e: React.MouseEvent, categoryId: string) => {
		e.stopPropagation()

		if (window.confirm(t('confirmDeleteCategory'))) {
			try {
				const response = await fetch(`/api/product-categories/${categoryId}`, {
					method: 'DELETE',
				})

				if (response.ok) {
					await loadCategories()
					// Если удаленная категория была выбрана, сбрасываем выбор
					if (selectedCategory?.id === categoryId) {
						setSelectedCategory(null)
						setSelectedSupplier(null) // Также сбрасываем поставщика
					}
				} else {
					console.error('Failed to delete category')
				}
			} catch (error) {
				console.error('Error deleting category:', error)
			}
		}
	}

	const handleModalClose = () => {
		setShowAddModal(false)
		setEditingCategory(null)
	}

	const handleCategorySaved = async () => {
		await loadCategories()
		setShowAddModal(false)
		setEditingCategory(null)
	}

	// Обработчики для поставщиков
	const handleAddSupplier = () => {
		setShowSupplierModal(true)
	}

	const handleSupplierModalClose = () => {
		setShowSupplierModal(false)
	}

	const handleSuppliersAdded = async (supplierIds: number[]) => {
		// Просто обновляем данные - изменения уже применены в модалке
		await loadCategorySuppliers()
		await loadCategories()
		// НЕ закрываем модалку автоматически - пользователь закрывает сам
	}

	const handleSupplierSelect = (supplier: {
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
		status: string
	}) => {
		setSelectedSupplier(supplier)
		// Автоматический переход к следующему шагу
		setTimeout(() => {
			setCurrentStep(3)
		}, 300)
	}

	const handleInactiveSupplierClick = () => {
		// Используем переводы из системы i18n
		showSupplierInactiveToast(
			t('supplierInactiveTitle'),
			t('supplierInactiveMessage')
		)
	}

	// Обработка завершения конфигурации параметров
	const handleConfigurationComplete = (configuration: Record<string, any>) => {
		console.log('Configuration completed:', configuration)
		// Здесь можно добавить логику сохранения конфигурации
		// Пока просто закрываем модалку
		handleClose()
	}

	// Обработка отмены
	const handleCancel = () => {
		handleClose()
	}

	// Рендер контента для каждого шага
	const renderStepContent = () => {
		switch (currentStep) {
			case 1:
				return (
					<div className='h-full'>
						{/* Заголовок секции + кнопка */}
						<div className='mb-8 flex items-center justify-between'>
							<h3 className='text-2xl font-medium text-gray-900'>
								{t('selectCategory')}
							</h3>
							<Button
								onClick={handleAddCategory}
								className='bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-sm font-medium transition-all duration-200'
							>
								<Plus className='h-4 w-4 mr-2' />
								{t('addCategory')}
							</Button>
						</div>

						{/* Сетка категорий */}
						{categoriesLoading ? (
							<div className='flex items-center justify-center h-64'>
								<div className='text-gray-500'>{t('loading')}</div>
							</div>
						) : (
							<div className='max-h-[60vh] overflow-y-auto pr-2'>
								<div className='grid grid-cols-4 gap-6'>
									{categories.map(category => (
										<Card
											key={category.id}
											className={`cursor-pointer transition-all duration-200 hover:shadow-lg group relative rounded-md aspect-square ${
												selectedCategory?.id === category.id
													? 'border-2 border-blue-500 bg-blue-50'
													: 'border border-gray-200 hover:border-blue-300 bg-white'
											}`}
											onClick={() => handleCategorySelect(category)}
										>
											<CardContent className='p-4 h-full flex flex-col items-center justify-center text-center gap-2'>
												{/* Кнопки управления в правом верхнем углу */}
												<div className='absolute top-1.5 right-1.5 flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity'>
													<Button
														variant='ghost'
														size='sm'
														onClick={e => handleEditClick(e, category)}
														className='h-5 w-5 p-0 hover:bg-blue-100'
													>
														<Edit className='h-2.5 w-2.5 text-gray-600' />
													</Button>
													<Button
														variant='ghost'
														size='sm'
														onClick={e => handleDeleteClick(e, category.id)}
														className='h-5 w-5 p-0 hover:bg-red-100'
													>
														<Trash2 className='h-2.5 w-2.5 text-red-600' />
													</Button>
												</div>

												{/* Иконка */}
												<div className='mb-1'>{renderIcon(category.icon)}</div>

												{/* Название */}
												<h4 className='font-medium text-gray-900 text-xs line-clamp-2 min-h-[2rem] flex items-center'>
													{category.name}
												</h4>

												{/* Счетчики */}
												<div className='flex gap-1 w-full mt-auto'>
													<TooltipProvider>
														<Tooltip>
															<TooltipTrigger asChild>
																<div className='bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700 flex-1 rounded-md flex items-center justify-center gap-1 cursor-help'>
																	<Settings className='h-3 w-3' />
																	<span>{category.parametersCount}</span>
																</div>
															</TooltipTrigger>
															<TooltipContent>
																<p>{t('parametersAvailable')}</p>
															</TooltipContent>
														</Tooltip>
													</TooltipProvider>

													<TooltipProvider>
														<Tooltip>
															<TooltipTrigger asChild>
																<div className='bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 flex-1 rounded-md flex items-center justify-center gap-1 cursor-help'>
																	<Building2 className='h-3 w-3' />
																	<span>{category.suppliersCount}</span>
																</div>
															</TooltipTrigger>
															<TooltipContent>
																<p>{t('suppliersAvailable')}</p>
															</TooltipContent>
														</Tooltip>
													</TooltipProvider>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							</div>
						)}

						{/* Пустое состояние */}
						{categories.length === 0 && !categoriesLoading && (
							<div className='text-center py-16'>
								<div className='text-gray-300 text-6xl mb-6'>📦</div>
								<h3 className='text-2xl font-bold text-gray-900 mb-3'>
									{t('noCategories')}
								</h3>
								<p className='text-gray-600 mb-8 text-lg'>
									{t('noCategoriesDescription')}
								</p>
								<Button
									onClick={handleAddCategory}
									className='bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-base font-medium transition-all duration-200'
								>
									<Plus className='h-5 w-5 mr-2' />
									<span>{t('addFirstCategory')}</span>
								</Button>
							</div>
						)}
					</div>
				)

			case 2:
				return (
					<div className='h-full'>
						{/* Заголовок секции + кнопка */}
						<div className='mb-8 flex items-center justify-between'>
							<h3 className='text-2xl font-medium text-gray-900'>
								{t('selectSupplier')}
							</h3>
							<Button
								onClick={handleAddSupplier}
								className='bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-sm font-medium transition-all duration-200'
							>
								<Plus className='h-4 w-4 mr-2' />
								{t('addSupplier')}
							</Button>
						</div>

						{/* Список поставщиков */}
						{suppliersLoading ? (
							<div className='flex items-center justify-center h-64'>
								<div className='text-gray-500'>{t('loading')}</div>
							</div>
						) : (
							<div className='max-h-[60vh] overflow-y-auto pr-2'>
								{categorySuppliers.length > 0 ? (
									<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
										{categorySuppliers
											.sort((a, b) => {
												// Сначала активные, потом неактивные
												if (a.status === 'active' && b.status === 'inactive')
													return -1
												if (a.status === 'inactive' && b.status === 'active')
													return 1
												return 0
											})
											.map(supplier => (
												<SupplierCard
													key={supplier.id}
													supplier={supplier}
													isSelected={selectedSupplier?.id === supplier.id}
													isInactive={supplier.status === 'inactive'}
													onClick={() =>
														supplier.status === 'inactive'
															? handleInactiveSupplierClick()
															: handleSupplierSelect(supplier)
													}
													onEdit={supplier => {
														setEditingSupplier(supplier)
														setShowEditModal(true)
													}}
													showEditButton={false}
												/>
											))}
									</div>
								) : (
									/* Пустое состояние */
									<div className='text-center py-16'>
										<div className='text-gray-300 text-6xl mb-6'>🏢</div>
										<h3 className='text-2xl font-bold text-gray-900 mb-3'>
											{t('noSuppliersForCategory')}
										</h3>
										<p className='text-gray-600 mb-8 text-lg'>
											{t('noSuppliersDescription')}
										</p>
										<Button
											onClick={handleAddSupplier}
											className='bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-base font-medium transition-all duration-200'
										>
											<Plus className='h-5 w-5 mr-2' />
											<span>{t('addSupplierToCategory')}</span>
										</Button>
									</div>
								)}
							</div>
						)}
					</div>
				)

			case 3:
				return (
					<div className='h-full'>
						{/* Конфигурация параметров */}
						<ParametersConfiguration
							categoryId={selectedCategory?.id || ''}
							supplierId={selectedSupplier?.id || 0}
							onBack={handleBack}
							onComplete={handleConfigurationComplete}
							onCancel={handleCancel}
						/>
					</div>
				)

			default:
				return null
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent
				className='max-w-6xl max-h-[90vh] flex flex-col'
				showCloseButton={false}
			>
				<DialogTitle className='sr-only'>
					{t('productConfigurator')}
				</DialogTitle>

				{/* Тонкая верхняя панель с навигацией */}
				<div className='absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-4 border-b border-gray-100'>
					{/* Стрелка назад с текстом */}
					{currentStep > 1 ? (
						<div className='flex items-center gap-2'>
							<Button variant='ghost' size='icon-sm' onClick={handleBack}>
								<ArrowLeft className='h-4 w-4' />
							</Button>
							<span className='text-sm text-gray-600'>{t('back')}</span>
						</div>
					) : (
						<div className='w-8'></div>
					)}

					{/* Крестик закрытия */}
					<Button variant='ghost' size='icon-sm' onClick={handleClose}>
						<X className='h-4 w-4' />
					</Button>
				</div>

				{/* Основной контент */}
				<div className='flex overflow-hidden pt-8'>
					{/* Левая панель - этапы */}
					<div className='w-56 bg-gray-50 p-6 rounded-md'>
						<div className='space-y-4'>
							{/* Этап 1: Categoria */}
							<div
								className={`flex items-center px-4 py-3 border rounded-md transition-all duration-200 ${
									currentStep === 1
										? 'bg-blue-50 border-blue-300'
										: currentStep >= 2 && selectedCategory
										? 'bg-green-50 border-green-300'
										: 'bg-white border-gray-200'
								}`}
							>
								<div className='flex items-center gap-3'>
									{/* Цифра или галочка */}
									<div className='flex items-center justify-center w-6 h-6 rounded-full border-2 border-gray-300 bg-white'>
										{currentStep >= 2 && selectedCategory ? (
											<Check className='h-4 w-4 text-green-600' />
										) : (
											<span className='text-sm font-bold text-gray-700'>1</span>
										)}
									</div>

									{/* Иконка и текст */}
									<div className='flex items-center gap-2'>
										<List className='h-5 w-5 text-gray-700' />
										<span className='text-sm font-medium text-gray-800'>
											{currentStep >= 2 && selectedCategory
												? selectedCategory.name
												: t('category')}
										</span>
									</div>
								</div>
							</div>

							{/* Этап 2: Fornitore */}
							<div
								className={`flex items-center px-4 py-3 border rounded-md transition-all duration-200 ${
									currentStep === 2
										? 'bg-blue-50 border-blue-300'
										: currentStep >= 2 && selectedCategory
										? 'bg-green-50 border-green-300'
										: 'bg-white border-gray-200'
								}`}
							>
								<div className='flex items-center gap-3'>
									{/* Цифра или галочка */}
									<div className='flex items-center justify-center w-6 h-6 rounded-full border-2 border-gray-300 bg-white'>
										{currentStep >= 3 && selectedSupplier ? (
											<Check className='h-4 w-4 text-green-600' />
										) : (
											<span className='text-sm font-bold text-gray-700'>2</span>
										)}
									</div>

									{/* Иконка и текст */}
									<div className='flex items-center gap-2'>
										<Building2 className='h-5 w-5 text-gray-700' />
										<span className='text-sm font-medium text-gray-800'>
											{currentStep >= 3 && selectedSupplier
												? selectedSupplier.name
												: t('supplier')}
										</span>
									</div>
								</div>
							</div>

							{/* Этап 3: Parametri */}
							<div
								className={`flex items-center px-4 py-3 border rounded-md transition-all duration-200 ${
									currentStep === 3
										? 'bg-blue-50 border-blue-300'
										: currentStep >= 4
										? 'bg-green-50 border-green-300'
										: 'bg-white border-gray-200'
								}`}
							>
								<div className='flex items-center gap-3'>
									{/* Цифра или галочка */}
									<div className='flex items-center justify-center w-6 h-6 rounded-full border-2 border-gray-300 bg-white'>
										{currentStep >= 4 ? (
											<Check className='h-4 w-4 text-green-600' />
										) : (
											<span className='text-sm font-bold text-gray-700'>3</span>
										)}
									</div>

									{/* Иконка и текст */}
									<div className='flex items-center gap-2'>
										<Settings className='h-5 w-5 text-gray-700' />
										<span className='text-sm font-medium text-gray-800'>
											{t('parameters')}
										</span>
									</div>
								</div>
							</div>

							{/* Кнопка подтверждения - только на шаге 3 */}
							{currentStep === 3 && (
								<div className='mt-4'>
									<Button
										className='w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 text-sm font-medium transition-all duration-200'
										onClick={() => {
											// TODO: Добавить функционал подтверждения
											console.log('Подтверждение конфигурации')
											handleClose()
										}}
									>
										Conferma
									</Button>
								</div>
							)}
						</div>
					</div>

					{/* Правая рабочая область */}
					<div className='flex-1 bg-white ml-4 flex flex-col'>
						{/* Заголовок - зафиксированный */}
						{currentStep === 3 && (
							<div className='p-8 pb-0 flex-shrink-0'>
								<div className='mb-8 flex items-center justify-between'>
									<h3 className='text-2xl font-medium text-gray-900'>
										Compila i parametri
									</h3>
								</div>
							</div>
						)}

						{/* Контент - прокручиваемый */}
						<div className='flex-1 overflow-auto p-8 pt-0'>
							{renderStepContent()}
						</div>
					</div>
				</div>
			</DialogContent>

			{/* Модалка добавления/редактирования категории */}
			<AddCategoryModal
				isOpen={showAddModal}
				onClose={handleModalClose}
				onCategorySaved={handleCategorySaved}
				editingCategory={
					editingCategory
						? {
								id: editingCategory.id,
								name: editingCategory.name,
								icon: editingCategory.icon,
								description: editingCategory.description || '',
						  }
						: null
				}
			/>

			{/* Модалка выбора поставщиков */}
			<SelectSuppliersModal
				isOpen={showSupplierModal}
				onClose={handleSupplierModalClose}
				onSuppliersSelected={handleSuppliersAdded}
				categoryId={selectedCategory?.id || ''}
			/>
		</Dialog>
	)
}
