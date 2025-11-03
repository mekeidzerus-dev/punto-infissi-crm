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
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'

interface DocumentStatus {
	id: number
	name: string
	nameRu: string
	nameIt: string
	color: string
	isActive: boolean
	documentTypes: Array<{
		id: number
		documentType: {
			id: number
			name: string
			nameRu: string
			nameIt: string
		}
	}>
}

interface DocumentType {
	id: number
	name: string
	nameRu: string
	nameIt: string
}

const COLORS = [
	{ value: '#gray', label: 'Серый / Grigio' },
	{ value: '#blue', label: 'Синий / Blu' },
	{ value: '#green', label: 'Зеленый / Verde' },
	{ value: '#red', label: 'Красный / Rosso' },
	{ value: '#orange', label: 'Оранжевый / Arancione' },
	{ value: '#purple', label: 'Фиолетовый / Viola' },
	{ value: '#yellow', label: 'Желтый / Giallo' },
]

export function DocumentStatusesManager() {
	const { t, locale } = useLanguage()
	const [statuses, setStatuses] = useState<DocumentStatus[]>([])
	const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
	const [showModal, setShowModal] = useState(false)
	const [editingStatus, setEditingStatus] = useState<DocumentStatus | null>(
		null
	)
	const [formData, setFormData] = useState({
		name: '',
		nameRu: '',
		nameIt: '',
		color: '#gray',
		documentTypeIds: [] as number[],
	})

	useEffect(() => {
		loadStatuses()
		loadDocumentTypes()
	}, [])

	const loadStatuses = async () => {
		try {
			const response = await fetch('/api/document-statuses')
			if (response.ok) {
				const data = await response.json()
				setStatuses(data)
			}
		} catch (error) {
			logger.error('Error loading statuses:', error)
		}
	}

	const loadDocumentTypes = async () => {
		try {
			const response = await fetch('/api/document-types')
			if (response.ok) {
				const data = await response.json()
				setDocumentTypes(data)
			}
		} catch (error) {
			logger.error('Error loading document types:', error)
		}
	}

	const handleAdd = () => {
		setEditingStatus(null)
		setFormData({
			name: '',
			nameRu: '',
			nameIt: '',
			color: '#gray',
			documentTypeIds: [],
		})
		setShowModal(true)
	}

	const handleEdit = (status: DocumentStatus) => {
		setEditingStatus(status)
		setFormData({
			name: status.name,
			nameRu: status.nameRu,
			nameIt: status.nameIt,
			color: status.color,
			documentTypeIds: status.documentTypes.map(dt => dt.documentType.id),
		})
		setShowModal(true)
	}

	const handleSave = async () => {
		try {
			const url = editingStatus
				? '/api/document-statuses'
				: '/api/document-statuses'
			const method = editingStatus ? 'PUT' : 'POST'

			const response = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...(editingStatus && { id: editingStatus.id }),
					...formData,
				}),
			})

			if (response.ok) {
				await loadStatuses()
				setShowModal(false)
				alert(
					editingStatus
						? 'Статус обновлен!'
						: 'Статус создан!'
				)
			} else {
				const error = await response.json()
				alert(`Ошибка: ${error.error}`)
			}
		} catch (error) {
			logger.error('Error saving status:', error)
			alert('Ошибка сохранения')
		}
	}

	const handleDelete = async (id: number) => {
		if (!confirm('Удалить статус?')) return

		try {
			const response = await fetch(`/api/document-statuses?id=${id}`, {
				method: 'DELETE',
			})

			if (response.ok) {
				await loadStatuses()
				alert('Статус удален!')
			} else {
				const error = await response.json()
				alert(`Ошибка: ${error.error}`)
			}
		} catch (error) {
			logger.error('Error deleting status:', error)
			alert('Ошибка удаления')
		}
	}

	const toggleDocumentType = (typeId: number) => {
		setFormData(prev => ({
			...prev,
			documentTypeIds: prev.documentTypeIds.includes(typeId)
				? prev.documentTypeIds.filter(id => id !== typeId)
				: [...prev.documentTypeIds, typeId],
		}))
	}

	const getColorBadgeClass = (color: string) => {
		const colorMap: Record<string, string> = {
			'#gray': 'bg-gray-100 text-gray-700',
			'#blue': 'bg-blue-100 text-blue-700',
			'#green': 'bg-green-100 text-green-700',
			'#red': 'bg-red-100 text-red-700',
			'#orange': 'bg-orange-100 text-orange-700',
			'#purple': 'bg-purple-100 text-purple-700',
			'#yellow': 'bg-yellow-100 text-yellow-700',
		}
		return colorMap[color] || 'bg-gray-100 text-gray-700'
	}

	return (
		<Card>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<CardTitle>
						{locale === 'ru' ? 'Статусы документов' : 'Stati dei Documenti'}
					</CardTitle>
					<Button onClick={handleAdd} size='sm'>
						<Plus className='h-4 w-4 mr-2' />
						{locale === 'ru' ? 'Добавить' : 'Aggiungi'}
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>
								{locale === 'ru' ? 'Название' : 'Nome'}
							</TableHead>
							<TableHead>
								{locale === 'ru' ? 'Цвет' : 'Colore'}
							</TableHead>
							<TableHead>
								{locale === 'ru' ? 'Типы документов' : 'Tipi di Documenti'}
							</TableHead>
							<TableHead className='text-right'>
								{locale === 'ru' ? 'Действия' : 'Azioni'}
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{statuses.map(status => (
							<TableRow key={status.id}>
								<TableCell>
									<div>
										<div className='font-medium'>
											{locale === 'ru' ? status.nameRu : status.nameIt}
										</div>
										<div className='text-xs text-gray-500'>{status.name}</div>
									</div>
								</TableCell>
								<TableCell>
									<Badge className={getColorBadgeClass(status.color)}>
										{locale === 'ru' ? status.nameRu : status.nameIt}
									</Badge>
								</TableCell>
								<TableCell>
									<div className='flex flex-wrap gap-1'>
										{status.documentTypes.map(dt => (
											<Badge key={dt.id} variant='outline'>
												{locale === 'ru'
													? dt.documentType.nameRu
													: dt.documentType.nameIt}
											</Badge>
										))}
									</div>
								</TableCell>
								<TableCell className='text-right'>
									<div className='flex justify-end gap-2'>
										<Button
											variant='outline'
											size='sm'
											onClick={() => handleEdit(status)}
										>
											<Edit className='h-4 w-4' />
										</Button>
										<Button
											variant='outline'
											size='sm'
											onClick={() => handleDelete(status.id)}
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

				{/* Модальное окно */}
				<Dialog open={showModal} onOpenChange={setShowModal}>
					<DialogContent className='max-w-2xl'>
						<DialogHeader>
							<DialogTitle>
								{editingStatus
									? locale === 'ru'
										? 'Редактировать статус'
										: 'Modifica Stato'
									: locale === 'ru'
									? 'Новый статус'
									: 'Nuovo Stato'}
							</DialogTitle>
						</DialogHeader>

						<div className='space-y-4'>
							{/* Системное имя */}
							<div>
								<Label>
									{locale === 'ru' ? 'Системное имя' : 'Nome Sistema'}
								</Label>
								<Input
									value={formData.name}
									onChange={e =>
										setFormData(prev => ({ ...prev, name: e.target.value }))
									}
									placeholder='draft, sent, approved...'
								/>
							</div>

							{/* Название RU */}
							<div>
								<Label>
									{locale === 'ru' ? 'Название (RU)' : 'Nome (RU)'}
								</Label>
								<Input
									value={formData.nameRu}
									onChange={e =>
										setFormData(prev => ({ ...prev, nameRu: e.target.value }))
									}
									placeholder='Черновик, Отправлено...'
								/>
							</div>

							{/* Название IT */}
							<div>
								<Label>
									{locale === 'ru' ? 'Название (IT)' : 'Nome (IT)'}
								</Label>
								<Input
									value={formData.nameIt}
									onChange={e =>
										setFormData(prev => ({ ...prev, nameIt: e.target.value }))
									}
									placeholder='Bozza, Inviato...'
								/>
							</div>

							{/* Цвет */}
							<div>
								<Label>{locale === 'ru' ? 'Цвет' : 'Colore'}</Label>
								<Select
									value={formData.color}
									onValueChange={value =>
										setFormData(prev => ({ ...prev, color: value }))
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{COLORS.map(color => (
											<SelectItem key={color.value} value={color.value}>
												<div className='flex items-center gap-2'>
													<div
														className={`w-4 h-4 rounded ${getColorBadgeClass(
															color.value
														)}`}
													/>
													{color.label}
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Типы документов */}
							<div>
								<Label>
									{locale === 'ru'
										? 'Типы документов'
										: 'Tipi di Documenti'}
								</Label>
								<div className='flex flex-wrap gap-2 mt-2'>
									{documentTypes.map(type => (
										<Badge
											key={type.id}
											variant={
												formData.documentTypeIds.includes(type.id)
													? 'default'
													: 'outline'
											}
											className='cursor-pointer'
											onClick={() => toggleDocumentType(type.id)}
										>
											{locale === 'ru' ? type.nameRu : type.nameIt}
										</Badge>
									))}
								</div>
							</div>

							{/* Кнопки */}
							<div className='flex justify-end gap-2 pt-4'>
								<Button variant='outline' onClick={() => setShowModal(false)}>
									<X className='h-4 w-4 mr-2' />
									{locale === 'ru' ? 'Отмена' : 'Annulla'}
								</Button>
								<Button onClick={handleSave}>
									<Save className='h-4 w-4 mr-2' />
									{locale === 'ru' ? 'Сохранить' : 'Salva'}
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</CardContent>
		</Card>
	)
}

