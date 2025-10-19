'use client'

import { useState } from 'react'
import { DashboardLayoutStickerV2 } from '@/components/dashboard-layout-sticker-v2'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Plus, Search, Edit, Trash2, Package, Save, X } from 'lucide-react'
import { highlightText } from '@/lib/highlight-text'
import { useSorting } from '@/hooks/use-sorting'
import { multiSearch } from '@/lib/multi-search'
import { useLanguage } from '@/contexts/LanguageContext'

interface Product {
	id: number
	name: string
	description?: string
	category: string
	basePrice: number
	specifications?: Record<string, string | number>
	images: string[]
	isActive: boolean
	createdAt: string
}

export default function ProductsPage() {
	const { t } = useLanguage()
	const [products, setProducts] = useState<Product[]>([
		{
			id: 1,
			name: 'Окно поворотное 1200x1500',
			description: 'Энергосберегающее окно с двухкамерным стеклопакетом',
			category: 'Окна',
			basePrice: 15000,
			specifications: {
				material: 'ПВХ',
				glass: 'Двухкамерный',
				width: 1200,
				height: 1500,
				color: 'Белый',
			},
			images: [],
			isActive: true,
			createdAt: '2024-01-15',
		},
		{
			id: 2,
			name: 'Дверь входная металлическая',
			description: 'Металлическая дверь с утеплителем и бронированным замком',
			category: 'Двери',
			basePrice: 45000,
			specifications: {
				material: 'Металл',
				insulation: 'Да',
				lock: 'Бронированный',
				width: 900,
				height: 2100,
				color: 'Серый',
			},
			images: [],
			isActive: true,
			createdAt: '2024-01-20',
		},
		{
			id: 3,
			name: 'Окно раздвижное 1800x1500',
			description: 'Раздвижное окно для террасы с москитной сеткой',
			category: 'Окна',
			basePrice: 28000,
			specifications: {
				material: 'Алюминий',
				glass: 'Однокамерный',
				width: 1800,
				height: 1500,
				mosquitoNet: 'Да',
				color: 'Бронзовый',
			},
			images: [],
			isActive: true,
			createdAt: '2024-02-01',
		},
	])

	const [searchTerm, setSearchTerm] = useState('')
	const [categoryFilter, setCategoryFilter] = useState('all')
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [editingProduct, setEditingProduct] = useState<Product | null>(null)
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		category: '',
		basePrice: 0,
		specifications: {} as Record<string, string | number>,
	})

	const categories = ['Окна', 'Двери', 'Фурнитура']

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (editingProduct) {
			setProducts(
				products.map(product =>
					product.id === editingProduct.id
						? { ...product, ...formData }
						: product
				)
			)
		} else {
			const newProduct: Product = {
				id: Math.max(...products.map(p => p.id)) + 1,
				...formData,
				images: [],
				isActive: true,
				createdAt: new Date().toISOString(),
			}
			setProducts([...products, newProduct])
		}

		setIsDialogOpen(false)
		setEditingProduct(null)
		setFormData({
			name: '',
			description: '',
			category: '',
			basePrice: 0,
			specifications: {} as Record<string, string | number>,
		})
	}

	const handleEdit = (product: Product) => {
		setEditingProduct(product)
		setFormData({
			name: product.name,
			description: product.description || '',
			category: product.category,
			basePrice: product.basePrice,
			specifications: product.specifications || {},
		})
		setIsDialogOpen(true)
	}

	const handleDelete = async (id: number) => {
		if (!confirm('Вы уверены, что хотите удалить этот продукт?')) return
		setProducts(products.filter(product => product.id !== id))
	}

	// Множественная фильтрация + фильтр по категории
	const searchFiltered = multiSearch(products, searchTerm, [
		'name',
		'description',
		'category',
	])

	const filteredProducts = searchFiltered.filter(product => {
		const matchesCategory =
			categoryFilter === 'all' || product.category === categoryFilter
		return matchesCategory
	})

	// Сортировка
	const { sortedItems, requestSort, getSortIcon } = useSorting(
		filteredProducts,
		'name'
	)

	return (
		<DashboardLayoutStickerV2>
			<div className='space-y-6'>
				<div className='flex justify-between items-center'>
					<div>
						<h1 className='text-3xl font-bold text-gray-900'>
							{t('products')}
						</h1>
						<p className='text-gray-600'>{t('productManagement')}</p>
					</div>

					<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<DialogTrigger asChild>
							<Button
								onClick={() => {
									setEditingProduct(null)
									setFormData({
										name: '',
										description: '',
										category: '',
										basePrice: 0,
										specifications: {} as Record<string, string | number>,
									})
								}}
								className='bg-green-600 hover:bg-green-700 text-white'
							>
								<Plus className='h-4 w-4 mr-2' />
								{t('addProduct')}
							</Button>
						</DialogTrigger>
						<DialogContent className='sm:max-w-[600px]'>
							<DialogHeader>
								<DialogTitle>
									{editingProduct ? t('editProduct') : t('newProduct')}
								</DialogTitle>
								<DialogDescription>
									{editingProduct
										? 'Внесите изменения в данные продукта'
										: 'Заполните информацию о новом продукте'}
								</DialogDescription>
							</DialogHeader>
							<form onSubmit={handleSubmit} className='space-y-4'>
								<div>
									<Label htmlFor='name'>Название *</Label>
									<Input
										id='name'
										value={formData.name}
										onChange={e =>
											setFormData({ ...formData, name: e.target.value })
										}
										required
									/>
								</div>
								<div>
									<Label htmlFor='description'>Описание</Label>
									<Textarea
										id='description'
										value={formData.description}
										onChange={e =>
											setFormData({ ...formData, description: e.target.value })
										}
									/>
								</div>
								<div>
									<Label htmlFor='category'>Категория *</Label>
									<Select
										value={formData.category}
										onValueChange={value =>
											setFormData({ ...formData, category: value })
										}
									>
										<SelectTrigger>
											<SelectValue placeholder='Выберите категорию' />
										</SelectTrigger>
										<SelectContent>
											{categories.map(category => (
												<SelectItem key={category} value={category}>
													{category}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor='price'>Базовая цена (₽) *</Label>
									<Input
										id='price'
										type='number'
										value={formData.basePrice}
										onChange={e =>
											setFormData({
												...formData,
												basePrice: Number(e.target.value),
											})
										}
										required
									/>
								</div>
								<div className='flex justify-end gap-3'>
									<Button
										type='button'
										variant='outline'
										onClick={() => setIsDialogOpen(false)}
										className='border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400'
									>
										<X className='h-4 w-4 mr-2' />
										{t('cancel')}
									</Button>
									<Button
										type='submit'
										className='bg-green-600 hover:bg-green-700 text-white'
									>
										<Save className='h-4 w-4 mr-2' />
										{editingProduct ? t('save') : t('createItem')}
									</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>
				</div>

				<Card>
					<CardHeader>
						<div className='flex items-center space-x-4'>
							<div className='relative flex-1'>
								<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
								<Input
									placeholder={t('searchProducts')}
									value={searchTerm}
									onChange={e => setSearchTerm(e.target.value)}
									className='pl-10'
								/>
							</div>
							<Select value={categoryFilter} onValueChange={setCategoryFilter}>
								<SelectTrigger className='w-48'>
									<SelectValue placeholder='Категория' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='all'>Все категории</SelectItem>
									{categories.map(category => (
										<SelectItem key={category} value={category}>
											{category}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead
										className='cursor-pointer hover:bg-gray-50'
										onClick={() => requestSort('name')}
									>
										<div className='flex items-center gap-1'>
											Название {getSortIcon('name')}
										</div>
									</TableHead>
									<TableHead
										className='cursor-pointer hover:bg-gray-50'
										onClick={() => requestSort('category')}
									>
										<div className='flex items-center gap-1'>
											Категория {getSortIcon('category')}
										</div>
									</TableHead>
									<TableHead>Описание</TableHead>
									<TableHead
										className='cursor-pointer hover:bg-gray-50'
										onClick={() => requestSort('basePrice')}
									>
										<div className='flex items-center gap-1'>
											Цена {getSortIcon('basePrice')}
										</div>
									</TableHead>
									<TableHead
										className='cursor-pointer hover:bg-gray-50'
										onClick={() => requestSort('isActive')}
									>
										<div className='flex items-center gap-1'>
											Статус {getSortIcon('isActive')}
										</div>
									</TableHead>
									<TableHead
										className='cursor-pointer hover:bg-gray-50'
										onClick={() => requestSort('createdAt')}
									>
										<div className='flex items-center gap-1'>
											Дата создания {getSortIcon('createdAt')}
										</div>
									</TableHead>
									<TableHead className='text-right'>Действия</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{sortedItems.map(product => (
									<TableRow key={product.id}>
										<TableCell className='font-medium'>
											{highlightText(product.name, searchTerm)}
										</TableCell>
										<TableCell>
											<Badge variant='outline'>
												{highlightText(product.category, searchTerm)}
											</Badge>
										</TableCell>
										<TableCell className='max-w-xs truncate'>
											{product.description
												? highlightText(product.description, searchTerm)
												: '-'}
										</TableCell>
										<TableCell className='font-medium'>
											{product.basePrice.toLocaleString('ru-RU')} ₽
										</TableCell>
										<TableCell>
											<Badge
												variant={product.isActive ? 'default' : 'secondary'}
											>
												{product.isActive ? 'Активный' : 'Неактивный'}
											</Badge>
										</TableCell>
										<TableCell>
											{new Date(product.createdAt).toLocaleDateString('ru-RU')}
										</TableCell>
										<TableCell className='text-right'>
											<div className='flex justify-end space-x-2'>
												<Button
													variant='outline'
													size='sm'
													onClick={() => handleEdit(product)}
												>
													<Edit className='h-4 w-4' />
												</Button>
												<Button
													variant='outline'
													size='sm'
													onClick={() => handleDelete(product.id)}
													className='text-red-600 hover:bg-red-50'
												>
													<Trash2 className='h-4 w-4' />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>

						{filteredProducts.length === 0 && (
							<div className='text-center py-8 text-gray-500'>
								<Package className='h-12 w-12 mx-auto mb-4 text-gray-300' />
								{searchTerm || categoryFilter !== 'all'
									? 'Продукты не найдены'
									: 'Продукты не добавлены'}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</DashboardLayoutStickerV2>
	)
}
