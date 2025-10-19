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
import { Plus, Search, Eye, ShoppingCart, Save, X } from 'lucide-react'
import { highlightText } from '@/lib/highlight-text'
import { useSorting } from '@/hooks/use-sorting'
import { multiSearch } from '@/lib/multi-search'

interface Order {
	id: number
	orderNumber: string
	clientName: string
	status: string
	totalAmount: number
	notes?: string
	createdAt: string
	items: OrderItem[]
}

interface OrderItem {
	id: number
	productName: string
	quantity: number
	unitPrice: number
	totalPrice: number
}

export default function OrdersPage() {
	const [orders, setOrders] = useState<Order[]>([
		{
			id: 1,
			orderNumber: 'ORD-001',
			clientName: 'Иванов Иван Иванович',
			status: 'В производстве',
			totalAmount: 125000,
			notes: 'Срочный заказ',
			createdAt: '2024-01-15',
			items: [
				{
					id: 1,
					productName: 'Окно поворотное 1200x1500',
					quantity: 2,
					unitPrice: 15000,
					totalPrice: 30000,
				},
				{
					id: 2,
					productName: 'Дверь входная металлическая',
					quantity: 1,
					unitPrice: 45000,
					totalPrice: 45000,
				},
			],
		},
		{
			id: 2,
			orderNumber: 'ORD-002',
			clientName: 'Петрова Анна Сергеевна',
			status: 'Черновик',
			totalAmount: 89500,
			createdAt: '2024-01-20',
			items: [
				{
					id: 3,
					productName: 'Окно раздвижное 1800x1500',
					quantity: 1,
					unitPrice: 28000,
					totalPrice: 28000,
				},
			],
		},
		{
			id: 3,
			orderNumber: 'ORD-003',
			clientName: 'Сидоров Владимир Петрович',
			status: 'Отправлено',
			totalAmount: 234000,
			createdAt: '2024-02-01',
			items: [
				{
					id: 4,
					productName: 'Окно поворотное 1200x1500',
					quantity: 4,
					unitPrice: 15000,
					totalPrice: 60000,
				},
				{
					id: 5,
					productName: 'Дверь входная металлическая',
					quantity: 2,
					unitPrice: 45000,
					totalPrice: 90000,
				},
			],
		},
	])

	const [searchTerm, setSearchTerm] = useState('')
	const [statusFilter, setStatusFilter] = useState('all')
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
	const [formData, setFormData] = useState({
		clientName: '',
		status: 'Черновик',
		notes: '',
	})

	const statusOptions = [
		{ value: 'Черновик', label: 'Черновик', color: 'secondary' },
		{ value: 'Отправлено', label: 'Отправлено', color: 'default' },
		{ value: 'В производстве', label: 'В производстве', color: 'default' },
		{ value: 'Готово', label: 'Готово', color: 'default' },
		{ value: 'Отменен', label: 'Отменен', color: 'destructive' },
	]

	const getStatusBadgeVariant = (
		status: string
	): 'default' | 'secondary' | 'destructive' | 'outline' => {
		const option = statusOptions.find(opt => opt.value === status)
		return (
			(option?.color as 'default' | 'secondary' | 'destructive' | 'outline') ||
			'secondary'
		)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		const newOrder: Order = {
			id: Math.max(...orders.map(o => o.id)) + 1,
			orderNumber: `ORD-${String(
				Math.max(...orders.map(o => o.id)) + 1
			).padStart(3, '0')}`,
			clientName: formData.clientName,
			status: formData.status,
			totalAmount: 0,
			notes: formData.notes,
			createdAt: new Date().toISOString(),
			items: [],
		}

		setOrders([...orders, newOrder])
		setIsDialogOpen(false)
		setFormData({ clientName: '', status: 'Черновик', notes: '' })
	}

	const handleStatusChange = (orderId: number, newStatus: string) => {
		setOrders(
			orders.map(order =>
				order.id === orderId ? { ...order, status: newStatus } : order
			)
		)
	}

	// Множественная фильтрация + фильтр по статусу
	const searchFiltered = multiSearch(orders, searchTerm, [
		'orderNumber',
		'clientName',
	])

	const filteredOrders = searchFiltered.filter(order => {
		const matchesStatus =
			statusFilter === 'all' || order.status === statusFilter
		return matchesStatus
	})

	// Сортировка
	const { sortedItems, requestSort, getSortIcon } = useSorting(
		filteredOrders,
		'createdAt'
	)

	return (
		<DashboardLayoutStickerV2>
			<div className='space-y-6'>
				<div className='flex justify-between items-center'>
					<div>
						<h1 className='text-3xl font-bold text-gray-900'>Заказы</h1>
						<p className='text-gray-600'>Управление заказами клиентов</p>
					</div>

					<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<DialogTrigger asChild>
							<Button
								onClick={() => {
									setFormData({ clientName: '', status: 'Черновик', notes: '' })
								}}
								className='bg-green-600 hover:bg-green-700 text-white'
							>
								<Plus className='h-4 w-4 mr-2' />
								Новый заказ
							</Button>
						</DialogTrigger>
						<DialogContent className='sm:max-w-[425px]'>
							<DialogHeader>
								<DialogTitle>Новый заказ</DialogTitle>
								<DialogDescription>
									Создайте новый заказ для клиента
								</DialogDescription>
							</DialogHeader>
							<form onSubmit={handleSubmit} className='space-y-4'>
								<div>
									<Label htmlFor='clientName'>Клиент *</Label>
									<Input
										id='clientName'
										value={formData.clientName}
										onChange={e =>
											setFormData({ ...formData, clientName: e.target.value })
										}
										required
									/>
								</div>
								<div>
									<Label htmlFor='status'>Статус</Label>
									<Select
										value={formData.status}
										onValueChange={value =>
											setFormData({ ...formData, status: value })
										}
									>
										<SelectTrigger>
											<SelectValue placeholder='Выберите статус' />
										</SelectTrigger>
										<SelectContent>
											{statusOptions.map(status => (
												<SelectItem key={status.value} value={status.value}>
													{status.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor='notes'>Примечания</Label>
									<Textarea
										id='notes'
										value={formData.notes}
										onChange={e =>
											setFormData({ ...formData, notes: e.target.value })
										}
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
										Отмена
									</Button>
									<Button
										type='submit'
										className='bg-green-600 hover:bg-green-700 text-white'
									>
										<Save className='h-4 w-4 mr-2' />
										Создать
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
									placeholder='Поиск заказов...'
									value={searchTerm}
									onChange={e => setSearchTerm(e.target.value)}
									className='pl-10'
								/>
							</div>
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger className='w-48'>
									<SelectValue placeholder='Статус' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='all'>Все статусы</SelectItem>
									{statusOptions.map(status => (
										<SelectItem key={status.value} value={status.value}>
											{status.label}
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
										onClick={() => requestSort('orderNumber')}
									>
										<div className='flex items-center gap-1'>
											Номер заказа {getSortIcon('orderNumber')}
										</div>
									</TableHead>
									<TableHead
										className='cursor-pointer hover:bg-gray-50'
										onClick={() => requestSort('clientName')}
									>
										<div className='flex items-center gap-1'>
											Клиент {getSortIcon('clientName')}
										</div>
									</TableHead>
									<TableHead
										className='cursor-pointer hover:bg-gray-50'
										onClick={() => requestSort('status')}
									>
										<div className='flex items-center gap-1'>
											Статус {getSortIcon('status')}
										</div>
									</TableHead>
									<TableHead
										className='cursor-pointer hover:bg-gray-50'
										onClick={() => requestSort('totalAmount')}
									>
										<div className='flex items-center gap-1'>
											Сумма {getSortIcon('totalAmount')}
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
								{sortedItems.map(order => (
									<TableRow key={order.id}>
										<TableCell className='font-medium'>
											{highlightText(order.orderNumber, searchTerm)}
										</TableCell>
										<TableCell>
											{highlightText(order.clientName, searchTerm)}
										</TableCell>
										<TableCell>
											<Badge variant={getStatusBadgeVariant(order.status)}>
												{order.status}
											</Badge>
										</TableCell>
										<TableCell className='font-medium'>
											{order.totalAmount.toLocaleString('ru-RU')} ₽
										</TableCell>
										<TableCell>
											{new Date(order.createdAt).toLocaleDateString('ru-RU')}
										</TableCell>
										<TableCell className='text-right'>
											<div className='flex justify-end space-x-2'>
												<Button
													variant='outline'
													size='sm'
													onClick={() => setSelectedOrder(order)}
												>
													<Eye className='h-4 w-4' />
												</Button>
												<Select
													value={order.status}
													onValueChange={value =>
														handleStatusChange(order.id, value)
													}
												>
													<SelectTrigger className='w-32 h-8'>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														{statusOptions.map(status => (
															<SelectItem
																key={status.value}
																value={status.value}
															>
																{status.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>

						{filteredOrders.length === 0 && (
							<div className='text-center py-8 text-gray-500'>
								<ShoppingCart className='h-12 w-12 mx-auto mb-4 text-gray-300' />
								{searchTerm || statusFilter !== 'all'
									? 'Заказы не найдены'
									: 'Заказы не созданы'}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Диалог просмотра заказа */}
				<Dialog
					open={!!selectedOrder}
					onOpenChange={() => setSelectedOrder(null)}
				>
					<DialogContent className='sm:max-w-[600px]'>
						<DialogHeader>
							<DialogTitle>Заказ {selectedOrder?.orderNumber}</DialogTitle>
							<DialogDescription>
								Детальная информация о заказе
							</DialogDescription>
						</DialogHeader>
						{selectedOrder && (
							<div className='space-y-4'>
								<div>
									<Label>Клиент:</Label>
									<p className='font-medium'>{selectedOrder.clientName}</p>
								</div>
								<div>
									<Label>Статус:</Label>
									<Badge variant={getStatusBadgeVariant(selectedOrder.status)}>
										{selectedOrder.status}
									</Badge>
								</div>
								<div>
									<Label>Общая сумма:</Label>
									<p className='font-medium text-lg'>
										{selectedOrder.totalAmount.toLocaleString('ru-RU')} ₽
									</p>
								</div>
								<div>
									<Label>Позиции заказа:</Label>
									<div className='space-y-2'>
										{selectedOrder.items.map(item => (
											<div
												key={item.id}
												className='flex justify-between p-2 bg-gray-50 rounded'
											>
												<span>
													{item.productName} x{item.quantity}
												</span>
												<span>{item.totalPrice.toLocaleString('ru-RU')} ₽</span>
											</div>
										))}
									</div>
								</div>
								{selectedOrder.notes && (
									<div>
										<Label>Примечания:</Label>
										<p>{selectedOrder.notes}</p>
									</div>
								)}
							</div>
						)}
					</DialogContent>
				</Dialog>
			</div>
		</DashboardLayoutStickerV2>
	)
}
