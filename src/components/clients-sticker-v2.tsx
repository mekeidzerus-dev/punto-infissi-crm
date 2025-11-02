'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/app-layout'
import { UnifiedNavV2 } from '@/components/unified-nav-v2'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { logger } from '@/lib/logger'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Plus, Search, Edit, Trash2, Users, ArrowUpDown } from 'lucide-react'
import { highlightText } from '@/lib/highlight-text'
import { useSorting } from '@/hooks/use-sorting'
import { multiSearch } from '@/lib/multi-search'
import { ClientFormModal } from '@/components/client-form-modal'
import { useLanguage } from '@/contexts/LanguageContext'
import type { Client } from '@/types/client'

interface ClientWithCount extends Client {
	name: string
	createdAt: string
	_count: {
		orders: number
	}
}

export default function ClientsStickerV2() {
	const { t } = useLanguage()
	const [clients, setClients] = useState<ClientWithCount[]>([])
	const [searchTerm, setSearchTerm] = useState('')
	const [isFormOpen, setIsFormOpen] = useState(false)
	const [editingClient, setEditingClient] = useState<ClientWithCount | null>(
		null
	)
	const [isLoading, setIsLoading] = useState(true)

	// Загрузка клиентов из API
	useEffect(() => {
		fetchClients()
	}, [])

	const fetchClients = async () => {
		try {
			setIsLoading(true)
			const response = await fetch('/api/clients')
			if (response.ok) {
				const data = await response.json()
				// Преобразуем данные из БД в формат компонента
				const transformedData = data.map((client: any) => ({
					...client,
					name:
						client.type === 'individual'
							? `${client.lastName} ${client.firstName}`.trim()
							: client.companyName || '',
					company: client.type === 'company' ? client.companyName : undefined,
				}))
				setClients(transformedData)
			}
		} catch (error) {
			logger.error('Error fetching clients:', error)
		} finally {
			setIsLoading(false)
		}
	}

	const handleSaveClient = async (formData: any) => {
		try {
			if (editingClient) {
				// Редактирование
				const response = await fetch('/api/clients', {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ id: editingClient.id, ...formData }),
				})

				if (response.ok) {
					await fetchClients()
				}
			} else {
				// Создание
				const response = await fetch('/api/clients', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(formData),
				})

				if (response.ok) {
					await fetchClients()
				}
			}
			setEditingClient(null)
		} catch (error) {
			logger.error('Error saving client:', error)
			alert('Ошибка при сохранении клиента')
		}
	}

	const handleEdit = (client: Client) => {
		setEditingClient(client)
		setIsFormOpen(true)
	}

	const handleDelete = async (id: number) => {
		if (!confirm('Вы уверены, что хотите удалить этого клиента?')) return

		try {
			const response = await fetch(`/api/clients?id=${id}`, {
				method: 'DELETE',
			})

			if (response.ok) {
				await fetchClients()
			}
		} catch (error) {
			logger.error('Error deleting client:', error)
			alert('Ошибка при удалении клиента')
		}
	}

	// Множественная фильтрация (каждое слово через пробел = дополнительный фильтр)
	const filteredClients = multiSearch(clients, searchTerm, [
		'name',
		'email',
		'phone',
		'company',
		'address',
	])

	// Сортировка
	const { sortedItems, requestSort, getSortIcon } = useSorting(
		filteredClients,
		'name'
	)

	return (
		<AppLayout hideTopNav={true}>
			<div className='space-y-4'>
				{/* Объединенная навигация с табами и кнопкой */}
				<UnifiedNavV2
					items={[
						{
							id: 'clients',
							name: t('clients'),
							href: '/clients',
							icon: Users,
							count: clients.length,
						},
						{ id: 'suppliers', name: t('suppliers'), href: '/suppliers' },
						{ id: 'partners', name: t('partners'), href: '/partners' },
						{ id: 'installers', name: t('installers'), href: '/installers' },
					]}
					onAddClick={() => {
						setEditingClient(null)
						setIsFormOpen(true)
					}}
					addButtonText={t('add')}
				/>

				{/* Форма создания/редактирования клиента */}
				<ClientFormModal
					isOpen={isFormOpen}
					onClose={() => {
						setIsFormOpen(false)
						setEditingClient(null)
					}}
					onSave={handleSaveClient}
					initialData={
						editingClient
							? ({
									type: editingClient.type || 'individual',
									firstName: editingClient.firstName || '',
									lastName: editingClient.lastName || '',
									companyName: editingClient.companyName || '',
									name: editingClient.name,
									email: editingClient.email,
									phone: editingClient.phone,
									company: editingClient.company,
									address: editingClient.address,
									notes: editingClient.notes || '',
							  } as any)
							: undefined
					}
				/>

				{/* Поиск и таблица клиентов */}
				<div className='content-sticker-v2'>
					{/* Поиск - компактный */}
					<div className='mb-4'>
						<div className='relative'>
							<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
							<Input
								placeholder={t('searchClients')}
								value={searchTerm}
								onChange={e => setSearchTerm(e.target.value)}
								className='pl-10 bg-gray-50 border-gray-200 rounded-xl'
							/>
						</div>
					</div>

					{/* Таблица с сортировкой */}
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead
									className='text-xs cursor-pointer hover:bg-gray-50'
									onClick={() => requestSort('name')}
								>
									<div className='flex items-center gap-1'>
										{t('name')} {getSortIcon('name')}
									</div>
								</TableHead>
								<TableHead
									className='text-xs cursor-pointer hover:bg-gray-50'
									onClick={() => requestSort('email' as keyof Client)}
								>
									<div className='flex items-center gap-1'>
										{t('email')} {getSortIcon('email' as keyof Client)}
									</div>
								</TableHead>
								<TableHead
									className='text-xs cursor-pointer hover:bg-gray-50'
									onClick={() => requestSort('phone' as keyof Client)}
								>
									<div className='flex items-center gap-1'>
										{t('phone')} {getSortIcon('phone' as keyof Client)}
									</div>
								</TableHead>
								<TableHead
									className='text-xs cursor-pointer hover:bg-gray-50'
									onClick={() => requestSort('company' as keyof Client)}
								>
									<div className='flex items-center gap-1'>
										{t('company')} {getSortIcon('company' as keyof Client)}
									</div>
								</TableHead>
								<TableHead className='text-xs'>{t('ordersCount')}</TableHead>
								<TableHead
									className='text-xs cursor-pointer hover:bg-gray-50'
									onClick={() => requestSort('createdAt')}
								>
									<div className='flex items-center gap-1'>
										{t('date')} {getSortIcon('createdAt')}
									</div>
								</TableHead>
								<TableHead className='text-right text-xs'>
									{t('actions')}
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell
										colSpan={7}
										className='text-center py-8 text-gray-500'
									>
										Загрузка...
									</TableCell>
								</TableRow>
							) : sortedItems.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={7}
										className='text-center py-8 text-gray-500'
									>
										{searchTerm
											? 'Ничего не найдено'
											: 'Нет клиентов. Добавьте первого клиента.'}
									</TableCell>
								</TableRow>
							) : (
								sortedItems.map(client => (
									<TableRow key={client.id} className='hover:bg-gray-50'>
										<TableCell className='font-medium text-sm'>
											{highlightText(client.name, searchTerm)}
										</TableCell>
										<TableCell className='text-sm text-gray-600'>
											{client.email
												? highlightText(client.email, searchTerm)
												: '-'}
										</TableCell>
										<TableCell className='text-sm text-gray-600'>
											{client.phone
												? highlightText(client.phone, searchTerm)
												: '-'}
										</TableCell>
										<TableCell className='text-sm text-gray-600'>
											{client.company
												? highlightText(client.company, searchTerm)
												: '-'}
										</TableCell>
										<TableCell>
											<Badge
												variant='secondary'
												className='bg-blue-50 text-blue-700 text-xs'
											>
												{client._count.orders}
											</Badge>
										</TableCell>
										<TableCell className='text-sm text-gray-500'>
											{new Date(client.createdAt).toLocaleDateString('ru-RU')}
										</TableCell>
										<TableCell className='text-right'>
											<div className='flex justify-end space-x-1'>
												<Button
													variant='outline'
													size='sm'
													onClick={() => handleEdit(client)}
													className='h-8 w-8 p-0'
												>
													<Edit className='h-4 w-4' />
												</Button>
												<Button
													variant='outline'
													size='sm'
													onClick={() => handleDelete(client.id)}
													className='h-8 w-8 p-0 text-red-600 hover:bg-red-50'
												>
													<Trash2 className='h-4 w-4' />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</div>
		</AppLayout>
	)
}
