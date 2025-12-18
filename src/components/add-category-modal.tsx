'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { logger } from '@/lib/logger'
import { apiClient, ApiError } from '@/lib/api-client'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Save, X } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

// Предустановленные иконки в стиле ultra-thin
const DEFAULT_ICONS = [
	{
		name: 'Serramenti',
		icon: '🪟',
		description: 'Finestre e porte finestre',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<rect x="4" y="4" width="16" height="16" rx="1"/>
			<line x1="12" y1="4" x2="12" y2="20"/>
			<line x1="4" y1="12" x2="20" y2="12"/>
		</svg>`,
	},
	{
		name: 'Cassonetti',
		icon: '📦',
		description: 'Cassonetti per avvolgibili',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<rect x="3" y="4" width="18" height="12" rx="1"/>
			<line x1="9" y1="20" x2="15" y2="20"/>
			<line x1="12" y1="16" x2="12" y2="20"/>
		</svg>`,
	},
	{
		name: 'Avvolgibile',
		icon: '🪟',
		description: 'Tende avvolgibili',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<rect x="3" y="4" width="18" height="16" rx="1"/>
			<line x1="3" y1="8" x2="21" y2="8"/>
			<line x1="3" y1="12" x2="21" y2="12"/>
			<line x1="3" y1="16" x2="21" y2="16"/>
		</svg>`,
	},
	{
		name: 'Scuri',
		icon: '🪟',
		description: 'Scuri e persiane',
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
		icon: '🪟',
		description: 'Tende e tendaggi',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<rect x="3" y="4" width="18" height="16" rx="1"/>
			<line x1="3" y1="8" x2="21" y2="8"/>
			<line x1="3" y1="12" x2="21" y2="12"/>
			<line x1="3" y1="16" x2="21" y2="16"/>
		</svg>`,
	},
	{
		name: 'Zanzariere',
		icon: '🦟',
		description: 'Zanzariere e reti',
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
		icon: '🚪',
		description: 'Porte blindate e portoncini',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<rect x="4" y="4" width="16" height="16" rx="1"/>
			<circle cx="12" cy="12" r="2"/>
			<path d="M8 12h8"/>
		</svg>`,
	},
	{
		name: 'Pergole',
		icon: '🏗️',
		description: 'Pergole e strutture esterne',
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
		icon: '📦',
		description: 'Accessori e componenti',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<rect x="3" y="3" width="18" height="18" rx="1"/>
			<circle cx="9" cy="9" r="2"/>
			<circle cx="15" cy="15" r="2"/>
			<line x1="9" y1="9" x2="15" y2="15"/>
		</svg>`,
	},
	{
		name: 'Vetrate',
		icon: '🪟',
		description: 'Vetrate e cristalli',
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
		icon: '🚪',
		description: 'Cancelli e recinzioni',
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
		icon: '🏠',
		description: 'Tetti e coperture',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<path d="M3 12l9-9 9 9"/>
			<path d="M5 12v8h14v-8"/>
			<line x1="9" y1="12" x2="9" y2="20"/>
			<line x1="15" y1="12" x2="15" y2="20"/>
		</svg>`,
	},
	{
		name: 'Pavimenti',
		icon: '🏗️',
		description: 'Pavimenti e rivestimenti',
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

interface AddCategoryModalProps {
	isOpen: boolean
	onClose: () => void
	onCategorySaved?: () => void
	editingCategory?: any
}

export function AddCategoryModal({
	isOpen,
	onClose,
	onCategorySaved,
	editingCategory,
}: AddCategoryModalProps) {
	const { t } = useLanguage()
	const [formData, setFormData] = useState({
		name: '',
		icon: '',
		description: '',
	})
	const [selectedIcon, setSelectedIcon] = useState('')

	// Обновляем форму при изменении editingCategory
	useEffect(() => {
		if (editingCategory) {
			setFormData({
				name: editingCategory.name || '',
				icon: editingCategory.icon || '',
				description: editingCategory.description || '',
			})
			setSelectedIcon(editingCategory.icon || '')
		} else {
			setFormData({ name: '', icon: '', description: '' })
			setSelectedIcon('')
		}
	}, [editingCategory, isOpen])

	const handleSave = async () => {
		if (!formData.name.trim()) {
			alert('Название категории обязательно')
			return
		}

		if (!selectedIcon) {
			alert('Выберите иконку')
			return
		}

		try {
			const categoryData = {
				name: formData.name,
				icon: selectedIcon,
				description: formData.description,
			}

			if (editingCategory) {
				await apiClient.put(`/api/product-categories/${editingCategory.id}`, categoryData)
			} else {
				await apiClient.post('/api/product-categories', categoryData)
			}

			// Уведомляем родительский компонент
			if (onCategorySaved) {
				onCategorySaved()
			}

			// Reset form
			setFormData({ name: '', icon: '', description: '' })
			setSelectedIcon('')
			onClose()
		} catch (error) {
			logger.error('Error saving category:', error)
			if (error instanceof ApiError && error.status === 401) {
				return
			}
			const errorMessage = error instanceof ApiError 
				? error.message 
				: 'Ошибка при сохранении категории'
			alert(errorMessage)
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='max-w-2xl w-[90vw] max-h-[90vh] overflow-y-auto'>
				<DialogHeader className='pb-4'>
					<DialogTitle className='text-xl font-semibold'>
						{editingCategory ? 'Редактировать категорию' : 'Добавить категорию'}
					</DialogTitle>
				</DialogHeader>

				<div className='space-y-6'>
					{/* Основные поля в сетке */}
					<div className='grid grid-cols-1 gap-4'>
						{/* Название категории */}
						<div>
							<Label
								htmlFor='categoryName'
								className='text-sm font-medium text-gray-700'
							>
								Название категории *
							</Label>
							<Input
								id='categoryName'
								value={formData.name}
								onChange={e =>
									setFormData(prev => ({ ...prev, name: e.target.value }))
								}
								placeholder='Например: Окна, Двери, Роллеты...'
								className='mt-1'
							/>
						</div>

						{/* Описание */}
						<div>
							<Label
								htmlFor='categoryDescription'
								className='text-sm font-medium text-gray-700'
							>
								Описание
							</Label>
							<Textarea
								id='categoryDescription'
								value={formData.description}
								onChange={e =>
									setFormData(prev => ({
										...prev,
										description: e.target.value,
									}))
								}
								placeholder='Краткое описание категории...'
								className='mt-1'
								rows={2}
							/>
						</div>
					</div>

					{/* Выбор иконки */}
					<div>
						<Label className='text-sm font-medium text-gray-700'>
							Выберите иконку *
						</Label>
						<div className='mt-3 grid grid-cols-6 gap-3'>
							{DEFAULT_ICONS.map((iconData, index) => (
								<Card
									key={index}
									className={`p-3 cursor-pointer transition-all hover:shadow-md aspect-square ${
										selectedIcon === iconData.svg
											? 'ring-2 ring-blue-500 bg-blue-50'
											: 'hover:bg-gray-50'
									}`}
									onClick={() => setSelectedIcon(iconData.svg)}
								>
									<div className='flex flex-col items-center justify-center h-full text-center'>
										<div
											className='w-6 h-6 flex items-center justify-center mb-1'
											dangerouslySetInnerHTML={{ __html: iconData.svg }}
										/>
										<div className='text-xs text-gray-600 leading-tight'>
											{iconData.name}
										</div>
									</div>
								</Card>
							))}
						</div>
					</div>

					{/* Кастомная иконка */}
					<div>
						<Label
							htmlFor='customIcon'
							className='text-sm font-medium text-gray-700'
						>
							Или введите SVG код
						</Label>
						<Textarea
							id='customIcon'
							value={formData.icon}
							onChange={e => {
								setFormData(prev => ({ ...prev, icon: e.target.value }))
								setSelectedIcon(e.target.value)
							}}
							placeholder='<svg>...</svg>'
							className='mt-1 font-mono text-sm'
							rows={3}
						/>
						{formData.icon && (
							<div className='mt-2 p-3 border border-gray-200 rounded-lg bg-gray-50'>
								<div className='text-xs text-gray-500 mb-2'>Предпросмотр:</div>
								<div
									className='w-8 h-8 flex items-center justify-center'
									dangerouslySetInnerHTML={{ __html: formData.icon }}
								/>
							</div>
						)}
					</div>
				</div>

				{/* Кнопки */}
				<div className='flex items-center justify-end space-x-3 pt-4'>
					<Button
						variant='outline'
						onClick={onClose}
						className='border-gray-300 text-gray-700 hover:bg-gray-50'
					>
						Отмена
					</Button>
					<Button
						onClick={handleSave}
						className='bg-green-600 hover:bg-green-700 text-white'
					>
						{editingCategory ? 'Сохранить изменения' : 'Создать категорию'}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
