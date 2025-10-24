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
import { Tags, Plus, Search } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface Category {
	id: number
	name: string
	nameIt: string
	description?: string
	descriptionIt?: string
	isActive: boolean
	createdAt: string
	_count?: {
		products: number
	}
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

	const filteredCategories = categories.filter(category => {
		const searchLower = searchTerm.toLowerCase()
		return (
			category.name.toLowerCase().includes(searchLower) ||
			category.nameIt.toLowerCase().includes(searchLower) ||
			(category.description && category.description.toLowerCase().includes(searchLower)) ||
			(category.descriptionIt && category.descriptionIt.toLowerCase().includes(searchLower))
		)
	})

	return (
		<DashboardLayoutStickerV2 hideTopNav={true}>
			<div className='space-y-4'>
				{/* Навигация в стиле предложений */}
				<UnifiedNavV2
					items={[
						{
							id: 'categories',
							name: t('categories'),
							href: '/categories',
							icon: Tags,
							count: categories.length,
						},
					]}
					onAddClick={handleAddCategory}
					addButtonText={t('addCategory')}
				/>

				{/* Поиск в том же стиле */}
				<div className='relative'>
					<Search className='absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400' />
					<Input
						value={searchTerm}
						onChange={e => setSearchTerm(e.target.value)}
						placeholder={t('search')}
						className='pl-12 w-full bg-gradient-to-r from-gray-50 to-white border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-base py-3'
					/>
				</div>

				{/* Контент */}
				{isLoading ? (
					<div className='flex items-center justify-center h-32'>
						<div className='text-lg text-gray-600'>{t('loading')}</div>
					</div>
				) : filteredCategories.length === 0 ? (
					<Card className='p-8 text-center'>
						<div className='flex flex-col items-center gap-4'>
							<div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center'>
								<Tags className='h-8 w-8 text-gray-400' />
							</div>
							<div>
								<h3 className='text-lg font-medium text-gray-900 mb-2'>
									{t('noCategories')}
								</h3>
								<p className='text-gray-500 mb-4'>
									{t('noCategoriesDescription')}
								</p>
								<Button onClick={handleAddCategory} className='bg-green-600 hover:bg-green-700'>
									<Plus className='h-4 w-4 mr-2' />
									{t('addFirstCategory')}
								</Button>
							</div>
						</div>
					</Card>
				) : (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
						{filteredCategories.map(category => (
							<Card key={category.id} className='p-4 hover:shadow-md transition-shadow'>
								<div className='flex items-start justify-between mb-3'>
									<div className='flex items-center gap-2'>
										<Tags className='h-5 w-5 text-blue-600' />
										<h3 className='font-medium text-gray-900'>
											{locale === 'it' ? category.nameIt : category.name}
										</h3>
									</div>
									<div className={`px-2 py-1 rounded-full text-xs ${
										category.isActive 
											? 'bg-green-100 text-green-800' 
											: 'bg-gray-100 text-gray-600'
									}`}>
										{category.isActive ? t('active') : t('inactive')}
									</div>
								</div>
								
								{(category.description || category.descriptionIt) && (
									<p className='text-sm text-gray-600 mb-3'>
										{locale === 'it' ? category.descriptionIt : category.description}
									</p>
								)}
								
								<div className='flex items-center justify-between text-xs text-gray-500'>
									<span>{t('created')}: {new Date(category.createdAt).toLocaleDateString()}</span>
									{category._count?.products && (
										<span>{category._count.products} {t('products')}</span>
									)}
								</div>
							</Card>
						))}
					</div>
				)}

				{/* Диалог управления категориями */}
				<Dialog open={showManager} onOpenChange={setShowManager}>
					<DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
						<DialogHeader>
							<DialogTitle>{t('categorySettings')}</DialogTitle>
						</DialogHeader>
						<ProductCategoriesManager />
					</DialogContent>
				</Dialog>
			</div>
		</DashboardLayoutStickerV2>
	)
}