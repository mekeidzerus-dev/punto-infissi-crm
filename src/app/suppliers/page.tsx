'use client'

import { useState, useEffect } from 'react'
import { DashboardLayoutStickerV2 } from '@/components/dashboard-layout-sticker-v2'
import { UnifiedNavV2 } from '@/components/unified-nav-v2'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Building2 } from 'lucide-react'
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
import { SupplierFormModal } from '@/components/supplier-form-modal'
import { useLanguage } from '@/contexts/LanguageContext'

export default function SuppliersPage() {
	const { t } = useLanguage()
	const [searchTerm, setSearchTerm] = useState('')
	const [isFormOpen, setIsFormOpen] = useState(false)
	const [editingSupplier, setEditingSupplier] = useState<any>(null)

	const [suppliers, setSuppliers] = useState<any[]>([])
	const [isLoading, setIsLoading] = useState(true)

	// Загрузка поставщиков из API
	useEffect(() => {
		fetchSuppliers()
	}, [])

	const fetchSuppliers = async () => {
		try {
			setIsLoading(true)
			const response = await fetch('/api/suppliers')
			if (response.ok) {
				const data = await response.json()
				setSuppliers(data)
			}
		} catch (error) {
			console.error('Error fetching suppliers:', error)
		} finally {
			setIsLoading(false)
		}
	}

	// Множественная фильтрация
	const filteredSuppliers = multiSearch(suppliers, searchTerm, [
		'name',
		'contact',
		'phone',
		'email',
	])

	// Сортировка
	const { sortedItems, requestSort, getSortIcon } = useSorting(
		filteredSuppliers,
		'name'
	)

	const handleSaveSupplier = async (formData: any) => {
		try {
			if (editingSupplier) {
				await fetch('/api/suppliers', {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ id: editingSupplier.id, ...formData }),
				})
			} else {
				await fetch('/api/suppliers', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(formData),
				})
			}
			await fetchSuppliers()
			setEditingSupplier(null)
		} catch (error) {
			console.error('Error saving supplier:', error)
			alert(t('errorSaving'))
		}
	}

	const handleEdit = (supplier: any) => {
		setEditingSupplier(supplier)
		setIsFormOpen(true)
	}

	const handleDelete = async (id: number) => {
		if (!confirm(t('confirmDeleteSupplier'))) return

		try {
			await fetch(`/api/suppliers?id=${id}`, { method: 'DELETE' })
			await fetchSuppliers()
		} catch (error) {
			console.error('Error deleting supplier:', error)
			alert(t('errorDeleting'))
		}
	}

	return (
		<DashboardLayoutStickerV2 hideTopNav={true}>
			<div className='space-y-4'>
				<UnifiedNavV2
					items={[
						{ id: 'clients', name: t('clients'), href: '/clients' },
						{
							id: 'suppliers',
							name: t('suppliers'),
							href: '/suppliers',
							icon: Building2,
							count: suppliers.length,
						},
						{ id: 'partners', name: t('partners'), href: '/partners' },
						{ id: 'installers', name: t('installers'), href: '/installers' },
					]}
					onAddClick={() => {
						setEditingSupplier(null)
						setIsFormOpen(true)
					}}
					addButtonText={t('add')}
				/>

				<SupplierFormModal
					isOpen={isFormOpen}
					onClose={() => {
						setIsFormOpen(false)
						setEditingSupplier(null)
					}}
					onSave={handleSaveSupplier}
					initialData={editingSupplier}
				/>
				<div className='content-sticker-v2'>
					{/* Поиск */}
					<div className='mb-4'>
						<div className='relative'>
							<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
							<Input
								placeholder={t('searchSuppliers')}
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
							{sortedItems.map(supplier => (
								<TableRow key={supplier.id} className='hover:bg-gray-50'>
									<TableCell className='font-medium text-sm'>
										{highlightText(supplier.name, searchTerm)}
									</TableCell>
									<TableCell className='text-sm text-gray-600'>
										{highlightText(supplier.contact, searchTerm)}
									</TableCell>
									<TableCell className='text-sm text-gray-600'>
										{highlightText(supplier.phone, searchTerm)}
									</TableCell>
									<TableCell className='text-sm text-gray-600'>
										{highlightText(supplier.email, searchTerm)}
									</TableCell>
									<TableCell>
										<Badge
											variant={
												supplier.status === 'active' ? 'default' : 'secondary'
											}
											className='text-xs'
										>
											{supplier.status === 'active'
												? t('activeStatus')
												: t('inactiveStatus')}
										</Badge>
									</TableCell>
									<TableCell className='text-right'>
										<div className='flex justify-end gap-2'>
											<Button
												variant='outline'
												size='sm'
												onClick={() => handleEdit(supplier)}
											>
												<Edit className='h-4 w-4' />
											</Button>
											<Button
												variant='outline'
												size='sm'
												onClick={() => handleDelete(supplier.id)}
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
