'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { logger } from '@/lib/logger'
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
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Search, Save, X } from 'lucide-react'
import { highlightText } from '@/lib/highlight-text'
import { multiSearch } from '@/lib/multi-search'
import { useSorting } from '@/hooks/use-sorting'
import { useLanguage } from '@/contexts/LanguageContext'

interface DictionaryItem {
	id: number
	name: string
	isActive: boolean
	createdAt: string
}

interface DictionariesManagerProps {
	type: 'sources' | 'partnerTypes' | 'specializations'
	title: string
	description: string
}

const DEFAULT_SOURCES: DictionaryItem[] = [
	{ id: 1, name: 'Сайт', isActive: true, createdAt: new Date().toISOString() },
	{
		id: 2,
		name: 'Социальные сети',
		isActive: true,
		createdAt: new Date().toISOString(),
	},
	{
		id: 3,
		name: 'Реклама Google',
		isActive: true,
		createdAt: new Date().toISOString(),
	},
	{
		id: 4,
		name: 'Реклама Facebook',
		isActive: true,
		createdAt: new Date().toISOString(),
	},
	{
		id: 5,
		name: 'Рекомендация',
		isActive: true,
		createdAt: new Date().toISOString(),
	},
	{
		id: 6,
		name: 'Холодный звонок',
		isActive: true,
		createdAt: new Date().toISOString(),
	},
	{
		id: 7,
		name: 'Выставка',
		isActive: true,
		createdAt: new Date().toISOString(),
	},
	{
		id: 8,
		name: 'Поисковые системы',
		isActive: true,
		createdAt: new Date().toISOString(),
	},
	{
		id: 9,
		name: 'Email-рассылка',
		isActive: true,
		createdAt: new Date().toISOString(),
	},
	{
		id: 10,
		name: 'Другое',
		isActive: true,
		createdAt: new Date().toISOString(),
	},
]

