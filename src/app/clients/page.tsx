'use client'

import ClientsStickerV2 from '@/components/clients-sticker-v2'

export default function ClientsPage() {
	return <ClientsStickerV2 />
}

// Старый код (не используется)
/*
import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
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
import { Plus, Search, Edit, Trash2 } from 'lucide-react'

interface Client {
	id: number
	name: string
	email?: string
	phone?: string
	company?: string
	address?: string
	createdAt: string
	_count: {
		orders: number
	}
}

export default function ClientsPage() {
	const designVersion = DESIGN_CONFIG.getDesignVersion()

	// Если выбран стикер-дизайн v2, используем специальный компонент
	if (designVersion === 'sticker-v2') {
		return <ClientsStickerV2 />
	}

	const [clients, setClients] = useState<Client[]>([
		{
			id: 1,
			name: 'Иванов Иван Иванович',
			email: 'ivanov@example.com',
			phone: '+7 (999) 123-45-67',
			company: 'ООО СтройИнвест',
			address: 'г. Москва, ул. Строителей, д. 1',
			createdAt: '2024-01-15',
			_count: { orders: 3 },
		},
		{
			id: 2,
			name: 'Петрова Анна Сергеевна',
			email: 'petrova@example.com',
			phone: '+7 (999) 234-56-78',
			company: 'ИП Петрова',
			address: 'г. Санкт-Петербург, пр. Невский, д. 100',
			createdAt: '2024-01-20',
			_count: { orders: 1 },
		},
		{
			id: 3,
			name: 'Сидоров Владимир Петрович',
			email: 'sidorov@example.com',
			phone: '+7 (999) 345-67-89',
			company: 'ООО Сидоров и Ко',
			address: 'г. Казань, ул. Баумана, д. 50',
			createdAt: '2024-02-01',
			_count: { orders: 2 },
		},
	])

	const [searchTerm, setSearchTerm] = useState('')
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [editingClient, setEditingClient] = useState<Client | null>(null)
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		phone: '',
		company: '',
		address: '',
	})

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (editingClient) {
			// Обновление существующего клиента
			setClients(
				clients.map(client =>
					client.id === editingClient.id ? { ...client, ...formData } : client
				)
			)
		} else {
			// Добавление нового клиента
			const newClient: Client = {
				id: Math.max(...clients.map(c => c.id)) + 1,
				...formData,
				createdAt: new Date().toISOString(),
				_count: { orders: 0 },
			}
			setClients([...clients, newClient])
		}

		setIsDialogOpen(false)
		setEditingClient(null)
		setFormData({ name: '', email: '', phone: '', company: '', address: '' })
	}

	const handleEdit = (client: Client) => {
		setEditingClient(client)
		setFormData({
			name: client.name,
			email: client.email || '',
			phone: client.phone || '',
			company: client.company || '',
			address: client.address || '',
		})
		setIsDialogOpen(true)
	}

	const handleDelete = async (id: number) => {
		if (!confirm('Вы уверены, что хотите удалить этого клиента?')) return
		setClients(clients.filter(client => client.id !== id))
	}

	const filteredClients = clients.filter(
		client =>
			client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			client.company?.toLowerCase().includes(searchTerm.toLowerCase())
	)

	return (
		<DashboardLayout>
			<div className='space-y-6'>
				<div className='flex justify-between items-center'>
					<div>
						<h1 className='text-3xl font-bold text-gray-900'>Клиенты</h1>
						<p className='text-gray-600'>Управление базой клиентов</p>
					</div>

					<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<DialogTrigger asChild>
							<Button
								onClick={() => {
									setEditingClient(null)
									setFormData({
										name: '',
										email: '',
										phone: '',
										company: '',
										address: '',
									})
								}}
							>
								<Plus className='h-4 w-4 mr-2' />
								Добавить клиента
							</Button>
						</DialogTrigger>
						<DialogContent className='sm:max-w-[425px]'>
							<DialogHeader>
								<DialogTitle>
									{editingClient ? 'Редактировать клиента' : 'Новый клиент'}
								</DialogTitle>
								<DialogDescription>
									{editingClient
										? 'Внесите изменения в данные клиента'
										: 'Заполните информацию о новом клиенте'}
								</DialogDescription>
							</DialogHeader>
							<form onSubmit={handleSubmit} className='space-y-4'>
								<div>
									<Label htmlFor='name'>Имя *</Label>
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
									<Label htmlFor='email'>Email</Label>
									<Input
										id='email'
										type='email'
										value={formData.email}
										onChange={e =>
											setFormData({ ...formData, email: e.target.value })
										}
									/>
								</div>
								<div>
									<Label htmlFor='phone'>Телефон</Label>
									<Input
										id='phone'
										value={formData.phone}
										onChange={e =>
											setFormData({ ...formData, phone: e.target.value })
										}
									/>
								</div>
								<div>
									<Label htmlFor='company'>Компания</Label>
									<Input
										id='company'
										value={formData.company}
										onChange={e =>
											setFormData({ ...formData, company: e.target.value })
										}
									/>
								</div>
								<div>
									<Label htmlFor='address'>Адрес</Label>
									<Textarea
										id='address'
										value={formData.address}
										onChange={e =>
											setFormData({ ...formData, address: e.target.value })
										}
									/>
								</div>
								<div className='flex justify-end space-x-2'>
									<Button
										type='button'
										variant='outline'
										onClick={() => setIsDialogOpen(false)}
									>
										Отмена
									</Button>
									<Button type='submit'>
										{editingClient ? 'Сохранить' : 'Создать'}
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
									placeholder='Поиск клиентов...'
									value={searchTerm}
									onChange={e => setSearchTerm(e.target.value)}
									className='pl-10'
								/>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Имя</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Телефон</TableHead>
									<TableHead>Компания</TableHead>
									<TableHead>Заказы</TableHead>
									<TableHead>Дата создания</TableHead>
									<TableHead className='text-right'>Действия</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredClients.map(client => (
									<TableRow key={client.id}>
										<TableCell className='font-medium'>{client.name}</TableCell>
										<TableCell>{client.email || '-'}</TableCell>
										<TableCell>{client.phone || '-'}</TableCell>
										<TableCell>{client.company || '-'}</TableCell>
										<TableCell>
											<Badge variant='secondary'>{client._count.orders}</Badge>
										</TableCell>
										<TableCell>
											{new Date(client.createdAt).toLocaleDateString('ru-RU')}
										</TableCell>
										<TableCell className='text-right'>
											<div className='flex justify-end space-x-2'>
												<Button
													variant='outline'
													size='sm'
													onClick={() => handleEdit(client)}
												>
													<Edit className='h-4 w-4' />
												</Button>
												<Button
													variant='outline'
													size='sm'
													onClick={() => handleDelete(client.id)}
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

						{filteredClients.length === 0 && (
							<div className='text-center py-8 text-gray-500'>
								{searchTerm ? 'Клиенты не найдены' : 'Клиенты не добавлены'}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</DashboardLayout>
	)
}
*/
