'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/app-layout'
import { UnifiedNavV2 } from '@/components/unified-nav-v2'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { logger } from '@/lib/logger'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import {
	Tags,
	Plus,
	Edit,
	Trash2,
	Eye,
	EyeOff,
	Building2,
	Settings,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { highlightText } from '@/lib/highlight-text'
import { toast } from 'sonner'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import { CategorySuppliersManager } from '@/components/category-suppliers-manager'
import CategoryParametersManager from '@/components/category-parameters-manager'

interface Category {
	id: string
	name: string
	description?: string
	icon: string
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

export default function CategoriesPage() {
	const { t, locale } = useLanguage()
	const [categories, setCategories] = useState<Category[]>([])
	const [searchTerm, setSearchTerm] = useState('')
	const [showForm, setShowForm] = useState(false)
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)
	const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
		null
	)
	const [editingCategory, setEditingCategory] = useState<Category | undefined>()
	const [isDeleting, setIsDeleting] = useState(false)
	const [showSuppliersModal, setShowSuppliersModal] = useState(false)
	const [showParametersModal, setShowParametersModal] = useState(false)
	const [selectedCategoryForSuppliers, setSelectedCategoryForSuppliers] =
		useState<Category | null>(null)
	const [selectedCategoryForParameters, setSelectedCategoryForParameters] =
		useState<Category | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	// Форма для добавления/редактирования
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		icon: '',
	})
	const [selectedIcon, setSelectedIcon] = useState('')

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
			logger.error('Error fetching categories:', error)
		} finally {
			setIsLoading(false)
		}
	}

	const handleSaveCategory = async (categoryData: {
		name: string
		icon: string
		description?: string
	}) => {
		try {
			const url = editingCategory
				? `/api/categories/${editingCategory.id}`
				: '/api/categories'
			const method = editingCategory ? 'PUT' : 'POST'

			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(categoryData),
			})

			if (response.ok) {
				await fetchCategories()
				setShowForm(false)
				setEditingCategory(undefined)
				resetForm()
				toast.success(
					editingCategory ? 'Категория обновлена' : 'Категория создана'
				)
			} else {
				const error = await response.json()
				logger.error('Error saving category:', error)
				toast.error('Ошибка: ' + (error.error || 'Unknown error'))
			}
		} catch (error) {
			logger.error('Error saving category:', error)
			toast.error('Ошибка при сохранении')
		}
	}

	const handleEdit = (category: Category) => {
		setEditingCategory(category)
		setFormData({
			name: category.name,
			description: category.description || '',
			icon: category.icon,
		})
		setSelectedIcon(category.icon)
		setShowForm(true)
	}

	const handleToggleActive = async (categoryId: string, isActive: boolean) => {
		try {
			const response = await fetch(`/api/categories/${categoryId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ isActive: !isActive }),
			})

			if (response.ok) {
				await fetchCategories()
				toast.success(
					`Категория ${isActive ? 'деактивирована' : 'активирована'}`
				)
			} else {
				const error = await response.json()
				toast.error(`Ошибка обновления: ${error.error}`)
			}
		} catch (error) {
			logger.error('Error updating category:', error)
			toast.error('Ошибка при обновлении категории')
		}
	}

	const handleDelete = async () => {
		if (!categoryToDelete) return

		setIsDeleting(true)
		try {
			const response = await fetch(`/api/categories/${categoryToDelete.id}`, {
				method: 'DELETE',
			})

			if (response.ok) {
				await fetchCategories()
				toast.success('Категория удалена')
				setShowDeleteDialog(false)
				setCategoryToDelete(null)
			} else {
				const error = await response.json()
				if (error.details) {
					toast.error(
						`Нельзя удалить категорию: ${JSON.stringify(error.details)}`
					)
				} else {
					toast.error(`Ошибка удаления: ${error.error}`)
				}
			}
		} catch (error) {
			logger.error('Error deleting category:', error)
			toast.error('Ошибка при удалении категории')
		} finally {
			setIsDeleting(false)
		}
	}

	const resetForm = () => {
		setFormData({ name: '', description: '', icon: '' })
		setSelectedIcon('')
	}

	const openSuppliersModal = (category: Category) => {
		setSelectedCategoryForSuppliers(category)
		setShowSuppliersModal(true)
	}

	const openParametersModal = (category: Category) => {
		setSelectedCategoryForParameters(category)
		setShowParametersModal(true)
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
		},
		{
			id: 'parameters',
			name: locale === 'ru' ? 'Параметры' : 'Parametri',
			href: '/parameters',
			icon: Settings,
		},
	]

	return (
		<AppLayout>
			<div className='space-y-6'>
				{/* Заголовок с навигацией */}
				<UnifiedNavV2
					items={navItems}
					onAddClick={() => {
						setEditingCategory(undefined)
						setShowForm(true)
					}}
					addButtonText={
						locale === 'ru' ? 'Новая категория' : 'Nuova categoria'
					}
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
								<Button onClick={() => setShowForm(true)}>
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
											Название
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
													<div
														className='w-8 h-8 flex items-center justify-center bg-blue-50 rounded'
														dangerouslySetInnerHTML={{ __html: category.icon }}
													/>
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
												{new Date(category.createdAt).toLocaleDateString(
													'ru-RU'
												)}
											</td>
											<td className='py-3 px-4'>
												<div className='flex items-center justify-center space-x-2'>
													<Button
														variant='ghost'
														size='sm'
														onClick={() =>
															handleToggleActive(category.id, category.isActive)
														}
														title={
															category.isActive
																? locale === 'ru'
																	? 'Деактивировать'
																	: 'Disattiva'
																: locale === 'ru'
																? 'Активировать'
																: 'Attiva'
														}
													>
														{category.isActive ? (
															<EyeOff className='w-4 h-4 text-gray-500' />
														) : (
															<Eye className='w-4 h-4 text-gray-500' />
														)}
													</Button>
													<Button
														variant='ghost'
														size='sm'
														onClick={() => handleEdit(category)}
														title={
															locale === 'ru' ? 'Редактировать' : 'Modifica'
														}
													>
														<Edit className='w-4 h-4 text-blue-500' />
													</Button>
													<Button
														variant='ghost'
														size='sm'
														onClick={() => openSuppliersModal(category)}
														title={locale === 'ru' ? 'Поставщики' : 'Fornitori'}
													>
														<Building2 className='w-4 h-4 text-green-500' />
													</Button>
													<Button
														variant='ghost'
														size='sm'
														onClick={() => openParametersModal(category)}
														title={locale === 'ru' ? 'Параметры' : 'Parametri'}
													>
														<Settings className='w-4 h-4 text-purple-500' />
													</Button>
													<Button
														variant='ghost'
														size='sm'
														onClick={() => {
															setCategoryToDelete(category)
															setShowDeleteDialog(true)
														}}
														title={locale === 'ru' ? 'Удалить' : 'Elimina'}
													>
														<Trash2 className='w-4 h-4 text-red-500' />
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
			</div>

			{/* Форма категории */}
			<Dialog open={showForm} onOpenChange={setShowForm}>
				<DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
					<DialogHeader>
						<DialogTitle>
							{editingCategory
								? t('edit') + ' ' + t('category')
								: t('addCategory')}
						</DialogTitle>
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
									<div
										key={index}
										className={`p-3 cursor-pointer transition-all hover:shadow-md border rounded-lg ${
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
									</div>
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
						<Button variant='outline' onClick={() => setShowForm(false)}>
							Отмена
						</Button>
						<Button
							onClick={() => {
								if (!formData.name.trim()) {
									toast.error('Название категории обязательно')
									return
								}
								if (!selectedIcon) {
									toast.error('Выберите иконку')
									return
								}
								handleSaveCategory({
									name: formData.name,
									icon: selectedIcon,
									description: formData.description,
								})
							}}
							className='bg-green-600 hover:bg-green-700'
						>
							{editingCategory ? 'Сохранить' : 'Создать'}
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
								Управление поставщиками - {selectedCategoryForSuppliers.name}
							</DialogTitle>
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
								{locale === 'ru'
									? `Параметры категории - ${selectedCategoryForParameters.name}`
									: `Parametri categoria - ${selectedCategoryForParameters.name}`}
							</DialogTitle>
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
			{/* Диалог подтверждения удаления */}
			<ConfirmDeleteDialog
				isOpen={showDeleteDialog}
				onClose={() => {
					setShowDeleteDialog(false)
					setCategoryToDelete(null)
				}}
				onConfirm={handleDelete}
				title={
					locale === 'ru' ? 'Удаление категории' : 'Eliminazione categoria'
				}
				itemName={categoryToDelete?.name || ''}
				itemType={locale === 'ru' ? 'категорию' : 'categoria'}
				warningMessage={
					locale === 'ru'
						? 'Удаление категории может повлиять на связанные параметры и поставщиков.'
						: "L'eliminazione della categoria potrebbe influire sui parametri e fornitori collegati."
				}
				isLoading={isDeleting}
			/>
		</AppLayout>
	)
}
