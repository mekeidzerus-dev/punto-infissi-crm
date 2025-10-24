'use client'

import { useState, useEffect } from 'react'
import { DashboardLayoutStickerV2 } from '@/components/dashboard-layout-sticker-v2'
import { UnifiedNavV2 } from '@/components/unified-nav-v2'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { ProductCategoriesManager } from '@/components/product-categories-manager'
import { Tags, Plus, Search, Edit, Trash2, Eye } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { highlightText } from '@/lib/highlight-text'

interface Category {
	id: string
	name: string
	description?: string
	icon: string
	isActive: boolean
	createdAt: string
}

export default function CategoriesPage() {
	const { t, locale } = useLanguage()
	const [categories, setCategories] = useState<Category[]>([])
	const [searchTerm, setSearchTerm] = useState('')
	const [showManager, setShowManager] = useState(false)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		fetchCategories()
	}, [])

	const fetchCategories = async () => {
		try {
			setIsLoading(true)
			const response = await fetch('/api/categories')
			if (response.ok) {
				const data = await response.json()
				setCategories(data)
			}
		} catch (error) {
			console.error('Error fetching categories:', error)
		} finally {
			setIsLoading(false)
		}
	}

	const handleAddCategory = () => {
		setShowManager(true)
	}

	const handleCategorySaved = () => {
		setShowManager(false)
		fetchCategories() // Обновляем список после сохранения
	}

	const handleCategoryDeleted = () => {
		fetchCategories() // Обновляем список после удаления
	}

	const handleEdit = (category: Category) => {
		// Открываем менеджер для редактирования
		setShowManager(true)
	}

	const handleDelete = async (categoryId: string) => {
		if (!confirm(t('confirmDelete'))) {
			return
		}

		try {
			const response = await fetch(`/api/categories/${categoryId}`, {
				method: 'DELETE',
			})

			if (response.ok) {
				await fetchCategories()
			} else {
				const error = await response.json()
				console.error('Error deleting category:', error)
				alert(t('errorOccurred') + ': ' + (error.error || 'Unknown error'))
			}
		} catch (error) {
			console.error('Error deleting category:', error)
			alert(t('errorOccurred'))
		}
	}

	const filteredCategories = categories.filter(category => {
		const searchLower = searchTerm.toLowerCase()
		return (
			category.name.toLowerCase().includes(searchLower) ||
			(category.description &&
				category.description.toLowerCase().includes(searchLower))
		)
	})

	const navItems = [
		{
			id: 'categories',
			name: t('categories'),
			href: '/categories',
			icon: Tags,
			count: categories.length,
		},
	]

	return (
		<DashboardLayoutStickerV2>
			<div className='space-y-6'>
				{/* Заголовок с навигацией */}
				<UnifiedNavV2
					items={navItems}
					onAddClick={handleAddCategory}
					addButtonText={t('addCategory')}
				/>

				{/* Поиск */}
				<Card className='p-4'>
					<div className='flex items-center space-x-4'>
						<div className='flex-1'>
							<Input
								placeholder={t('searchPlaceholder')}
								value={searchTerm}
								onChange={e => setSearchTerm(e.target.value)}
							/>
						</div>
					</div>
				</Card>

				{/* Список категорий */}
				<Card className='p-6'>
					{isLoading ? (
						<div className='text-center py-8'>
							<div className='text-gray-500'>{t('loading')}...</div>
						</div>
					) : filteredCategories.length === 0 ? (
						<div className='text-center py-8'>
							<Tags className='w-12 h-12 text-gray-400 mx-auto mb-4' />
							<div className='text-gray-500 mb-4'>
								{searchTerm ? t('noDataFound') : t('noCategories')}
							</div>
							{!searchTerm && (
								<Button onClick={handleAddCategory}>
									<Plus className='w-4 h-4 mr-2' />
									{t('addFirstCategory')}
								</Button>
							)}
						</div>
					) : (
						<div className='overflow-x-auto'>
							<table className='w-full'>
								<thead>
									<tr className='border-b'>
										<th className='text-left py-3 px-4 font-medium'>
											{t('categoryName')}
										</th>
										<th className='text-left py-3 px-4 font-medium'>
											{t('description')}
										</th>
										<th className='text-left py-3 px-4 font-medium'>
											{t('status')}
										</th>
										<th className='text-left py-3 px-4 font-medium'>
											{t('created')}
										</th>
										<th className='text-center py-3 px-4 font-medium'>
											{t('actions')}
										</th>
									</tr>
								</thead>
								<tbody>
									{filteredCategories.map(category => (
										<tr key={category.id} className='border-b hover:bg-gray-50'>
											<td className='py-3 px-4'>
												<div className='flex items-center gap-3'>
													<span className='text-2xl'>{category.icon}</span>
													<div>
														<div className='font-medium'>
															{highlightText(category.name, searchTerm)}
														</div>
													</div>
												</div>
											</td>
											<td className='py-3 px-4'>
												<div className='text-sm text-gray-600'>
													{category.description ? (
														highlightText(category.description, searchTerm)
													) : (
														<span className='text-gray-400'>—</span>
													)}
												</div>
											</td>
											<td className='py-3 px-4'>
												<span
													className={`px-2 py-1 rounded-full text-xs font-medium ${
														category.isActive
															? 'bg-green-100 text-green-800'
															: 'bg-gray-100 text-gray-800'
													}`}
												>
													{category.isActive ? t('active') : t('inactive')}
												</span>
											</td>
											<td className='py-3 px-4 text-sm text-gray-600'>
												{new Date(category.createdAt).toLocaleDateString('ru-RU')}
											</td>
											<td className='py-3 px-4'>
												<div className='flex items-center justify-center space-x-2'>
													<Button
														variant='outline'
														size='sm'
														onClick={() => handleEdit(category)}
													>
														<Edit className='w-4 h-4' />
													</Button>
													<Button
														variant='outline'
														size='sm'
														onClick={() => handleDelete(category.id)}
														className='text-red-600 hover:bg-red-50'
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

				{/* Диалог управления категориями */}
				<Dialog open={showManager} onOpenChange={setShowManager}>
					<DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
						<DialogHeader>
							<DialogTitle>{t('categorySettings')}</DialogTitle>
						</DialogHeader>
						<ProductCategoriesManager
							onCategorySaved={handleCategorySaved}
							onCategoryDeleted={handleCategoryDeleted}
						/>
					</DialogContent>
				</Dialog>
			</div>
		</DashboardLayoutStickerV2>
	)
}