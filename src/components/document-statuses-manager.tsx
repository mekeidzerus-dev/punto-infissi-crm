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
import { Plus, Edit, Trash2, Save, X, GripVertical, Star } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/contexts/LanguageContext'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from '@dnd-kit/core'
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface DocumentStatus {
	id: number
	name: string
	nameRu: string
	nameIt: string
	color: string
	isActive: boolean
	documentTypes: Array<{
		id: number
		order: number
		isDefault?: boolean
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
	{ value: '#9ca3af', label: 'Серый / Grigio' },
	{ value: '#3b82f6', label: 'Синий / Blu' },
	{ value: '#22c55e', label: 'Зеленый / Verde' },
	{ value: '#ef4444', label: 'Красный / Rosso' },
	{ value: '#f97316', label: 'Оранжевый / Arancione' },
	{ value: '#a855f7', label: 'Фиолетовый / Viola' },
	{ value: '#eab308', label: 'Желтый / Giallo' },
	{ value: '#6366f1', label: 'Индиго / Indaco' },
	{ value: '#f59e0b', label: 'Янтарный / Ambra' },
	{ value: '#10b981', label: 'Изумрудный / Smeraldo' },
	{ value: '#0ea5e9', label: 'Небесный / Cielo' },
	{ value: '#d946ef', label: 'Фуксия / Fucsia' },
	{ value: '#06b6d4', label: 'Бирюзовый / Turchese' },
	{ value: '#84cc16', label: 'Лайм / Lime' },
	{ value: '#ec4899', label: 'Розовый / Rosa' },
	{ value: '#8b5cf6', label: 'Сиреневый / Lilla' },
	{ value: '#6b7280', label: 'Темно-серый / Grigio Scuro' },
	{ value: '#14b8a6', label: 'Мятный / Menta' },
	{ value: '#64748b', label: 'Сланцевый / Ardesia' },
	{ value: '#0891b2', label: 'Кобальтовый / Cobalto' },
	{ value: '#dc2626', label: 'Красный темный / Rosso Scuro' },
	{ value: '#059669', label: 'Зеленый темный / Verde Scuro' },
	{ value: '#2563eb', label: 'Синий темный / Blu Scuro' },
	{ value: '#7c3aed', label: 'Фиолетовый темный / Viola Scuro' },
	{ value: '#fbbf24', label: 'Золотой / Oro' },
	{ value: '#f87171', label: 'Коралловый / Corallo' },
]

// Компонент для сортируемой строки статуса
interface SortableStatusRowProps {
	item: {
		status: DocumentStatus
		statusTypeId: number
		order: number
		isDefault?: boolean
	}
	documentTypeId: number
	locale: string
	onEdit: (status: DocumentStatus) => void
	onDelete: (id: number) => void
	onSetDefault: (statusId: number, documentTypeId: number, isDefault: boolean) => Promise<void>
	getColorStyles: (color: string) => {
		backgroundColor: string
		color: string
		borderColor: string
	}
}

function SortableStatusRow({
	item,
	documentTypeId,
	locale,
	onEdit,
	onDelete,
	onSetDefault,
	getColorStyles,
}: SortableStatusRowProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: item.statusTypeId })

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	}

	return (
		<TableRow ref={setNodeRef} style={style}>
			<TableCell>
				<div
					{...attributes}
					{...listeners}
					className='cursor-grab active:cursor-grabbing hover:bg-gray-100 p-2 rounded flex items-center justify-center'
				>
					<GripVertical className='h-5 w-5 text-gray-400' />
				</div>
			</TableCell>
			<TableCell>
				<div>
					<div className='font-medium'>
						{locale === 'ru' ? item.status.nameRu : item.status.nameIt}
					</div>
					<div className='text-xs text-gray-500'>{item.status.name}</div>
				</div>
			</TableCell>
			<TableCell>
				<div className='flex items-center gap-2'>
					<Badge style={getColorStyles(item.status.color)} className='border'>
						{locale === 'ru' ? item.status.nameRu : item.status.nameIt}
					</Badge>
					{item.isDefault && (
						<Badge
							variant='secondary'
							className='bg-green-100 text-green-700 border-green-300 text-xs'
						>
							<Star className='h-3 w-3 mr-1 text-green-600' />
							{locale === 'ru' ? 'Основной' : 'Principale'}
						</Badge>
					)}
				</div>
			</TableCell>
			<TableCell className='text-right'>
				<div className='flex justify-end gap-2'>
					<Button
						variant='outline'
						size='sm'
						onClick={() => onSetDefault(item.status.id, documentTypeId, !item.isDefault)}
						className={item.isDefault ? 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200' : ''}
						title={item.isDefault 
							? (locale === 'ru' ? 'Снять пометку "Основной"' : 'Rimuovi "Principale"')
							: (locale === 'ru' ? 'Установить как основной' : 'Imposta come principale')
						}
					>
						<Star className={`h-4 w-4 ${item.isDefault ? 'fill-gray-600 text-gray-600' : 'text-gray-400'}`} />
					</Button>
					<Button
						variant='outline'
						size='sm'
						onClick={() => onEdit(item.status)}
					>
						<Edit className='h-4 w-4' />
					</Button>
					<Button
						variant='outline'
						size='sm'
						onClick={() => onDelete(item.status.id)}
						className='text-red-600 hover:bg-red-50'
					>
						<Trash2 className='h-4 w-4' />
					</Button>
				</div>
			</TableCell>
		</TableRow>
	)
}

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
	const [sortedStatuses, setSortedStatuses] = useState<
		Record<
			number,
			Array<{ status: DocumentStatus; statusTypeId: number; order: number; isDefault: boolean }>
		>
	>({})
	const [isReordering, setIsReordering] = useState(false)

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	)

	useEffect(() => {
		loadDocumentTypes()
	}, [])

	// Загружаем статусы после загрузки типов документов
	useEffect(() => {
		if (documentTypes.length > 0) {
			loadStatuses()
		}
	}, [documentTypes])

	const loadStatuses = async () => {
		try {
			const response = await fetch('/api/document-statuses')
			if (response.ok) {
				const data = await response.json()
				const statusesWithOrder = data.map((status: DocumentStatus) => ({
					...status,
					documentTypes: status.documentTypes.map((dt: any) => ({
						...dt,
						order: dt.order || 0,
						isDefault: dt.isDefault || false,
					})),
				}))
				setStatuses(statusesWithOrder)

				// Обновляем отсортированные списки для каждого типа документа
				const newSorted: Record<
					number,
					Array<{ status: DocumentStatus; statusTypeId: number; order: number; isDefault: boolean }>
				> = {}
				documentTypes.forEach(docType => {
					const typeStatuses: Array<{ status: DocumentStatus; statusTypeId: number; order: number; isDefault: boolean }> = statusesWithOrder
						.filter((status: DocumentStatus) =>
							status.documentTypes.some(
								(dt: any) => dt.documentType.id === docType.id
							)
						)
						.map((status: DocumentStatus) => {
							const dt = status.documentTypes.find(
								(dt: any) => dt.documentType.id === docType.id
							)
							return {
								status,
								statusTypeId: dt?.id || 0,
								order: dt?.order || 0,
								isDefault: dt?.isDefault || false,
							}
						})
						.filter(
							(item: {
								status: DocumentStatus
								statusTypeId: number
								order: number
								isDefault: boolean
							}) => item.statusTypeId !== 0
						)
						.sort((a: { order: number }, b: { order: number }) => {
							// Сортируем только по order, без перемещения основного статуса
							return a.order - b.order
						})
					newSorted[docType.id] = typeStatuses
				})
				setSortedStatuses(newSorted)
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
				if (documentTypes.length > 0) {
					await loadStatuses()
				}
				setShowModal(false)
				setEditingStatus(null)
				alert(
					locale === 'ru'
						? editingStatus
							? 'Статус обновлен!'
							: 'Статус создан!'
						: editingStatus
						? 'Stato aggiornato!'
						: 'Stato creato!'
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
		if (!confirm(locale === 'ru' ? 'Удалить статус?' : 'Eliminare lo stato?'))
			return

		try {
			const response = await fetch(`/api/document-statuses?id=${id}`, {
				method: 'DELETE',
			})

			if (response.ok) {
				if (documentTypes.length > 0) {
					await loadStatuses()
				}
				alert(locale === 'ru' ? 'Статус удален!' : 'Stato eliminato!')
			} else {
				const error = await response.json()
				alert(`Ошибка: ${error.error}`)
			}
		} catch (error) {
			logger.error('Error deleting status:', error)
			alert('Ошибка удаления')
		}
	}

	const handleSetDefault = async (
		statusId: number,
		documentTypeId: number,
		isDefault: boolean
	) => {
		try {
			const response = await fetch(
				`/api/document-statuses/${statusId}/set-default`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						documentTypeId,
						isDefault,
					}),
				}
			)

			if (response.ok) {
				if (documentTypes.length > 0) {
					await loadStatuses()
				}
				toast.success(
					locale === 'ru'
						? isDefault
							? 'Статус установлен как основной'
							: 'Пометка "Основной" снята'
						: isDefault
						? 'Stato impostato come principale'
						: 'Etichetta "Principale" rimossa',
					{
						duration: 2000,
					}
				)
			} else {
				const error = await response.json()
				toast.error(
					locale === 'ru'
						? `Ошибка: ${error.error || error.details}`
						: `Errore: ${error.error || error.details}`,
					{
						duration: 3000,
					}
				)
			}
		} catch (error) {
			logger.error('Error setting default status:', error)
			toast.error(
				locale === 'ru' ? 'Ошибка установки статуса' : 'Errore impostazione stato',
				{
					duration: 3000,
				}
			)
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

	const getColorStyles = (color: string) => {
		// Просто возвращаем инлайн-стили для любого цвета
		const hexOpacity = '33' // 20% прозрачности в HEX
		return {
			backgroundColor: `${color}${hexOpacity}`,
			color: color,
			borderColor: color,
		}
	}

	const handleDragEnd = (
		event: DragEndEvent,
		typeStatuses: Array<{
			status: DocumentStatus
			statusTypeId: number
			order: number
			isDefault: boolean
		}>,
		docTypeId: number
	) => {
		const { active, over } = event

		if (!over || active.id === over.id || isReordering) return

		const oldIndex = typeStatuses.findIndex(
			item => item.statusTypeId === active.id
		)
		const newIndex = typeStatuses.findIndex(
			item => item.statusTypeId === over.id
		)

		if (oldIndex === -1 || newIndex === -1) return

		// Вычисляем новые order для всех элементов
		const reordered = arrayMove(typeStatuses, oldIndex, newIndex).map(
			(item, index) => ({
				...item,
				order: index,
			})
		)

		// Валидация данных
		if (reordered.length === 0) return

		// Сохраняем предыдущее состояние для отката (deep copy)
		const previousState = JSON.parse(JSON.stringify(sortedStatuses))

		// Оптимистично обновляем локальное состояние сразу
		setSortedStatuses(prev => ({
			...prev,
			[docTypeId]: reordered,
		}))

		// Подготавливаем данные для batch update
		const items = reordered.map(item => ({
			id: item.statusTypeId,
			order: item.order,
		}))

		// Валидация перед отправкой
		if (items.some(item => !item.id || item.order < 0)) {
			setSortedStatuses(previousState)
			logger.error('Invalid reorder data:', items)
			return
		}

		setIsReordering(true)

		// Обновляем порядок на сервере
		fetch('/api/document-status-types/reorder', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ items, documentTypeId: docTypeId }),
		})
			.then(response => {
				if (!response.ok) {
					throw new Error('Failed to reorder')
				}
			})
			.catch(error => {
				logger.error('Error reordering statuses:', error)
				// Откатываем изменения при ошибке
				setSortedStatuses(previousState)
				alert(
					locale === 'ru' ? 'Ошибка изменения порядка' : 'Errore nel riordinare'
				)
			})
			.finally(() => {
				setIsReordering(false)
			})
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
				<div className='space-y-6'>
					{documentTypes.map(docType => {
						// Используем отсортированный список из состояния или вычисляем из statuses
						const typeStatuses =
							sortedStatuses[docType.id] ||
							statuses
								.filter(status =>
									status.documentTypes.some(
										dt => dt.documentType.id === docType.id
									)
								)
								.map(status => {
									const dt = status.documentTypes.find(
										dt => dt.documentType.id === docType.id
									)
									const statusTypeId = dt?.id
									return {
										status,
										statusTypeId: statusTypeId || 0,
										order: dt?.order || 0,
									}
								})
								.filter(item => item.statusTypeId !== 0)
								.sort((a, b) => a.order - b.order)

						if (typeStatuses.length === 0) return null

						return (
							<DndContext
								key={docType.id}
								sensors={sensors}
								collisionDetection={closestCenter}
								onDragEnd={event =>
									handleDragEnd(event, typeStatuses, docType.id)
								}
							>
								<div className='space-y-2'>
									<h3 className='text-sm font-semibold text-gray-700'>
										{locale === 'ru' ? docType.nameRu : docType.nameIt}
									</h3>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead className='w-12'>
													{locale === 'ru' ? 'Порядок' : 'Ordine'}
												</TableHead>
												<TableHead>
													{locale === 'ru' ? 'Название' : 'Nome'}
												</TableHead>
												<TableHead>
													{locale === 'ru' ? 'Цвет' : 'Colore'}
												</TableHead>
												<TableHead className='text-right'>
													{locale === 'ru' ? 'Действия' : 'Azioni'}
												</TableHead>
											</TableRow>
										</TableHeader>
										<SortableContext
											items={typeStatuses.map(item => item.statusTypeId)}
											strategy={verticalListSortingStrategy}
										>
											<TableBody>
												{typeStatuses.map(item => (
													<SortableStatusRow
														key={item.statusTypeId}
														item={item}
														documentTypeId={docType.id}
														locale={locale}
														onEdit={handleEdit}
														onDelete={handleDelete}
														onSetDefault={handleSetDefault}
														getColorStyles={getColorStyles}
													/>
												))}
											</TableBody>
										</SortableContext>
									</Table>
								</div>
							</DndContext>
						)
					})}
				</div>

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
								<Label>{locale === 'ru' ? 'Название (RU)' : 'Nome (RU)'}</Label>
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
								<Label>{locale === 'ru' ? 'Название (IT)' : 'Nome (IT)'}</Label>
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
														className='w-4 h-4 rounded border'
														style={getColorStyles(color.value)}
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
									{locale === 'ru' ? 'Типы документов' : 'Tipi di Documenti'}
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
