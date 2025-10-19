'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Search, Package, Plus } from 'lucide-react'

interface Product {
	id: number
	name: string
	description?: string
	category: string
	basePrice: number
}

interface ProductPickerProps {
	onAddProduct: (
		product: Product,
		quantity: number,
		customPrice?: number
	) => void
}

export function ProductPicker({ onAddProduct }: ProductPickerProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [searchTerm, setSearchTerm] = useState('')
	const [categoryFilter, setCategoryFilter] = useState('all')
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
	const [quantity, setQuantity] = useState(1)
	const [customPrice, setCustomPrice] = useState('')

	const products: Product[] = [
		{
			id: 1,
			name: 'Окно поворотное 1200x1500',
			description: 'Энергосберегающее окно с двухкамерным стеклопакетом',
			category: 'Окна',
			basePrice: 15000,
		},
		{
			id: 2,
			name: 'Дверь входная металлическая',
			description: 'Металлическая дверь с утеплителем и бронированным замком',
			category: 'Двери',
			basePrice: 45000,
		},
		{
			id: 3,
			name: 'Окно раздвижное 1800x1500',
			description: 'Раздвижное окно для террасы с москитной сеткой',
			category: 'Окна',
			basePrice: 28000,
		},
		{
			id: 4,
			name: 'Окно поворотно-откидное 1400x1600',
			description: 'Универсальное окно с возможностью проветривания',
			category: 'Окна',
			basePrice: 18000,
		},
		{
			id: 5,
			name: 'Дверь межкомнатная',
			description: 'Деревянная дверь с филенчатым полотном',
			category: 'Двери',
			basePrice: 12000,
		},
		{
			id: 6,
			name: 'Ручка оконная',
			description: 'Металлическая ручка с замком',
			category: 'Фурнитура',
			basePrice: 1500,
		},
	]

	const categories = ['Окна', 'Двери', 'Фурнитура']

	const filteredProducts = products.filter(product => {
		const matchesSearch =
			product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			product.description?.toLowerCase().includes(searchTerm.toLowerCase())
		const matchesCategory =
			categoryFilter === 'all' || product.category === categoryFilter
		return matchesSearch && matchesCategory
	})

	const handleAddProduct = () => {
		if (!selectedProduct) return

		const price = customPrice ? Number(customPrice) : undefined
		onAddProduct(selectedProduct, quantity, price)

		// Сброс формы
		setSelectedProduct(null)
		setQuantity(1)
		setCustomPrice('')
		setIsDialogOpen(false)
	}

	return (
		<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<DialogTrigger asChild>
				<Button variant='outline'>
					<Plus className='h-4 w-4 mr-2' />
					Подобрать продукт
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col'>
				<DialogHeader>
					<DialogTitle>Подбор продукта</DialogTitle>
					<DialogDescription>
						Выберите продукт из каталога для добавления в предложение
					</DialogDescription>
				</DialogHeader>

				<div className='flex-1 overflow-hidden flex flex-col'>
					{/* Фильтры */}
					<div className='flex space-x-4 mb-4'>
						<div className='relative flex-1'>
							<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
							<Input
								placeholder='Поиск продуктов...'
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

					{/* Список продуктов */}
					<div className='flex-1 overflow-y-auto'>
						<div className='grid grid-cols-1 gap-3'>
							{filteredProducts.map(product => (
								<Card
									key={product.id}
									className={`cursor-pointer transition-colors ${
										selectedProduct?.id === product.id
											? 'ring-2 ring-red-500 bg-red-50'
											: 'hover:bg-gray-50'
									}`}
									onClick={() => setSelectedProduct(product)}
								>
									<CardContent className='p-4'>
										<div className='flex justify-between items-start'>
											<div className='flex-1'>
												<div className='flex items-center gap-2 mb-2'>
													<h3 className='font-medium'>{product.name}</h3>
													<Badge variant='outline'>{product.category}</Badge>
												</div>
												{product.description && (
													<p className='text-sm text-gray-600 mb-2'>
														{product.description}
													</p>
												)}
												<p className='text-sm font-medium text-red-600'>
													{product.basePrice.toLocaleString('ru-RU')} ₽
												</p>
											</div>
											<Package className='h-6 w-6 text-gray-400' />
										</div>
									</CardContent>
								</Card>
							))}
						</div>

						{filteredProducts.length === 0 && (
							<div className='text-center py-8 text-gray-500'>
								<Package className='h-12 w-12 mx-auto mb-4 text-gray-300' />
								Продукты не найдены
							</div>
						)}
					</div>

					{/* Форма добавления */}
					{selectedProduct && (
						<div className='border-t pt-4 mt-4'>
							<Card>
								<CardHeader>
									<CardTitle className='text-lg'>
										Добавить в предложение
									</CardTitle>
								</CardHeader>
								<CardContent className='space-y-4'>
									<div>
										<Label>Выбранный продукт:</Label>
										<p className='font-medium'>{selectedProduct.name}</p>
										<p className='text-sm text-gray-600'>
											Базовая цена:{' '}
											{selectedProduct.basePrice.toLocaleString('ru-RU')} ₽
										</p>
									</div>

									<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
										<div>
											<Label htmlFor='quantity'>Количество *</Label>
											<Input
												id='quantity'
												type='number'
												min='1'
												value={quantity}
												onChange={e => setQuantity(Number(e.target.value))}
											/>
										</div>
										<div>
											<Label htmlFor='customPrice'>Цена за единицу (₽)</Label>
											<Input
												id='customPrice'
												type='number'
												value={customPrice}
												onChange={e => setCustomPrice(e.target.value)}
												placeholder={selectedProduct.basePrice.toString()}
											/>
											<p className='text-xs text-gray-500 mt-1'>
												Оставьте пустым для использования базовой цены
											</p>
										</div>
									</div>

									<div className='bg-blue-50 p-3 rounded'>
										<p className='text-sm font-medium'>
											Итого:{' '}
											{(customPrice
												? Number(customPrice)
												: selectedProduct.basePrice) * quantity}{' '}
											₽
										</p>
									</div>

									<div className='flex justify-end space-x-2'>
										<Button
											variant='outline'
											onClick={() => {
												setSelectedProduct(null)
												setQuantity(1)
												setCustomPrice('')
											}}
										>
											Отмена
										</Button>
										<Button onClick={handleAddProduct}>Добавить</Button>
									</div>
								</CardContent>
							</Card>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	)
}

