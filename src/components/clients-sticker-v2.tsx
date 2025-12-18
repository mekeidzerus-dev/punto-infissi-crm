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
import { toast } from 'sonner'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import { apiClient, ApiError } from '@/lib/api-client'

interface ClientWithCount extends Client {
	name: string
	createdAt: string
	_count: {
		orders: number
	}
}

export default function ClientsStickerV2() {
	const { t, locale } = useLanguage()
	const [clients, setClients] = useState<ClientWithCount[]>([])
	const [searchTerm, setSearchTerm] = useState('')
	const [isFormOpen, setIsFormOpen] = useState(false)
	const [editingClient, setEditingClient] = useState<ClientWithCount | null>(
		null
	)
	const [isLoading, setIsLoading] = useState(true)
	const [deleteDialog, setDeleteDialog] = useState<{
		isOpen: boolean
		client: ClientWithCount | null
		isDeleting: boolean
	}>({
		isOpen: false,
		client: null,
		isDeleting: false,
	})

	// Загрузка клиентов из API
	useEffect(() => {
		// Небольшая задержка для установки сессии после редиректа
		const timer = setTimeout(() => {
			fetchClients()
		}, 100)
		return () => clearTimeout(timer)
	}, [])

	const fetchClients = async () => {
		try {
			setIsLoading(true)
			const data = await apiClient.get<any[]>('/api/clients')

			// Проверяем, что data - массив
			if (!Array.isArray(data)) {
				logger.error('Invalid response format from API:', data)
				setClients([])
				return
			}

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
			logger.info(`✅ Loaded ${transformedData.length} clients`)
		} catch (error) {
			logger.error('Error fetching clients:', error)

			// Не показываем ошибку для 401 - это нормально при первой загрузке до установки сессии
			if (error instanceof ApiError && error.status === 401) {
				return
			}

			// Не показываем ошибку для сетевых ошибок - они могут быть временными
			if (error instanceof TypeError && error.message.includes('fetch')) {
				return
			}

			toast.error(
				locale === 'ru'
					? 'Ошибка при загрузке клиентов'
					: 'Errore durante il caricamento dei clienti',
				{ duration: 4000 }
			)
		} finally {
			setIsLoading(false)
		}
	}

	const handleSaveClient = async (formData: any) => {
		try {
			if (editingClient) {
				// Редактирование
				await apiClient.put('/api/clients', {
					id: editingClient.id,
					...formData,
				})
				await fetchClients()
				setEditingClient(null)
				setIsFormOpen(false)
				toast.success(
					locale === 'ru'
						? 'Клиент успешно обновлен'
						: 'Cliente aggiornato con successo',
					{ duration: 2000 }
				)
			} else {
				// Создание
				const createdClient = await apiClient.post<any>(
					'/api/clients',
					formData
				)
				logger.info('✅ Client created:', createdClient)
				await fetchClients()
				setEditingClient(null)
				setIsFormOpen(false)
				toast.success(
					locale === 'ru'
						? 'Клиент успешно создан'
						: 'Cliente creato con successo',
					{ duration: 2000 }
				)
			}
		} catch (error) {
			logger.error('Error saving client:', error)
			if (error instanceof ApiError) {
				toast.error(
					error.message ||
						(locale === 'ru'
							? 'Ошибка при сохранении клиента'
							: 'Errore durante il salvataggio del cliente'),
					{ duration: 4000 }
				)
			} else {
				toast.error(
					locale === 'ru'
						? 'Ошибка при сохранении клиента'
						: 'Errore durante il salvataggio del cliente',
					{ duration: 4000 }
				)
			}
		}
	}

	const handleEdit = (client: Client) => {
		setEditingClient(client as ClientWithCount)
		setIsFormOpen(true)
	}

	const handleDeleteClick = (client: ClientWithCount) => {
		setDeleteDialog({
			isOpen: true,
			client,
			isDeleting: false,
		})
	}

	const handleDeleteConfirm = async () => {
		if (!deleteDialog.client) return

		setDeleteDialog(prev => ({ ...prev, isDeleting: true }))

		try {
			await apiClient.delete(`/api/clients/${deleteDialog.client.id}`)
			toast.success(
				locale === 'ru'
					? 'Клиент успешно удален'
					: 'Cliente eliminato con successo',
				{ duration: 2000 }
			)
			await fetchClients()
			setDeleteDialog({ isOpen: false, client: null, isDeleting: false })
		} catch (error) {
			logger.error('Error deleting client:', error)
			if (error instanceof ApiError) {
				toast.error(
					error.message ||
						(locale === 'ru'
							? 'Ошибка при удалении клиента'
							: "Errore durante l'eliminazione del cliente"),
					{ duration: 4000 }
				)
			} else {
				toast.error(
					locale === 'ru'
						? 'Ошибка при удалении клиента'
						: "Errore durante l'eliminazione del cliente",
					{ duration: 4000 }
				)
			}
		} finally {
			setDeleteDialog(prev => ({ ...prev, isDeleting: false }))
		}
	}

	// Множественная фильтрация (каждое слово через пробел = дополнительный фильтр)
	const filteredClients = multiSearch(
		clients as unknown as Record<string, unknown>[],
		searchTerm,
		['name', 'email', 'phone', 'company', 'address']
	) as unknown as ClientWithCount[]

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
									company:
										(editingClient as any).company || editingClient.companyName,
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
										{t('loading')}
									</TableCell>
								</TableRow>
							) : sortedItems.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={7}
										className='text-center py-8 text-gray-500'
									>
										{searchTerm ? t('nothingFound') : t('noItems')}
									</TableCell>
								</TableRow>
							) : (
								sortedItems.map((client: ClientWithCount) => (
									<TableRow
										key={String(client.id)}
										className='hover:bg-gray-50'
									>
										<TableCell className='font-medium text-sm'>
											{highlightText(String(client.name || ''), searchTerm)}
										</TableCell>
										<TableCell className='text-sm text-gray-600'>
											{client.email
												? highlightText(String(client.email), searchTerm)
												: '-'}
										</TableCell>
										<TableCell className='text-sm text-gray-600'>
											{client.phone
												? highlightText(String(client.phone), searchTerm)
												: '-'}
										</TableCell>
										<TableCell className='text-sm text-gray-600'>
											{client.companyName || (client as any).company
												? highlightText(
														String(
															client.companyName ||
																(client as any).company ||
																''
														),
														searchTerm
												  )
												: '-'}
										</TableCell>
										<TableCell>
											<Badge
												variant='secondary'
												className='bg-blue-50 text-blue-700 text-xs'
											>
												{Number((client._count as any)?.orders || 0)}
											</Badge>
										</TableCell>
										<TableCell className='text-sm text-gray-500'>
											{client.createdAt
												? new Date(String(client.createdAt)).toLocaleDateString(
														'ru-RU'
												  )
												: '-'}
										</TableCell>
										<TableCell className='text-right'>
											<div className='flex justify-end space-x-1'>
												<Button
													variant='outline'
													size='sm'
													onClick={() =>
														handleEdit(client as unknown as Client)
													}
													className='h-8 w-8 p-0'
												>
													<Edit className='h-4 w-4' />
												</Button>
												<Button
													variant='outline'
													size='sm'
													onClick={() => handleDeleteClick(client)}
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

				{/* Диалог подтверждения удаления */}
				<ConfirmDeleteDialog
					isOpen={deleteDialog.isOpen}
					onClose={() =>
						setDeleteDialog({ isOpen: false, client: null, isDeleting: false })
					}
					onConfirm={handleDeleteConfirm}
					title={locale === 'ru' ? 'Удаление клиента' : 'Eliminazione cliente'}
					itemName={deleteDialog.client?.name || ''}
					itemType={locale === 'ru' ? 'клиента' : 'cliente'}
					isLoading={deleteDialog.isDeleting}
				/>
			</div>
		</AppLayout>
	)
}
