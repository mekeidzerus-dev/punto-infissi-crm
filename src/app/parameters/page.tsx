'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Edit, Trash2, Settings, Tag, Tags } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { UnifiedNavV2 } from '@/components/unified-nav-v2'
import { AppLayout } from '@/components/app-layout'
import ParameterEditForm from '@/components/parameter-edit-form'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

interface ParameterValue {
	id?: string
	value: string
	valueIt: string
	displayName?: string
	hexColor?: string
	ralCode?: string
	icon?: string
	order: number
	isActive: boolean
}

interface Parameter {
	id: string
	name: string
	nameIt?: string
	type: 'TEXT' | 'NUMBER' | 'SELECT' | 'COLOR' | 'BOOLEAN'
	description?: string
	unit?: string
	minValue?: number
	maxValue?: number
	step?: number
	values?: ParameterValue[]
	isGlobal?: boolean
	_count?: {
		categoryParameters: number
		supplierOverrides: number
	}
}

export default function ParametersPage() {
	const { t, locale } = useLanguage()
	const [parameters, setParameters] = useState<Parameter[]>([])
	const [loading, setLoading] = useState(true)
	const [searchTerm, setSearchTerm] = useState('')
	const [showForm, setShowForm] = useState(false)
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)
	const [parameterToDelete, setParameterToDelete] = useState<Parameter | null>(
		null
	)
	const [editingParameter, setEditingParameter] = useState<Parameter | null>(
		null
	)
	const [isDeleting, setIsDeleting] = useState(false)

	const fetchParameters = async () => {
		setLoading(true)
		try {
			const response = await fetch('/api/parameters')
			if (response.ok) {
				const data = await response.json()
				setParameters(data)
			} else {
				logger.error('Failed to fetch parameters:', response.status)
			}
		} catch (error) {
			logger.error('Error fetching parameters:', error)
		} finally {
			setLoading(false)
		}
	}

	// Принудительное обновление списка
	const refreshParameters = async () => {
		await fetchParameters()
	}

	useEffect(() => {
		fetchParameters()
	}, [])

	const handleAddParameter = () => {
		setEditingParameter(null)
		setShowForm(true)
	}

	const handleEdit = (parameter: Parameter) => {
		setEditingParameter(parameter)
		setShowForm(true)
	}

	const handleDelete = async () => {
		if (!parameterToDelete) return

		setIsDeleting(true)
		try {
			const response = await fetch(`/api/parameters/${parameterToDelete.id}`, {
				method: 'DELETE',
			})

			if (response.ok) {
				// Успешное удаление
				setParameters(prev => prev.filter(p => p.id !== parameterToDelete.id))
				toast.success(
					locale === 'ru' ? 'Параметр удален' : 'Parametro eliminato'
				)
				setShowDeleteDialog(false)
				setParameterToDelete(null)
			} else if (response.status === 404) {
				// Параметр уже не существует - обновляем список
				setParameters(prev => prev.filter(p => p.id !== parameterToDelete.id))
				toast.success(
					locale === 'ru' ? 'Параметр удален' : 'Parametro eliminato'
				)
				setShowDeleteDialog(false)
				setParameterToDelete(null)
			} else {
				// Другие ошибки
				const errorData = await response.json()
				toast.error(
					errorData.error ||
						(locale === 'ru' ? 'Ошибка удаления' : 'Errore di eliminazione')
				)
			}
		} catch (error) {
			logger.error('Error deleting parameter:', error)
			toast.error(
				locale === 'ru'
					? 'Ошибка при удалении параметра'
					: "Errore durante l'eliminazione del parametro"
			)
		} finally {
			setIsDeleting(false)
		}
	}

	const handleSave = async (data: Record<string, unknown>) => {
		try {
			const url = editingParameter
				? `/api/parameters/${editingParameter.id}`
				: '/api/parameters'
			const method = editingParameter ? 'PUT' : 'POST'

			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			})

			if (response.ok) {
				// Обновляем список параметров после успешного сохранения
				await fetchParameters()
				setShowForm(false)
				setEditingParameter(null)
				toast.success(
					editingParameter
						? locale === 'ru'
							? 'Параметр обновлен'
							: 'Parametro aggiornato'
						: locale === 'ru'
						? 'Параметр создан'
						: 'Parametro creato'
				)
			} else {
				toast.error(
					locale === 'ru' ? 'Ошибка сохранения' : 'Errore di salvataggio'
				)
			}
		} catch (error) {
			logger.error('Error saving parameter:', error)
			toast.error(
				locale === 'ru'
					? 'Ошибка при сохранении параметра'
					: 'Errore durante il salvataggio del parametro'
			)
		}
	}

	const filteredParameters = parameters.filter(parameter => {
		const searchLower = searchTerm.toLowerCase()
		const currentName =
			locale === 'ru' ? parameter.name : parameter.nameIt || parameter.name
		return currentName.toLowerCase().includes(searchLower)
	})

	const navItems = [
		{
			id: 'categories',
			name: locale === 'ru' ? 'Категории' : 'Categorie',
			href: '/categories',
			icon: Tags, // Используем Tags как в левом меню
		},
		{
			id: 'parameters',
			name: locale === 'ru' ? 'Параметры' : 'Parametri',
			href: '/parameters',
			icon: Settings,
		},
	]

	if (loading) {
		return (
			<AppLayout>
				<div className='flex items-center justify-center h-64'>
					<div className='text-gray-500'>
						{locale === 'ru' ? 'Загрузка...' : 'Caricamento...'}
					</div>
				</div>
			</AppLayout>
		)
	}

	return (
		<AppLayout>
			<div className='space-y-6'>
				{/* Навигация */}
				<UnifiedNavV2
					items={navItems}
					onAddClick={handleAddParameter}
					addButtonText={locale === 'ru' ? 'Новый параметр' : 'Nuovo parametro'}
				/>

				{/* Поиск */}
				<Card className='p-4'>
					<div className='flex items-center space-x-4'>
						<div className='flex-1'>
							<Input
								placeholder={
									locale === 'ru' ? 'Поиск параметров...' : 'Cerca parametri...'
								}
								value={searchTerm}
								onChange={e => setSearchTerm(e.target.value)}
							/>
						</div>
					</div>
				</Card>

				{/* Список параметров */}
				<Card className='p-6'>
					{filteredParameters.length === 0 ? (
						<div className='text-center py-8'>
							<Settings className='w-12 h-12 text-gray-400 mx-auto mb-4' />
							<div className='text-gray-500 mb-4'>
								{searchTerm
									? locale === 'ru'
										? 'Параметры не найдены'
										: 'Parametri non trovati'
									: locale === 'ru'
									? 'Нет параметров'
									: 'Nessun parametro'}
							</div>
						</div>
					) : (
						<div className='overflow-x-auto'>
							<table className='w-full'>
								<thead>
									<tr className='border-b'>
										<th className='text-left p-4 text-gray-700'>
											{locale === 'ru' ? 'Название' : 'Nome'}
										</th>
										<th className='text-left p-4 text-gray-700'>
											{locale === 'ru' ? 'Тип' : 'Tipo'}
										</th>
										<th className='text-left p-4 text-gray-700'>
											{locale === 'ru'
												? 'Количество значений'
												: 'Numero valori'}
										</th>
										<th className='text-left p-4 text-gray-700'>
											{locale === 'ru' ? 'Использование' : 'Utilizzo'}
										</th>
										<th className='text-left p-4 text-gray-700'>
											{locale === 'ru' ? 'Действия' : 'Azioni'}
										</th>
									</tr>
								</thead>
								<tbody>
									{filteredParameters.map(parameter => (
										<tr
											key={parameter.id}
											className='border-b hover:bg-gray-50'
										>
											<td className='p-4'>
												<div className='font-medium text-gray-900'>
													{locale === 'ru'
														? parameter.name
														: parameter.nameIt || parameter.name}
												</div>
												{parameter.isGlobal && (
													<span className='px-2 py-1 bg-green-100 text-green-700 text-xs rounded mt-1 inline-block'>
														{locale === 'ru' ? 'Глобальный' : 'Globale'}
													</span>
												)}
											</td>
											<td className='p-4'>
												<span className='px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded'>
													{parameter.type}
												</span>
											</td>
											<td className='p-4'>
												<div className='text-sm text-gray-600'>
													{parameter.values?.length || 0}
												</div>
											</td>
											<td className='p-4'>
												<div className='text-sm text-gray-600'>
													{parameter._count?.categoryParameters || 0}{' '}
													{locale === 'ru' ? 'категорий' : 'categorie'}
												</div>
											</td>
											<td className='p-4'>
												<div className='flex items-center space-x-2'>
													<Button
														variant='ghost'
														size='sm'
														onClick={() => handleEdit(parameter)}
														title={
															locale === 'ru' ? 'Редактировать' : 'Modifica'
														}
													>
														<Edit className='w-4 h-4 text-blue-500' />
													</Button>
													<Button
														variant='ghost'
														size='sm'
														onClick={() => {
															setParameterToDelete(parameter)
															setShowDeleteDialog(true)
														}}
														title={locale === 'ru' ? 'Удалить' : 'Elimina'}
													>
														<Trash2 className='w-4 h-4 text-red-500' />
													</Button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</Card>
			</div>

			{/* Форма редактирования */}
			{showForm && (
				<ParameterEditForm
					parameter={editingParameter || undefined}
					onSave={handleSave}
					onClose={() => {
						setShowForm(false)
						setEditingParameter(null)
					}}
				/>
			)}

			{/* Диалог подтверждения удаления */}
			<ConfirmDeleteDialog
				isOpen={showDeleteDialog}
				onClose={() => {
					setShowDeleteDialog(false)
					setParameterToDelete(null)
				}}
				onConfirm={handleDelete}
				title={
					locale === 'ru' ? 'Удаление параметра' : 'Eliminazione parametro'
				}
				itemName={parameterToDelete?.name || ''}
				itemType={locale === 'ru' ? 'параметр' : 'parametro'}
				warningMessage={
					parameterToDelete?._count?.categoryParameters &&
					parameterToDelete._count.categoryParameters > 0
						? locale === 'ru'
							? `Параметр используется в ${parameterToDelete._count.categoryParameters} категориях. Удаление может повлиять на конфигуратор.`
							: `Il parametro è utilizzato in ${parameterToDelete._count.categoryParameters} categorie. L'eliminazione potrebbe influire sul configuratore.`
						: undefined
				}
				isLoading={isDeleting}
			/>
		</AppLayout>
	)
}
