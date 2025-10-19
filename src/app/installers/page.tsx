'use client'

import { useState, useEffect } from 'react'
import { DashboardLayoutStickerV2 } from '@/components/dashboard-layout-sticker-v2'
import { UnifiedNavV2 } from '@/components/unified-nav-v2'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Hammer } from 'lucide-react'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Search, Edit } from 'lucide-react'
import { highlightText } from '@/lib/highlight-text'
import { useSorting } from '@/hooks/use-sorting'
import { multiSearch } from '@/lib/multi-search'
import { InstallerFormModal } from '@/components/installer-form-modal'
import { useLanguage } from '@/contexts/LanguageContext'

export default function InstallersPage() {
	const { t } = useLanguage()

	const getAvailabilityBadge = (availability: string) => {
		switch (availability) {
			case 'available':
				return <Badge variant='default'>{t('availableStatus')}</Badge>
			case 'busy':
				return <Badge variant='destructive'>{t('busyStatus')}</Badge>
			case 'vacation':
				return <Badge variant='secondary'>{t('vacationStatus')}</Badge>
			default:
				return <Badge variant='outline'>{t('notSpecified')}</Badge>
		}
	}

	const [searchTerm, setSearchTerm] = useState('')
	const [isFormOpen, setIsFormOpen] = useState(false)
	const [editingInstaller, setEditingInstaller] = useState<any>(null)

	const [installers, setInstallers] = useState<any[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		fetchInstallers()
	}, [])

	const fetchInstallers = async () => {
		try {
			setIsLoading(true)
			const response = await fetch('/api/installers')
			if (response.ok) {
				setInstallers(await response.json())
			}
		} catch (error) {
			console.error('Error fetching installers:', error)
		} finally {
			setIsLoading(false)
		}
	}

	const getStatusBadge = (status: string) => {
		if (status === 'available') {
			return <Badge variant='default'>Свободен</Badge>
		}
		if (status === 'busy') {
			return <Badge variant='secondary'>Занят</Badge>
		}
		return <Badge variant='outline'>{status}</Badge>
	}

	const getRatingStars = (rating: number) => {
		return '⭐'.repeat(rating)
	}

	// Множественная фильтрация
	const filteredInstallers = multiSearch(installers, searchTerm, [
		'name',
		'contact',
		'phone',
		'email',
	])

	// Сортировка
	const { sortedItems, requestSort, getSortIcon } = useSorting(
		filteredInstallers,
		'name'
	)

	const handleSaveInstaller = async (formData: any) => {
		try {
			if (editingInstaller) {
				await fetch('/api/installers', {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ id: editingInstaller.id, ...formData }),
				})
			} else {
				await fetch('/api/installers', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(formData),
				})
			}
			await fetchInstallers()
			setEditingInstaller(null)
		} catch (error) {
			console.error('Error saving installer:', error)
			alert(t('errorSaving'))
		}
	}

	const handleEdit = (installer: any) => {
		setEditingInstaller(installer)
		setIsFormOpen(true)
	}

	const handleDelete = async (id: number) => {
		if (!confirm(t('confirmDeleteInstaller'))) return

		try {
			await fetch(`/api/installers?id=${id}`, { method: 'DELETE' })
			await fetchInstallers()
		} catch (error) {
			console.error('Error deleting installer:', error)
			alert(t('errorDeleting'))
		}
	}

	return (
		<DashboardLayoutStickerV2 hideTopNav={true}>
			<div className='space-y-4'>
				<UnifiedNavV2
					items={[
						{ id: 'clients', name: t('clients'), href: '/clients' },
						{ id: 'suppliers', name: t('suppliers'), href: '/suppliers' },
						{ id: 'partners', name: t('partners'), href: '/partners' },
						{
							id: 'installers',
							name: t('installers'),
							href: '/installers',
							icon: Hammer,
							count: installers.length,
						},
					]}
					onAddClick={() => {
						setEditingInstaller(null)
						setIsFormOpen(true)
					}}
					addButtonText={t('add')}
				/>

				<InstallerFormModal
					isOpen={isFormOpen}
					onClose={() => {
						setIsFormOpen(false)
						setEditingInstaller(null)
					}}
					onSave={handleSaveInstaller}
					initialData={editingInstaller}
				/>
				<div className='content-sticker-v2'>
					{/* Поиск */}
					<div className='mb-4'>
						<div className='relative'>
							<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
							<Input
								placeholder={t('searchInstallers')}
								value={searchTerm}
								onChange={e => setSearchTerm(e.target.value)}
								className='pl-10 bg-gray-50 border-gray-200 rounded-xl'
							/>
						</div>
					</div>

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
									onClick={() => requestSort('contact')}
								>
									<div className='flex items-center gap-1'>
										{t('contactPerson')} {getSortIcon('contact')}
									</div>
								</TableHead>
								<TableHead className='text-xs'>{t('phone')}</TableHead>
								<TableHead className='text-xs'>{t('email')}</TableHead>
								<TableHead
									className='text-xs cursor-pointer hover:bg-gray-50'
									onClick={() => requestSort('rating')}
								>
									<div className='flex items-center gap-1'>
										{t('rating')} {getSortIcon('rating')}
									</div>
								</TableHead>
								<TableHead
									className='text-xs cursor-pointer hover:bg-gray-50'
									onClick={() => requestSort('status')}
								>
									<div className='flex items-center gap-1'>
										{t('status')} {getSortIcon('status')}
									</div>
								</TableHead>
								<TableHead className='text-right text-xs'>
									{t('actions')}
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{sortedItems.map(installer => (
								<TableRow key={installer.id} className='hover:bg-gray-50'>
									<TableCell className='font-medium text-sm'>
										{highlightText(installer.name, searchTerm)}
									</TableCell>
									<TableCell className='text-sm text-gray-600'>
										{highlightText(installer.contact, searchTerm)}
									</TableCell>
									<TableCell className='text-sm text-gray-600'>
										{highlightText(installer.phone, searchTerm)}
									</TableCell>
									<TableCell className='text-sm text-gray-600'>
										{highlightText(installer.email, searchTerm)}
									</TableCell>
									<TableCell className='text-sm'>
										{getRatingStars(installer.rating)}
									</TableCell>
									<TableCell>
										<Badge
											variant={
												installer.status === 'available'
													? 'default'
													: 'secondary'
											}
											className='text-xs'
										>
											{installer.status === 'available' ? 'Доступен' : 'Занят'}
										</Badge>
									</TableCell>
									<TableCell className='text-right'>
										<div className='flex justify-end gap-2'>
											<Button
												variant='outline'
												size='sm'
												onClick={() => handleEdit(installer)}
											>
												<Edit className='h-4 w-4' />
											</Button>
											<Button
												variant='outline'
												size='sm'
												onClick={() => handleDelete(installer.id)}
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
				</div>
			</div>
		</DashboardLayoutStickerV2>
	)
}
