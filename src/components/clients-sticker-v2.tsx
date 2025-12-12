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

	// #region agent log
	useEffect(() => {
		fetch('http://127.0.0.1:7242/ingest/218ca7f0-e3d7-4389-a1b6-4602048211d4', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				location: 'clients-sticker-v2.tsx:36',
				message: 'ClientsStickerV2 component mounted',
				data: {},
				timestamp: Date.now(),
				sessionId: 'debug-session',
				runId: 'run1',
				hypothesisId: 'C',
			}),
		}).catch(() => {})
	}, [])
	// #endregion

	// Загрузка клиентов из API
	useEffect(() => {
		// #region agent log
		fetch('http://127.0.0.1:7242/ingest/218ca7f0-e3d7-4389-a1b6-4602048211d4', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				location: 'clients-sticker-v2.tsx:58',
				message: 'useEffect triggered, calling fetchClients',
				data: {},
				timestamp: Date.now(),
				sessionId: 'debug-session',
				runId: 'run1',
				hypothesisId: 'C',
			}),
		}).catch(() => {})
		// #endregion
		fetchClients()
	}, [])

	const fetchClients = async () => {
		// #region agent log
		fetch('http://127.0.0.1:7242/ingest/218ca7f0-e3d7-4389-a1b6-4602048211d4', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				location: 'clients-sticker-v2.tsx:60',
				message: 'fetchClients called',
				data: {},
				timestamp: Date.now(),
				sessionId: 'debug-session',
				runId: 'run1',
				hypothesisId: 'D',
			}),
		}).catch(() => {})
		// #endregion
		try {
			setIsLoading(true)
			// #region agent log
			fetch(
				'http://127.0.0.1:7242/ingest/218ca7f0-e3d7-4389-a1b6-4602048211d4',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						location: 'clients-sticker-v2.tsx:63',
						message: 'Before fetch /api/clients',
						data: {},
						timestamp: Date.now(),
						sessionId: 'debug-session',
						runId: 'run1',
						hypothesisId: 'D',
					}),
				}
			).catch(() => {})
			// #endregion
			const response = await fetch('/api/clients')
			// #region agent log
			fetch(
				'http://127.0.0.1:7242/ingest/218ca7f0-e3d7-4389-a1b6-4602048211d4',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						location: 'clients-sticker-v2.tsx:64',
						message: 'After fetch /api/clients',
						data: {
							status: response.status,
							ok: response.ok,
							statusText: response.statusText,
						},
						timestamp: Date.now(),
						sessionId: 'debug-session',
						runId: 'run1',
						hypothesisId: 'D',
					}),
				}
			).catch(() => {})
			// #endregion
			if (response.ok) {
				const data = await response.json()
				// #region agent log
				fetch(
					'http://127.0.0.1:7242/ingest/218ca7f0-e3d7-4389-a1b6-4602048211d4',
					{
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							location: 'clients-sticker-v2.tsx:66',
							message: 'Response data received',
							data: {
								isArray: Array.isArray(data),
								dataType: typeof data,
								length: Array.isArray(data) ? data.length : 0,
							},
							timestamp: Date.now(),
							sessionId: 'debug-session',
							runId: 'run1',
							hypothesisId: 'D',
						}),
					}
				).catch(() => {})
				// #endregion
				// Проверяем, что data - массив
				if (!Array.isArray(data)) {
					// #region agent log
					fetch(
						'http://127.0.0.1:7242/ingest/218ca7f0-e3d7-4389-a1b6-4602048211d4',
						{
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								location: 'clients-sticker-v2.tsx:68',
								message: 'Invalid response format - not array',
								data: { dataType: typeof data },
								timestamp: Date.now(),
								sessionId: 'debug-session',
								runId: 'run1',
								hypothesisId: 'D',
							}),
						}
					).catch(() => {})
					// #endregion
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
				// #region agent log
				fetch(
					'http://127.0.0.1:7242/ingest/218ca7f0-e3d7-4389-a1b6-4602048211d4',
					{
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							location: 'clients-sticker-v2.tsx:82',
							message: 'Clients set successfully',
							data: { count: transformedData.length },
							timestamp: Date.now(),
							sessionId: 'debug-session',
							runId: 'run1',
							hypothesisId: 'D',
						}),
					}
				).catch(() => {})
				// #endregion
				logger.info(`✅ Loaded ${transformedData.length} clients`)
			} else {
				const errorData = await response.json().catch(() => ({}))
				// #region agent log
				fetch(
					'http://127.0.0.1:7242/ingest/218ca7f0-e3d7-4389-a1b6-4602048211d4',
					{
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							location: 'clients-sticker-v2.tsx:84',
							message: 'API error response',
							data: {
								status: response.status,
								error: errorData.error || errorData.message || 'Unknown',
							},
							timestamp: Date.now(),
							sessionId: 'debug-session',
							runId: 'run1',
							hypothesisId: 'D',
						}),
					}
				).catch(() => {})
				// #endregion
				logger.error('Error fetching clients:', {
					status: response.status,
					error: errorData.error || errorData.message || 'Unknown error',
				})
				toast.error(
					locale === 'ru'
						? 'Ошибка загрузки клиентов'
						: 'Errore nel caricamento dei clienti',
					{ duration: 4000 }
				)
			}
		} catch (error) {
			// #region agent log
			fetch(
				'http://127.0.0.1:7242/ingest/218ca7f0-e3d7-4389-a1b6-4602048211d4',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						location: 'clients-sticker-v2.tsx:96',
						message: 'fetchClients exception',
						data: {
							error: error instanceof Error ? error.message : String(error),
						},
						timestamp: Date.now(),
						sessionId: 'debug-session',
						runId: 'run1',
						hypothesisId: 'C',
					}),
				}
			).catch(() => {})
			// #endregion
			logger.error('Error fetching clients:', error)
			toast.error(
				locale === 'ru'
					? 'Ошибка при загрузке клиентов'
					: 'Errore durante il caricamento dei clienti',
				{ duration: 4000 }
			)
		} finally {
			setIsLoading(false)
			// #region agent log
			fetch(
				'http://127.0.0.1:7242/ingest/218ca7f0-e3d7-4389-a1b6-4602048211d4',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						location: 'clients-sticker-v2.tsx:104',
						message: 'fetchClients completed',
						data: { isLoading: false },
						timestamp: Date.now(),
						sessionId: 'debug-session',
						runId: 'run1',
						hypothesisId: 'D',
					}),
				}
			).catch(() => {})
			// #endregion
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
					setEditingClient(null)
					setIsFormOpen(false)
					toast.success(
						locale === 'ru'
							? 'Клиент успешно обновлен'
							: 'Cliente aggiornato con successo',
						{ duration: 2000 }
					)
				} else {
					const errorData = await response.json().catch(() => ({}))
					toast.error(
						errorData.error ||
							(locale === 'ru'
								? 'Ошибка обновления клиента'
								: 'Errore aggiornamento cliente'),
						{ duration: 4000 }
					)
				}
			} else {
				// Создание
				const response = await fetch('/api/clients', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(formData),
				})

				if (response.ok) {
					const createdClient = await response.json()
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
				} else {
					const errorData = await response.json().catch(() => ({}))
					logger.error('Error creating client:', errorData)
					toast.error(
						errorData.error ||
							(locale === 'ru'
								? 'Ошибка создания клиента'
								: 'Errore creazione cliente'),
						{ duration: 4000 }
					)
				}
			}
		} catch (error) {
			logger.error('Error saving client:', error)
			toast.error('Ошибка при сохранении клиента', { duration: 4000 })
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
			const response = await fetch(`/api/clients/${deleteDialog.client.id}`, {
				method: 'DELETE',
			})

			if (response.ok) {
				toast.success(
					locale === 'ru'
						? 'Клиент успешно удален'
						: 'Cliente eliminato con successo',
					{ duration: 2000 }
				)
				await fetchClients()
				setDeleteDialog({ isOpen: false, client: null, isDeleting: false })
			} else {
				// Обработка ошибок от API
				const errorData = await response.json().catch(() => ({}))
				const errorMessage =
					errorData.error || errorData.message || 'Не удалось удалить клиента'
				toast.error(errorMessage, { duration: 4000 })
			}
		} catch (error) {
			logger.error('Error deleting client:', error)
			toast.error('Ошибка при удалении клиента', { duration: 4000 })
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