export function DictionariesManager({
	type,
	title,
	description,
}: DictionariesManagerProps) {
	const { t } = useLanguage()
	const [items, setItems] = useState<DictionaryItem[]>([])
	const [searchTerm, setSearchTerm] = useState('')
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [editingItem, setEditingItem] = useState<DictionaryItem | null>(null)
	const [formData, setFormData] = useState({ name: '', isActive: true })

	// Загрузка из API
	useEffect(() => {
		fetchItems()
	}, [type])

	const fetchItems = async () => {
		try {
			const response = await fetch(`/api/dictionaries?type=${type}`)
			if (response.ok) {
				const data = await response.json()
				if (data.length === 0 && type === 'sources') {
					// Инициализация источников по умолчанию
					await initializeDefaultSources()
				} else {
					setItems(data)
				}
			}
		} catch (error) {
			logger.error('Error fetching dictionaries:', error)
		}
	}

	const initializeDefaultSources = async () => {
		try {
			for (const source of DEFAULT_SOURCES) {
				await fetch('/api/dictionaries', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						type: 'sources',
						name: source.name,
						isActive: true,
					}),
				})
			}
			await fetchItems()
		} catch (error) {
			logger.error('Error initializing sources:', error)
		}
	}

	// Множественный поиск
	const filteredItems = multiSearch(items, searchTerm, ['name'])

	// Сортировка
	const { sortedItems, requestSort, getSortIcon } = useSorting(
		filteredItems,
		'name'
	)

	const handleAdd = async () => {
		if (!formData.name.trim()) return

		try {
			const response = await fetch('/api/dictionaries', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					type,
					name: formData.name.trim(),
					isActive: formData.isActive,
				}),
			})

			if (response.ok) {
				await fetchItems()
				setFormData({ name: '', isActive: true })
				setIsDialogOpen(false)
			}
		} catch (error) {
			logger.error('Error adding dictionary:', error)
			alert(t('errorAdding'))
		}
	}

	const handleEdit = async () => {
		if (!editingItem || !formData.name.trim()) return

		try {
			const response = await fetch('/api/dictionaries', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: editingItem.id,
					name: formData.name.trim(),
					isActive: formData.isActive,
				}),
			})

			if (response.ok) {
				await fetchItems()
				setEditingItem(null)
				setFormData({ name: '', isActive: true })
				setIsDialogOpen(false)
			}
		} catch (error) {
			logger.error('Error editing dictionary:', error)
			alert(t('errorEditing'))
		}
	}

	const handleDelete = async (id: number) => {
		if (!confirm(t('confirmDeleteItem'))) return

		try {
			const response = await fetch(`/api/dictionaries?id=${id}`, {
				method: 'DELETE',
			})

			if (response.ok) {
				await fetchItems()
			}
		} catch (error) {
			logger.error('Error deleting dictionary:', error)
			alert(t('errorDeleting'))
		}
	}

	const openEditDialog = (item: DictionaryItem) => {
		setEditingItem(item)
		setFormData({ name: item.name, isActive: item.isActive })
		setIsDialogOpen(true)
	}

	const closeDialog = () => {
		setIsDialogOpen(false)
		setEditingItem(null)
		setFormData({ name: '', isActive: true })
	}

	return (
		<Card className='sticker-card-v2'>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<div>
						<CardTitle className='text-xl'>{title}</CardTitle>
						<p className='text-sm text-gray-600 mt-1'>{description}</p>
					</div>
					<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<DialogTrigger asChild>
							<Button
								onClick={() => {
									setEditingItem(null)
									setFormData({ name: '', isActive: true })
								}}
								className='bg-green-600 hover:bg-green-700 text-white'
							>
								<Plus className='h-4 w-4 mr-2' />
								{t('add')}
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>
									{editingItem ? t('editItem') : t('addItem')}
								</DialogTitle>
								<DialogDescription>{t('fillSupplierInfo')}</DialogDescription>
							</DialogHeader>
							<div className='space-y-4 py-4'>
								<div className='space-y-2'>
									<Label htmlFor='name'>{t('namePlaceholder')}</Label>
									<Input
										id='name'
										value={formData.name}
										onChange={e =>
											setFormData({ ...formData, name: e.target.value })
										}
										placeholder={t('enterName')}
									/>
								</div>
								<div className='flex items-center space-x-2'>
									<input
										type='checkbox'
										id='isActive'
										checked={formData.isActive}
										onChange={e =>
											setFormData({ ...formData, isActive: e.target.checked })
										}
										className='h-4 w-4'
									/>
									<Label htmlFor='isActive'>{t('activeStatus')}</Label>
								</div>
							</div>
							<div className='flex justify-end gap-3'>
								<Button
									variant='outline'
									onClick={closeDialog}
									className='border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400'
								>
									<X className='h-4 w-4 mr-2' />
									{t('cancel')}
								</Button>
								<Button
									onClick={editingItem ? handleEdit : handleAdd}
									className='bg-green-600 hover:bg-green-700 text-white'
								>
									<Save className='h-4 w-4 mr-2' />
									{editingItem ? t('save') : t('add')}
								</Button>
							</div>
						</DialogContent>
					</Dialog>
				</div>
			</CardHeader>
			<CardContent>
				{/* Поиск */}
				<div className='mb-4'>
					<div className='relative'>
						<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
						<Input
							placeholder={t('searchDots')}
							value={searchTerm}
							onChange={e => setSearchTerm(e.target.value)}
							className='pl-10 bg-gray-50 border-gray-200 rounded-xl'
						/>
					</div>
				</div>

				{/* Таблица */}
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead
								className='cursor-pointer'
								onClick={() => requestSort('name')}
							>
								<div className='flex items-center gap-1'>
									{t('name')} {getSortIcon('name')}
								</div>
							</TableHead>
							<TableHead>{t('status')}</TableHead>
							<TableHead className='text-right'>{t('actions')}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{sortedItems.map(item => (
							<TableRow
								key={item.id}
								className={!item.isActive ? 'opacity-40' : ''}
							>
								<TableCell className='font-medium'>
									{highlightText(item.name, searchTerm)}
								</TableCell>
								<TableCell>
									<Badge
										variant={item.isActive ? 'default' : 'secondary'}
										className='text-xs'
									>
										{item.isActive ? t('activeStatus') : t('inactiveStatus')}
									</Badge>
								</TableCell>
								<TableCell className='text-right'>
									<div className='flex justify-end gap-2'>
										<Button
											variant='outline'
											size='sm'
											onClick={() => openEditDialog(item)}
										>
											<Edit className='h-4 w-4' />
										</Button>
										<Button
											variant='outline'
											size='sm'
											onClick={() => handleDelete(item.id)}
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

				{sortedItems.length === 0 && (
					<div className='text-center py-8 text-gray-500'>
						{searchTerm ? t('nothingFound') : t('noItems')}
					</div>
				)}
			</CardContent>
		</Card>
	)
}
