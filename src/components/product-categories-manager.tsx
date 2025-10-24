'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
	Plus,
	Edit,
	Trash2,
	Eye,
	EyeOff,
	Search,
	Tag,
	X,
	Building2,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { CategorySuppliersManager } from '@/components/category-suppliers-manager'
import CategoryParametersManager from '@/components/category-parameters-manager'

interface ProductCategory {
	id: string
	name: string
	icon: string
	description?: string
	isActive: boolean
	createdAt: string
	updatedAt: string
}

// Предустановленные иконки в стиле ultra-thin
const DEFAULT_ICONS = [
	{
		name: 'Serramenti',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<rect x="4" y="4" width="16" height="16" rx="1"/>
			<line x1="12" y1="4" x2="12" y2="20"/>
			<line x1="4" y1="12" x2="20" y2="12"/>
		</svg>`,
	},
	{
		name: 'Cassonetti',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<rect x="3" y="4" width="18" height="12" rx="1"/>
			<line x1="9" y1="20" x2="15" y2="20"/>
			<line x1="12" y1="16" x2="12" y2="20"/>
		</svg>`,
	},
	{
		name: 'Avvolgibile',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<rect x="3" y="4" width="18" height="16" rx="1"/>
			<line x1="3" y1="8" x2="21" y2="8"/>
			<line x1="3" y1="12" x2="21" y2="12"/>
			<line x1="3" y1="16" x2="21" y2="16"/>
		</svg>`,
	},
	{
		name: 'Scuri',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<rect x="3" y="4" width="18" height="16" rx="1"/>
			<line x1="3" y1="6" x2="21" y2="6"/>
			<line x1="3" y1="10" x2="21" y2="10"/>
			<line x1="3" y1="14" x2="21" y2="14"/>
			<line x1="3" y1="18" x2="21" y2="18"/>
		</svg>`,
	},
	{
		name: 'Tende',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<rect x="3" y="4" width="18" height="16" rx="1"/>
			<path d="M3 8h18"/>
			<path d="M3 12h18"/>
			<path d="M3 16h18"/>
		</svg>`,
	},
	{
		name: 'Zanzariere',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<rect x="3" y="4" width="18" height="16" rx="1"/>
			<line x1="7" y1="6" x2="7" y2="18"/>
			<line x1="11" y1="6" x2="11" y2="18"/>
			<line x1="15" y1="6" x2="15" y2="18"/>
			<line x1="19" y1="6" x2="19" y2="18"/>
			<line x1="3" y1="8" x2="21" y2="8"/>
			<line x1="3" y1="12" x2="21" y2="12"/>
			<line x1="3" y1="16" x2="21" y2="16"/>
		</svg>`,
	},
	{
		name: 'Blindati e Portoncini',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<rect x="4" y="4" width="16" height="16" rx="1"/>
			<circle cx="12" cy="12" r="1.5"/>
			<path d="M12 2v4"/>
			<path d="M12 18v4"/>
		</svg>`,
	},
	{
		name: 'Falso Telaio',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<rect x="3" y="3" width="18" height="18" rx="1"/>
			<rect x="7" y="7" width="10" height="10" rx="0.5"/>
			<rect x="10" y="10" width="4" height="4" rx="0.5"/>
		</svg>`,
	},
	{
		name: 'Porte Interne',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<rect x="4" y="4" width="16" height="16" rx="1"/>
			<circle cx="12" cy="12" r="1.5"/>
			<path d="M12 2v4"/>
		</svg>`,
	},
	{
		name: 'Pergole',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<rect x="3" y="9" width="18" height="10" rx="1"/>
			<line x1="7" y1="3" x2="7" y2="9"/>
			<line x1="17" y1="3" x2="17" y2="9"/>
			<line x1="3" y1="11" x2="21" y2="11"/>
			<line x1="3" y1="15" x2="21" y2="15"/>
		</svg>`,
	},
	{
		name: 'Accessori',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<rect x="4" y="4" width="16" height="16" rx="1"/>
			<path d="M10 10h4v4h-4z"/>
			<path d="M10 2v4"/>
			<path d="M14 2v4"/>
			<path d="M10 18v4"/>
			<path d="M14 18v4"/>
		</svg>`,
	},
	{
		name: 'Servizi / Attività',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<path d="M15.5 6.5a1 1 0 0 0 0 1.4l1.4 1.4a1 1 0 0 0 1.4 0l3.5-3.5a5 5 0 0 1-6.5 6.5l-6 6a1.5 1.5 0 0 1-2-2l6-6a5 5 0 0 1 6.5-6.5l-3.5 3.5z"/>
		</svg>`,
	},
	{
		name: 'Vetrate',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<rect x="4" y="4" width="16" height="16" rx="1"/>
			<line x1="4" y1="8" x2="20" y2="8"/>
			<line x1="4" y1="12" x2="20" y2="12"/>
			<line x1="4" y1="16" x2="20" y2="16"/>
			<line x1="8" y1="4" x2="8" y2="20"/>
			<line x1="12" y1="4" x2="12" y2="20"/>
			<line x1="16" y1="4" x2="16" y2="20"/>
		</svg>`,
	},
	{
		name: 'Cancelli',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<rect x="4" y="4" width="16" height="16" rx="1"/>
			<line x1="8" y1="4" x2="8" y2="20"/>
			<line x1="12" y1="4" x2="12" y2="20"/>
			<line x1="16" y1="4" x2="16" y2="20"/>
			<line x1="4" y1="8" x2="20" y2="8"/>
			<line x1="4" y1="12" x2="20" y2="12"/>
			<line x1="4" y1="16" x2="20" y2="16"/>
		</svg>`,
	},
	{
		name: 'Tetti',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<path d="M3 12l9-9 9 9"/>
			<path d="M5 12v8h14v-8"/>
			<line x1="9" y1="12" x2="9" y2="20"/>
			<line x1="15" y1="12" x2="15" y2="20"/>
		</svg>`,
	},
	{
		name: 'Pavimenti',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<rect x="2" y="8" width="20" height="12" rx="1"/>
			<line x1="6" y1="8" x2="6" y2="20"/>
			<line x1="10" y1="8" x2="10" y2="20"/>
			<line x1="14" y1="8" x2="14" y2="20"/>
			<line x1="18" y1="8" x2="18" y2="20"/>
			<line x1="2" y1="12" x2="22" y2="12"/>
			<line x1="2" y1="16" x2="22" y2="16"/>
		</svg>`,
	},
]

