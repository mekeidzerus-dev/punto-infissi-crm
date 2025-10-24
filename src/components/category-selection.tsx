'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Settings } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { AddCategoryModal } from '@/components/add-category-modal'

// Функция для безопасного рендеринга иконки (SVG из базы)
const renderIcon = (icon: string) => {
	// Если это SVG код, создаем безопасный элемент
	if (icon && icon.includes('<svg')) {
		return (
			<div
				className='w-8 h-8 flex items-center justify-center text-gray-700'
				dangerouslySetInnerHTML={{ __html: icon }}
			/>
		)
	}

	// Fallback на иконку по умолчанию
	return (
		<div className='w-8 h-8 flex items-center justify-center text-gray-700'>
			<svg
				viewBox='0 0 24 24'
				fill='none'
				stroke='currentColor'
				strokeWidth='1'
			>
				<rect x='4' y='4' width='16' height='16' rx='1' />
				<line x1='12' y1='4' x2='12' y2='20' />
				<line x1='4' y1='12' x2='20' y2='12' />
			</svg>
		</div>
	)
}

interface CategoryWithCounts {
	id: string
	name: string
	icon: string
	description?: string
	parametersCount: number
	suppliersCount: number
	parameters: Array<{
		id: string
		name: string
		type: string
		isRequired: boolean
		isVisible: boolean
	}>
	suppliers: Array<{
		id: number
		name: string
		rating: number
	}>
}

interface CategorySelectionProps {
	selectedCategoryId?: string
	onCategorySelect: (category: CategoryWithCounts) => void
	onAddCategory?: () => void
	onEditCategory?: (category: CategoryWithCounts) => void
	onDeleteCategory?: (categoryId: string) => void
}

export function CategorySelection({
	selectedCategoryId,
	onCategorySelect,
	onAddCategory,
	onEditCategory,
	onDeleteCategory,
}: CategorySelectionProps) {
	const { t, locale } = useLanguage()
	const [categories, setCategories] = useState<CategoryWithCounts[]>([])
	const [isLoading, setIsLoading] = useState(true)

	// Состояние для модального окна
	const [showAddModal, setShowAddModal] = useState(false)
	const [editingCategory, setEditingCategory] =
		useState<CategoryWithCounts | null>(null)

	useEffect(() => {
		loadCategories()
	}, [])

	const loadCategories = async () => {
		setIsLoading(true)
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
			setIsLoading(false)
		}
	}

	const handleCategoryClick = (category: CategoryWithCounts) => {
		onCategorySelect(category)
	}

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
					// Обновляем список категорий
					await loadCategories()
					// Уведомляем родительский компонент
					if (onDeleteCategory) {
						onDeleteCategory(categoryId)
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
		// Обновляем список категорий после сохранения
		await loadCategories()
		setShowAddModal(false)
		setEditingCategory(null)
	}

	if (isLoading) {
		return (
			<div className='flex items-center justify-center h-64'>
				<div className='text-gray-500'>{t('loading')}...</div>
			</div>
		)
	}

	return (
		<div>
			{/* Заголовок + кнопка */}
			<div className='mb-4 flex items-center justify-between'>
				<h3 className='text-base font-medium text-gray-900'>
					Seleziona categoria
				</h3>
				<Button
					onClick={handleAddCategory}
					className='bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 text-sm'
				>
					<Plus className='h-3 w-3 mr-1.5' />
					Aggiungi categoria
				</Button>
			</div>

			{/* Сетка категорий */}
			<div className='grid grid-cols-4 gap-3'>
				{categories.map(category => (
					<Card
						key={category.id}
						className={`cursor-pointer transition-all duration-200 hover:shadow-xl group relative ${
							selectedCategoryId === category.id
								? 'border-2 border-blue-500 bg-blue-50 shadow-lg'
								: 'border border-gray-200 hover:border-gray-300 bg-white'
						}`}
						onClick={() => handleCategoryClick(category)}
					>
						<CardContent className='p-3 h-full flex flex-col items-center justify-center text-center relative'>
							{/* Индикатор выбора */}
							{selectedCategoryId === category.id && (
								<div className='absolute top-1.5 left-1.5'>
									<div className='w-2 h-2 bg-blue-500 rounded-full'></div>
								</div>
							)}

							{/* Кнопки управления в правом верхнем углу */}
							<div className='absolute top-1.5 right-1.5 flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity'>
								<Button
									variant='ghost'
									size='sm'
									onClick={e => handleEditClick(e, category)}
									className='h-5 w-5 p-0 hover:bg-blue-100 rounded'
								>
									<Edit className='h-2.5 w-2.5 text-gray-600' />
								</Button>
								<Button
									variant='ghost'
									size='sm'
									onClick={e => handleDeleteClick(e, category.id)}
									className='h-5 w-5 p-0 hover:bg-red-100 rounded'
								>
									<Trash2 className='h-2.5 w-2.5 text-red-600' />
								</Button>
							</div>

							{/* Иконка */}
							<div className='mb-2'>{renderIcon(category.icon)}</div>

							{/* Название */}
							<h4 className='font-medium text-gray-900 text-xs mb-1 line-clamp-2 px-0.5'>
								{category.name}
							</h4>

							{/* Счетчики */}
							<div className='flex flex-col gap-0.5 w-full'>
								<div className='bg-blue-50 px-1 py-0.5 rounded text-xs text-blue-700 truncate'>
									{category.parametersCount}
								</div>
								<div className='bg-green-50 px-1 py-0.5 rounded text-xs text-green-700 truncate'>
									{category.suppliersCount}
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Пустое состояние */}
			{categories.length === 0 && (
				<div className='text-center py-12'>
					<div className='text-gray-400 text-4xl mb-4'>📦</div>
					<h3 className='text-lg font-medium text-gray-900 mb-2'>
						{t('noCategories')}
					</h3>
					<p className='text-gray-500 mb-4'>{t('noCategoriesDescription')}</p>
					<Button
						onClick={handleAddCategory}
						className='flex items-center space-x-2'
					>
						<Plus className='h-4 w-4' />
						<span>{t('addFirstCategory')}</span>
					</Button>
				</div>
			)}

			{/* Модальное окно для добавления/редактирования категории */}
			<AddCategoryModal
				isOpen={showAddModal}
				onClose={handleModalClose}
				onCategorySaved={handleCategorySaved}
				editingCategory={editingCategory}
			/>
		</div>
	)
}
