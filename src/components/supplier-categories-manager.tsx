'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Tag } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { logger } from '@/lib/logger'

interface ProductCategory {
	id: string
	name: string
	icon: string
	description?: string
	isActive: boolean
}

interface SupplierCategory {
	id: string
	supplierId: number
	categoryId: string
	category: ProductCategory
}

interface SupplierCategoriesManagerProps {
	supplierId: number
	supplierName: string
	onCategoriesChange?: (categories: string[]) => void
}

export function SupplierCategoriesManager({
	supplierId,
	supplierName,
	onCategoriesChange,
}: SupplierCategoriesManagerProps) {
	const { t } = useLanguage()
	const [categories, setCategories] = useState<ProductCategory[]>([])
	const [supplierCategories, setSupplierCategories] = useState<
		SupplierCategory[]
	>([])
	const [loading, setLoading] = useState(false)

	// Загружаем все категории и связи поставщика
	useEffect(() => {
		fetchData()
	}, [supplierId])

	const fetchData = async () => {
		try {
			setLoading(true)

			// Загружаем все категории
			const categoriesResponse = await fetch('/api/product-categories')
			const categoriesData = await categoriesResponse.json()
			setCategories(categoriesData)

			// Загружаем связи поставщика с категориями
			const supplierCategoriesResponse = await fetch(
				`/api/supplier-categories?supplierId=${supplierId}`
			)
			const supplierCategoriesData = await supplierCategoriesResponse.json()
			setSupplierCategories(supplierCategoriesData)

			// Уведомляем родительский компонент об изменении категорий
			if (onCategoriesChange) {
				const categoryIds = supplierCategoriesData.map(
					(sc: SupplierCategory) => sc.categoryId
				)
				onCategoriesChange(categoryIds)
			}
		} catch (error) {
			logger.error('Error fetching data:', error)
		} finally {
			setLoading(false)
		}
	}

	// Получаем ID категорий, связанных с поставщиком
	const getSelectedCategoryIds = () => {
		return supplierCategories.map(sc => sc.categoryId)
	}

	// Проверяем, выбрана ли категория
	const isCategorySelected = (categoryId: string) => {
		return getSelectedCategoryIds().includes(categoryId)
	}

	// Переключаем выбор категории
	const toggleCategory = async (categoryId: string) => {
		try {
			const isSelected = isCategorySelected(categoryId)

			if (isSelected) {
				// Удаляем связь
				const supplierCategory = supplierCategories.find(
					sc => sc.categoryId === categoryId
				)
				if (supplierCategory) {
					const response = await fetch(
						`/api/supplier-categories/${supplierCategory.id}`,
						{
							method: 'DELETE',
						}
					)

					if (response.ok) {
						// Оптимистичное обновление - удаляем из локального состояния
						setSupplierCategories(prev =>
							prev.filter(sc => sc.categoryId !== categoryId)
						)
					} else {
						const errorData = await response.json()
						alert(errorData.error || 'Ошибка при удалении категории')
						return
					}
				}
			} else {
				// Создаем связь
				const response = await fetch('/api/supplier-categories', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						supplierId,
						categoryId,
						parameters: {}, // Пока пустые параметры
					}),
				})

				if (response.ok) {
					const newSupplierCategory = await response.json()
					// Оптимистичное обновление - добавляем в локальное состояние
					const category = categories.find(c => c.id === categoryId)
					if (category) {
						setSupplierCategories(prev => [
							...prev,
							{
								id: newSupplierCategory.id,
								supplierId,
								categoryId,
								category,
							},
						])
					}
				}
			}

			// Уведомляем родительский компонент
			if (onCategoriesChange) {
				const newSelectedIds = isSelected
					? getSelectedCategoryIds().filter(id => id !== categoryId)
					: [...getSelectedCategoryIds(), categoryId]
				onCategoriesChange(newSelectedIds)
			}
		} catch (error) {
			logger.error('Error toggling category:', error)
			alert(t('errorUpdating'))
		}
	}

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
				<div className='flex items-center gap-2 mb-4'>
					<Tag className='h-5 w-5 text-gray-600' />
					<h3 className='text-lg font-semibold'>{t('productCategories')}</h3>
					<Badge variant='secondary' className='text-xs'>
						{getSelectedCategoryIds().length} {t('selected')}
					</Badge>
				</div>

				<p className='text-sm text-gray-600 mb-4'>
					{t('selectCategoriesForSupplier', { supplier: supplierName })}
				</p>

				{/* Сетка категорий */}
				<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
					{categories.map(category => {
						const isSelected = isCategorySelected(category.id)

						return (
							<Card
								key={category.id}
								className={`p-3 cursor-pointer transition-all duration-200 ${
									isSelected
										? 'bg-green-50 border-green-200 hover:bg-green-100'
										: 'bg-gray-50 border-gray-200 hover:bg-gray-100'
								}`}
								onClick={() => toggleCategory(category.id)}
							>
								<div className='text-center'>
									<div
										className={`w-8 h-8 mx-auto mb-2 flex items-center justify-center rounded-lg ${
											isSelected ? 'bg-green-100' : 'bg-gray-100'
										}`}
										dangerouslySetInnerHTML={{ __html: category.icon }}
									/>
									<h4
										className={`text-sm font-medium ${
											isSelected ? 'text-green-800' : 'text-gray-700'
										}`}
									>
										{category.name}
									</h4>
									{isSelected && (
										<div className='mt-1'>
											<Badge variant='default' className='text-xs bg-green-600'>
												{t('selected')}
											</Badge>
										</div>
									)}
								</div>
							</Card>
						)
					})}
				</div>

				{/* Статистика */}
				<div className='mt-4 pt-4 border-t border-gray-200'>
					<div className='flex justify-between text-sm text-gray-600'>
						<span>
							{t('totalCategories')}: {categories.length}
						</span>
						<span>
							{t('selected')}: {getSelectedCategoryIds().length}
						</span>
					</div>
				</div>
			</div>
		</Card>
	)
}