interface ProductCategoriesManagerProps {
	onCategorySaved?: () => void
	onCategoryDeleted?: () => void
}

export function ProductCategoriesManager({
	onCategorySaved,
	onCategoryDeleted,
}: ProductCategoriesManagerProps = {}) {
	const { t } = useLanguage()
	const [categories, setCategories] = useState<ProductCategory[]>([])
	const [filteredCategories, setFilteredCategories] = useState<
		ProductCategory[]
	>([])
	const [searchTerm, setSearchTerm] = useState('')
	const [showAddModal, setShowAddModal] = useState(false)
	const [showEditModal, setShowEditModal] = useState(false)
	const [showSuppliersModal, setShowSuppliersModal] = useState(false)
	const [selectedCategoryForSuppliers, setSelectedCategoryForSuppliers] =
		useState<ProductCategory | null>(null)
	const [showParametersModal, setShowParametersModal] = useState(false)
	const [selectedCategoryForParameters, setSelectedCategoryForParameters] =
		useState<ProductCategory | null>(null)
	const [editingCategory, setEditingCategory] =
		useState<ProductCategory | null>(null)
	const [loading, setLoading] = useState(true)

	// Форма для добавления/редактирования
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		icon: '',
	})
	const [selectedIcon, setSelectedIcon] = useState('')

	// Загружаем категории
	useEffect(() => {
		fetchCategories()
	}, [])

	// Фильтрация категорий
	useEffect(() => {
		if (searchTerm.trim()) {
			const filtered = categories.filter(
				category =>
					category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					category.description?.toLowerCase().includes(searchTerm.toLowerCase())
			)
			setFilteredCategories(filtered)
		} else {
			setFilteredCategories(categories)
		}
	}, [searchTerm, categories])

	const fetchCategories = async () => {
		try {
			setLoading(true)
			const response = await fetch('/api/categories')
			if (response.ok) {
				const data = await response.json()
				setCategories(data)
			} else {
				console.error('Error fetching categories')
			}
		} catch (error) {
			console.error('Error fetching categories:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleAddCategory = async () => {
		if (!formData.name.trim()) {
			alert('Nome categoria è obbligatorio')
			return
		}

		if (!selectedIcon) {
			alert("Seleziona un'icona")
			return
		}

		try {
			const response = await fetch('/api/categories', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: formData.name,
					icon: selectedIcon,
					description: formData.description,
				}),
			})

			if (response.ok) {
				const newCategory = await response.json()
				setCategories(prev => [...prev, newCategory])
				console.log('✅ Categoria creata:', newCategory.name)
				resetForm()
				setShowAddModal(false)
			} else {
				const error = await response.json()
				console.error('❌ Errore creazione categoria:', error.error)
				alert(`Errore: ${error.error}`)
			}
		} catch (error) {
			console.error('❌ Errore:', error)
			alert('Errore durante la creazione della categoria')
		} finally {
			onCategorySaved?.()
		}
	}

	const handleEditCategory = async () => {
		if (!editingCategory || !formData.name.trim()) {
			alert('Nome categoria è obbligatorio')
			return
		}

		if (!selectedIcon) {
			alert("Seleziona un'icona")
			return
		}

		try {
			const response = await fetch(`/api/categories/${editingCategory.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: formData.name,
					icon: selectedIcon,
					description: formData.description,
				}),
			})

			if (response.ok) {
				const updatedCategory = await response.json()
				setCategories(prev =>
					prev.map(cat =>
						cat.id === editingCategory.id ? updatedCategory : cat
					)
				)
				console.log('✅ Categoria aggiornata:', updatedCategory.name)
				resetForm()
				setShowEditModal(false)
				setEditingCategory(null)
			} else {
				const error = await response.json()
				console.error('❌ Errore aggiornamento:', error.error)
				alert(`Errore: ${error.error}`)
			}
		} catch (error) {
			console.error('❌ Errore:', error)
			alert("Errore durante l'aggiornamento della categoria")
		} finally {
			onCategorySaved?.()
		}
	}

	const handleToggleActive = async (categoryId: string, isActive: boolean) => {
		try {
			const response = await fetch(`/api/categories/${categoryId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ isActive: !isActive }),
			})

			if (response.ok) {
				const updatedCategory = await response.json()
				setCategories(prev =>
					prev.map(cat => (cat.id === categoryId ? updatedCategory : cat))
				)
				console.log(
					`✅ Categoria ${isActive ? 'disattivata' : 'attivata'}:`,
					updatedCategory.name
				)
			} else {
				const error = await response.json()
				console.error('❌ Errore aggiornamento:', error.error)
			}
		} catch (error) {
			console.error('❌ Errore:', error)
		}
	}

	const handleDeleteCategory = async (categoryId: string) => {
		if (!confirm('Sei sicuro di voler eliminare questa categoria?')) {
			return
		}

		try {
			const response = await fetch(`/api/categories/${categoryId}`, {
				method: 'DELETE',
			})

			if (response.ok) {
				setCategories(prev => prev.filter(cat => cat.id !== categoryId))
				console.log('✅ Categoria eliminata')
			} else {
				const error = await response.json()
				console.error('❌ Errore eliminazione:', error.error)
				alert(`Errore: ${error.error}`)
			}
		} catch (error) {
			console.error('❌ Errore:', error)
			alert("Errore durante l'eliminazione della categoria")
		} finally {
			onCategoryDeleted?.()
		}
	}

	const resetForm = () => {
		setFormData({ name: '', description: '', icon: '' })
		setSelectedIcon('')
	}

	const openEditModal = (category: ProductCategory) => {
		setEditingCategory(category)
		setFormData({
			name: category.name,
			description: category.description || '',
			icon: category.icon,
		})
		setSelectedIcon(category.icon)
		setShowEditModal(true)
	}

	const openSuppliersModal = (category: ProductCategory) => {
		setSelectedCategoryForSuppliers(category)
		setShowSuppliersModal(true)
	}

	if (loading) {
		return (
			<div className='flex items-center justify-center h-32'>
				<div className='text-lg text-gray-600'>Caricamento categorie...</div>
			</div>
		)
	}

	return (
		<div className='space-y-4'>
			{/* Заголовок */}
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-2'>
					<Tag className='h-5 w-5 text-gray-600' />
					<div>
						<h3 className='text-lg font-semibold'>Категории продуктов</h3>
						<p className='text-sm text-gray-600'>
							Управление категориями для конфигуратора продуктов
						</p>
					</div>
				</div>
				<Button
					onClick={() => setShowAddModal(true)}
					className='bg-green-600 hover:bg-green-700'
					size='sm'
				>
					<Plus className='h-4 w-4 mr-2' />
					Добавить категорию
				</Button>
			</div>

			{/* Поиск */}
			<div className='flex items-center gap-4'>
				<div className='flex-1'>
					<Label htmlFor='search'>Поиск категорий</Label>
					<div className='relative mt-1'>
						<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
						<Input
							id='search'
							placeholder='Поиск по названию или описанию...'
							value={searchTerm}
							onChange={e => setSearchTerm(e.target.value)}
							className='pl-10'
						/>
					</div>
				</div>
			</div>

			{/* Статистика */}
			<div className='grid grid-cols-3 gap-4'>
				<Card className='p-3'>
					<div className='text-xl font-bold text-blue-600'>
						{categories.length}
					</div>
					<div className='text-sm text-gray-600'>Всего категорий</div>
				</Card>
				<Card className='p-3'>
					<div className='text-xl font-bold text-green-600'>
						{categories.filter(cat => cat.isActive).length}
					</div>
					<div className='text-sm text-gray-600'>Активные</div>
				</Card>
				<Card className='p-3'>
					<div className='text-xl font-bold text-gray-600'>
						{categories.filter(cat => !cat.isActive).length}
					</div>
					<div className='text-sm text-gray-600'>Неактивные</div>
				</Card>
			</div>

			{/* Таблица категорий */}
			<Card>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Иконка</TableHead>
							<TableHead>Название</TableHead>
							<TableHead>Описание</TableHead>
							<TableHead>Статус</TableHead>
							<TableHead>Создана</TableHead>
							<TableHead className='text-right'>Действия</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredCategories.map(category => (
							<TableRow key={category.id}>
								<TableCell>
									<div
										className='w-8 h-8 flex items-center justify-center bg-blue-50 rounded'
										dangerouslySetInnerHTML={{ __html: category.icon }}
									/>
								</TableCell>
								<TableCell className='font-medium'>{category.name}</TableCell>
								<TableCell className='text-gray-600'>
									{category.description || '-'}
								</TableCell>
								<TableCell>
									<Badge
										variant={category.isActive ? 'default' : 'secondary'}
										className={
											category.isActive
												? 'bg-green-100 text-green-800'
												: 'bg-gray-100 text-gray-800'
										}
									>
										{category.isActive ? 'Активна' : 'Неактивна'}
									</Badge>
								</TableCell>
								<TableCell className='text-gray-600'>
									{new Date(category.createdAt).toLocaleDateString('ru-RU')}
								</TableCell>
								<TableCell className='text-right'>
									<div className='flex items-center justify-end gap-1'>
										<Button
											variant='ghost'
											size='sm'
											onClick={() =>
												handleToggleActive(category.id, category.isActive)
											}
											className='h-8 w-8 p-0'
											title={
												category.isActive ? 'Деактивировать' : 'Активировать'
											}
										>
											{category.isActive ? (
												<EyeOff className='h-4 w-4 text-gray-500' />
											) : (
												<Eye className='h-4 w-4 text-gray-500' />
											)}
										</Button>
										<Button
											variant='ghost'
											size='sm'
											onClick={() => openEditModal(category)}
											className='h-8 w-8 p-0'
											title='Редактировать'
										>
											<Edit className='h-4 w-4 text-blue-500' />
										</Button>
										<Button
											variant='ghost'
											size='sm'
											onClick={() => openSuppliersModal(category)}
											className='h-8 w-8 p-0'
											title={t('manageSuppliers')}
										>
											<Building2 className='h-4 w-4 text-green-500' />
										</Button>
										<Button
											variant='ghost'
											size='sm'
											onClick={() => {
												setSelectedCategoryForParameters(category)
												setShowParametersModal(true)
											}}
											className='h-8 w-8 p-0'
											title='Параметры / Parametri'
										>
											<Tag className='h-4 w-4 text-purple-500' />
										</Button>
										<Button
											variant='ghost'
											size='sm'
											onClick={() => handleDeleteCategory(category.id)}
											className='h-8 w-8 p-0 text-red-500 hover:text-red-700'
											title='Удалить'
										>
											<Trash2 className='h-4 w-4' />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</Card>

			{/* Модальное окно добавления */}
			<Dialog open={showAddModal} onOpenChange={setShowAddModal}>
				<DialogContent className='max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto'>
					<DialogHeader>
						<DialogTitle className='flex items-center gap-2'>
							<Plus className='h-5 w-5' />
							Добавить новую категорию
						</DialogTitle>
						<DialogDescription>
							Создайте новую категорию продуктов с иконкой
						</DialogDescription>
					</DialogHeader>

					<div className='space-y-6 py-4'>
						{/* Название категории */}
						<div>
							<Label htmlFor='categoryName'>Название категории *</Label>
							<Input
								id='categoryName'
								value={formData.name}
								onChange={e =>
									setFormData(prev => ({ ...prev, name: e.target.value }))
								}
								placeholder='Например: Serramenti, Cassonetti, Avvolgibile...'
								className='mt-1'
							/>
						</div>

						{/* Описание */}
						<div>
							<Label htmlFor='categoryDescription'>Описание</Label>
							<Textarea
								id='categoryDescription'
								value={formData.description}
								onChange={e =>
									setFormData(prev => ({
										...prev,
										description: e.target.value,
									}))
								}
								placeholder='Опциональное описание категории...'
								className='mt-1'
								rows={3}
							/>
						</div>

						{/* Выбор иконки */}
						<div>
							<Label>Выберите иконку *</Label>
							<div className='mt-3 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3'>
								{DEFAULT_ICONS.map((iconData, index) => (
									<Card
										key={index}
										className={`p-3 cursor-pointer transition-all hover:shadow-md ${
											selectedIcon === iconData.svg
												? 'ring-2 ring-blue-500 bg-blue-50'
												: 'hover:bg-gray-50'
										}`}
										onClick={() => setSelectedIcon(iconData.svg)}
									>
										<div className='flex flex-col items-center space-y-2'>
											<div
												className='w-8 h-8 flex items-center justify-center'
												dangerouslySetInnerHTML={{ __html: iconData.svg }}
											/>
											<div className='text-xs text-center text-gray-600'>
												{iconData.name}
											</div>
										</div>
									</Card>
								))}
							</div>
						</div>

						{/* Кастомная иконка */}
						<div>
							<Label htmlFor='customIcon'>Кастомная иконка (SVG)</Label>
							<Textarea
								id='customIcon'
								value={formData.icon}
								onChange={e => {
									setFormData(prev => ({ ...prev, icon: e.target.value }))
									setSelectedIcon(e.target.value)
								}}
								placeholder='Вставьте код SVG...'
								className='mt-1 font-mono text-sm'
								rows={4}
							/>
							{formData.icon && (
								<div className='mt-2 p-3 border rounded-lg bg-gray-50'>
									<div className='text-sm text-gray-600 mb-2'>
										Предпросмотр:
									</div>
									<div
										className='w-12 h-12 flex items-center justify-center'
										dangerouslySetInnerHTML={{ __html: formData.icon }}
									/>
								</div>
							)}
						</div>
					</div>

					{/* Действия */}
					<div className='flex justify-end gap-3 pt-4 border-t'>
						<Button variant='outline' onClick={() => setShowAddModal(false)}>
							<X className='h-4 w-4 mr-2' />
							Отмена
						</Button>
						<Button
							onClick={handleAddCategory}
							className='bg-green-600 hover:bg-green-700'
						>
							<Plus className='h-4 w-4 mr-2' />
							Создать категорию
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Модальное окно редактирования */}
			<Dialog open={showEditModal} onOpenChange={setShowEditModal}>
				<DialogContent className='max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto'>
					<DialogHeader>
						<DialogTitle className='flex items-center gap-2'>
							<Edit className='h-5 w-5' />
							Редактировать категорию
						</DialogTitle>
						<DialogDescription>
							Измените данные категории продуктов
						</DialogDescription>
					</DialogHeader>

					<div className='space-y-6 py-4'>
						{/* Название категории */}
						<div>
							<Label htmlFor='editCategoryName'>Название категории *</Label>
							<Input
								id='editCategoryName'
								value={formData.name}
								onChange={e =>
									setFormData(prev => ({ ...prev, name: e.target.value }))
								}
								placeholder='Например: Serramenti, Cassonetti, Avvolgibile...'
								className='mt-1'
							/>
						</div>

						{/* Описание */}
						<div>
							<Label htmlFor='editCategoryDescription'>Описание</Label>
							<Textarea
								id='editCategoryDescription'
								value={formData.description}
								onChange={e =>
									setFormData(prev => ({
										...prev,
										description: e.target.value,
									}))
								}
								placeholder='Опциональное описание категории...'
								className='mt-1'
								rows={3}
							/>
						</div>

						{/* Выбор иконки */}
						<div>
							<Label>Выберите иконку *</Label>
							<div className='mt-3 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3'>
								{DEFAULT_ICONS.map((iconData, index) => (
									<Card
										key={index}
										className={`p-3 cursor-pointer transition-all hover:shadow-md ${
											selectedIcon === iconData.svg
												? 'ring-2 ring-blue-500 bg-blue-50'
												: 'hover:bg-gray-50'
										}`}
										onClick={() => setSelectedIcon(iconData.svg)}
									>
										<div className='flex flex-col items-center space-y-2'>
											<div
												className='w-8 h-8 flex items-center justify-center'
												dangerouslySetInnerHTML={{ __html: iconData.svg }}
											/>
											<div className='text-xs text-center text-gray-600'>
												{iconData.name}
											</div>
										</div>
									</Card>
								))}
							</div>
						</div>

						{/* Кастомная иконка */}
						<div>
							<Label htmlFor='editCustomIcon'>Кастомная иконка (SVG)</Label>
							<Textarea
								id='editCustomIcon'
								value={formData.icon}
								onChange={e => {
									setFormData(prev => ({ ...prev, icon: e.target.value }))
									setSelectedIcon(e.target.value)
								}}
								placeholder='Вставьте код SVG...'
								className='mt-1 font-mono text-sm'
								rows={4}
							/>
							{formData.icon && (
								<div className='mt-2 p-3 border rounded-lg bg-gray-50'>
									<div className='text-sm text-gray-600 mb-2'>
										Предпросмотр:
									</div>
									<div
										className='w-12 h-12 flex items-center justify-center'
										dangerouslySetInnerHTML={{ __html: formData.icon }}
									/>
								</div>
							)}
						</div>
					</div>

					{/* Действия */}
					<div className='flex justify-end gap-3 pt-4 border-t'>
						<Button variant='outline' onClick={() => setShowEditModal(false)}>
							<X className='h-4 w-4 mr-2' />
							Отмена
						</Button>
						<Button
							onClick={handleEditCategory}
							className='bg-blue-600 hover:bg-blue-700'
						>
							<Edit className='h-4 w-4 mr-2' />
							Сохранить изменения
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Модальное окно управления поставщиками */}
			{showSuppliersModal && selectedCategoryForSuppliers && (
				<Dialog open={showSuppliersModal} onOpenChange={setShowSuppliersModal}>
					<DialogContent className='max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto'>
						<DialogHeader>
							<DialogTitle>
								{t('manageSuppliers')} - {selectedCategoryForSuppliers.name}
							</DialogTitle>
							<DialogDescription>
								{t('manageSuppliersForCategory', {
									category: selectedCategoryForSuppliers.name,
								})}
							</DialogDescription>
						</DialogHeader>

						<div className='py-4'>
							<CategorySuppliersManager
								categoryId={selectedCategoryForSuppliers.id}
								categoryName={selectedCategoryForSuppliers.name}
							/>
						</div>
					</DialogContent>
				</Dialog>
			)}

			{/* Модальное окно управления параметрами */}
			{showParametersModal && selectedCategoryForParameters && (
				<Dialog
					open={showParametersModal}
					onOpenChange={setShowParametersModal}
				>
					<DialogContent className='max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto'>
						<DialogHeader>
							<DialogTitle>
								Параметры категории - {selectedCategoryForParameters.name}
							</DialogTitle>
							<DialogDescription>
								Настройте параметры для категории{' '}
								{selectedCategoryForParameters.name}
							</DialogDescription>
						</DialogHeader>

						<div className='py-4'>
							<CategoryParametersManager
								categoryId={selectedCategoryForParameters.id}
								categoryName={selectedCategoryForParameters.name}
							/>
						</div>
					</DialogContent>
				</Dialog>
			)}
		</div>
	)
}
