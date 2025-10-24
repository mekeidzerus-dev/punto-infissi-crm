'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import {
	Plus,
	Edit,
	Trash2,
	Tag,
	Check,
	X,
	Circle,
	Square,
	Triangle,
} from 'lucide-react'

interface Status {
	id: number
	name: string
	color: string
	isDefault: boolean
}

const STATUS_COLORS = [
	{
		value: 'blue',
		label: 'Синий',
		icon: <Circle className='h-4 w-4 text-blue-500' />,
	},
	{
		value: 'green',
		label: 'Зелёный',
		icon: <Circle className='h-4 w-4 text-green-500' />,
	},
	{
		value: 'yellow',
		label: 'Жёлтый',
		icon: <Circle className='h-4 w-4 text-yellow-500' />,
	},
	{
		value: 'red',
		label: 'Красный',
		icon: <Circle className='h-4 w-4 text-red-500' />,
	},
	{
		value: 'purple',
		label: 'Фиолетовый',
		icon: <Circle className='h-4 w-4 text-purple-500' />,
	},
	{
		value: 'gray',
		label: 'Серый',
		icon: <Circle className='h-4 w-4 text-gray-500' />,
	},
]

export function StatusManager() {
	const [statuses, setStatuses] = useState<Status[]>([
		{ id: 1, name: 'Новый', color: 'blue', isDefault: true },
		{ id: 2, name: 'В работе', color: 'yellow', isDefault: false },
		{ id: 3, name: 'Завершён', color: 'green', isDefault: false },
		{ id: 4, name: 'Отменён', color: 'red', isDefault: false },
	])

	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [editingStatus, setEditingStatus] = useState<Status | null>(null)
	const [statusFormData, setStatusFormData] = useState({
		name: '',
		color: 'blue',
		isDefault: false,
	})

	const getColorBadgeVariant = (color: string) => {
		switch (color) {
			case 'blue':
				return 'default'
			case 'green':
				return 'secondary'
			case 'yellow':
				return 'outline'
			case 'red':
				return 'destructive'
			default:
				return 'outline'
		}
	}

	const handleAddStatus = () => {
		setEditingStatus(null)
		setStatusFormData({ name: '', color: 'blue', isDefault: false })
		setIsDialogOpen(true)
	}

	const handleEditStatus = (status: Status) => {
		setEditingStatus(status)
		setStatusFormData({
			name: status.name,
			color: status.color,
			isDefault: status.isDefault,
		})
		setIsDialogOpen(true)
	}

	const handleSaveStatus = (e: React.FormEvent) => {
		e.preventDefault()

		if (editingStatus) {
			// Редактирование
			setStatuses(prev =>
				prev.map(status =>
					status.id === editingStatus.id
						? { ...status, ...statusFormData }
						: status
				)
			)
		} else {
			// Добавление
			const newStatus: Status = {
				id: Math.max(...statuses.map(s => s.id)) + 1,
				...statusFormData,
			}
			setStatuses(prev => [...prev, newStatus])
		}

		setIsDialogOpen(false)
	}

	const handleDeleteStatus = (id: number) => {
		setStatuses(prev => prev.filter(status => status.id !== id))
	}

	return (
		<Card>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<CardTitle className='flex items-center gap-2'>
						<Tag className='h-5 w-5 text-orange-600' />
						Статусы
					</CardTitle>
					<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<DialogTrigger asChild>
							<Button onClick={handleAddStatus} size='sm'>
								<Plus className='h-4 w-4 mr-2' />
								Добавить
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>
									{editingStatus ? 'Редактировать статус' : 'Новый статус'}
								</DialogTitle>
							</DialogHeader>
							<form onSubmit={handleSaveStatus} className='space-y-4'>
								<div className='space-y-2'>
									<Label htmlFor='statusName'>Название</Label>
									<Input
										id='statusName'
										value={statusFormData.name}
										onChange={e =>
											setStatusFormData({
												...statusFormData,
												name: e.target.value,
											})
										}
										placeholder='Введите название статуса'
										required
									/>
								</div>

								<div className='space-y-2'>
									<Label>Цвет</Label>
									<Select
										value={statusFormData.color}
										onValueChange={color =>
											setStatusFormData({
												...statusFormData,
												color,
											})
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{STATUS_COLORS.map(color => (
												<SelectItem key={color.value} value={color.value}>
													<div className='flex items-center gap-2'>
														{color.icon}
														<span>{color.label}</span>
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className='flex items-center space-x-2'>
									<input
										type='checkbox'
										id='isDefault'
										checked={statusFormData.isDefault}
										onChange={e =>
											setStatusFormData({
												...statusFormData,
												isDefault: e.target.checked,
											})
										}
										className='rounded'
									/>
									<Label htmlFor='isDefault' className='text-sm'>
										Основной статус
									</Label>
								</div>

								<div className='flex justify-end gap-2'>
									<Button
										type='button'
										variant='outline'
										onClick={() => setIsDialogOpen(false)}
									>
										<X className='h-4 w-4 mr-2' />
										Отмена
									</Button>
									<Button type='submit'>
										<Check className='h-4 w-4 mr-2' />
										Сохранить
									</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>
				</div>
			</CardHeader>
			<CardContent>
				<div className='space-y-3'>
					{statuses.map(status => {
						const colorConfig = STATUS_COLORS.find(
							c => c.value === status.color
						)
						return (
							<div
								key={status.id}
								className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
							>
								<div className='flex items-center gap-3'>
									{colorConfig?.icon}
									<div>
										<div className='font-medium'>{status.name}</div>
										{status.isDefault && (
											<Badge variant='outline' className='text-xs'>
												Основной
											</Badge>
										)}
									</div>
								</div>
								<div className='flex gap-1'>
									<Button
										variant='ghost'
										size='sm'
										onClick={() => handleEditStatus(status)}
									>
										<Edit className='h-4 w-4' />
									</Button>
									<Button
										variant='ghost'
										size='sm'
										onClick={() => handleDeleteStatus(status.id)}
										className='text-red-600 hover:text-red-700'
									>
										<Trash2 className='h-4 w-4' />
									</Button>
								</div>
							</div>
						)
					})}
				</div>
			</CardContent>
		</Card>
	)
}
