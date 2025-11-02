'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import ParameterEditForm from './parameter-edit-form'
import { ConfirmDeleteDialog } from './confirm-delete-dialog'
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
	_count: {
		categoryParameters: number
		supplierOverrides: number
	}
}

export function ParametersManager() {
	const { t, locale } = useLanguage()
	const [parameters, setParameters] = useState<Parameter[]>([])
	const [loading, setLoading] = useState(true)
	const [showAddModal, setShowAddModal] = useState(false)
	const [selectedParameter, setSelectedParameter] = useState<Parameter | null>(
		null
	)
	const [showDeleteModal, setShowDeleteModal] = useState(false)
	const [parameterToDelete, setParameterToDelete] = useState<Parameter | null>(
		null
	)
	const [isDeleting, setIsDeleting] = useState(false)

	useEffect(() => {
		fetchParameters()
	}, [])

	const fetchParameters = async () => {
		try {
			const response = await fetch('/api/parameters')
			const data = await response.json()
			setParameters(data)
		} catch (error) {
			logger.error('Error fetching parameters:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleDelete = async () => {
		if (!parameterToDelete) return

		setIsDeleting(true)
		try {
			const response = await fetch(`/api/parameters/${parameterToDelete.id}`, {
				method: 'DELETE',
			})

			if (response.ok) {
				await fetchParameters()
				setShowDeleteModal(false)
				setParameterToDelete(null)
			} else {
				const error = await response.json()
				alert(error.error || t('errorDeleting'))
			}
		} catch (error) {
			logger.error('Error deleting parameter:', error)
			alert(t('errorDeleting'))
		} finally {
			setIsDeleting(false)
		}
	}

	const handleSave = async (data: Record<string, unknown>) => {
		try {
			const url = selectedParameter
				? `/api/parameters/${selectedParameter.id}`
				: '/api/parameters'
			const method = selectedParameter ? 'PUT' : 'POST'

			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.error || 'Ошибка при сохранении параметра')
			}

			await fetchParameters()
			setShowAddModal(false)
			setSelectedParameter(null)
		} catch (error: unknown) {
			throw error
		}
	}

	const getTypeLabel = (type: string) => {
		const types: Record<string, string> = {
			TEXT: 'Текст / Testo',
			NUMBER: 'Число / Numero',
			SELECT: 'Выбор / Selezione',
			COLOR: 'Цвет / Colore',
			BOOLEAN: 'Да/Нет / Sì/No',
			MULTI_SELECT: 'Множественный выбор',
			DATE: 'Дата',
			RANGE: 'Диапазон',
		}
		return types[type] || type
	}

	if (loading) {
		return <div className='p-8 text-center'>{t('loading')}</div>
	}

	return (
		<div className='space-y-4'>
			<div className='flex items-center justify-between'>
				<h2 className='text-xl font-semibold'>
					Параметры продуктов / Parametri prodotti
				</h2>
				<Button
					onClick={() => setShowAddModal(true)}
					className='bg-green-600 hover:bg-green-700 text-white'
				>
					<Plus className='h-4 w-4 mr-2' />
					{t('add')}
				</Button>
			</div>

			{/* Список параметров */}
			<div className='grid grid-cols-1 gap-4'>
				{parameters.map(param => (
					<Card
						key={param.id}
						className='p-4 hover:shadow-md transition-shadow'
					>
						<div className='flex items-start justify-between'>
							<div className='flex-1'>
								<div className='flex items-center gap-3'>
									<h3 className='font-semibold text-lg'>
										{locale === 'ru' ? param.name : param.nameIt || param.name}
									</h3>
									<span className='px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded'>
										{getTypeLabel(param.type)}
									</span>
									{param.isSystem && (
										<span className='px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded font-medium'>
											{locale === 'ru' ? '🔒 Системный' : '🔒 Sistema'}
										</span>
									)}
								</div>

								{param.description && (
									<p className='text-sm text-gray-600 mt-1'>
										{param.description}
									</p>
								)}

								<div className='flex flex-wrap gap-4 mt-3 text-sm text-gray-500'>
									{param.unit && (
										<div>
											Единица: <span className='font-medium'>{param.unit}</span>
										</div>
									)}
									{param.minValue !== null && param.minValue !== undefined && (
										<div>
											Мин: <span className='font-medium'>{param.minValue}</span>
										</div>
									)}
									{param.maxValue !== null && param.maxValue !== undefined && (
										<div>
											Макс:{' '}
											<span className='font-medium'>{param.maxValue}</span>
										</div>
									)}
									{param.values && param.values.length > 0 && (
										<div>
											Значений:{' '}
											<span className='font-medium'>{param.values.length}</span>
										</div>
									)}
									<div>
										Используется в категориях:{' '}
										<span className='font-medium'>
											{param._count.categoryParameters}
										</span>
									</div>
								</div>

								{/* Значения параметра */}
								{param.values && param.values.length > 0 && (
									<div className='mt-3'>
										<div className='text-xs text-gray-500 mb-2'>Значения:</div>
										<div className='flex flex-wrap gap-2'>
											{param.values.slice(0, 5).map(v => (
												<span
													key={v.id}
													className='px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded'
													style={
														v.hexColor
															? {
																	backgroundColor: v.hexColor,
																	color:
																		v.hexColor === '#FFFFFF' ? '#000' : '#fff',
															  }
															: undefined
													}
												>
													{locale === 'ru' ? v.value : v.valueIt || v.value}
													{v.ralCode && ` (${v.ralCode})`}
												</span>
											))}
											{param.values.length > 5 && (
												<span className='px-2 py-1 text-xs text-gray-500'>
													+{param.values.length - 5} еще
												</span>
											)}
										</div>
									</div>
								)}
							</div>

							{/* Действия */}
							<div className='flex gap-2'>
								<Button
									variant='outline'
									size='sm'
									className='hover:bg-blue-50'
									onClick={() => {
										setSelectedParameter(param)
										setShowAddModal(true)
									}}
									title={t('edit')}
								>
									<Edit className='h-4 w-4' />
								</Button>
								{!param.isSystem && (
									<Button
										variant='outline'
										size='sm'
										className='hover:bg-red-50 text-red-600'
										onClick={() => {
											setParameterToDelete(param)
											setShowDeleteModal(true)
										}}
										title={t('delete')}
									>
										<Trash2 className='h-4 w-4' />
									</Button>
								)}
							</div>
						</div>
					</Card>
				))}
			</div>

			{parameters.length === 0 && (
				<div className='text-center py-12 text-gray-500'>
					<p>Параметры не найдены</p>
				</div>
			)}

			{/* Модальное окно добавления/редактирования */}
			{showAddModal && (
				<ParameterEditForm
					parameter={selectedParameter || undefined}
					onSave={handleSave}
					onClose={() => {
						setShowAddModal(false)
						setSelectedParameter(null)
					}}
				/>
			)}

			{/* Модальное окно подтверждения удаления */}
			<ConfirmDeleteDialog
				isOpen={showDeleteModal}
				onClose={() => {
					setShowDeleteModal(false)
					setParameterToDelete(null)
				}}
				onConfirm={handleDelete}
				title={
					locale === 'ru' ? 'Удаление параметра' : 'Eliminazione parametro'
				}
				itemName={parameterToDelete?.name || ''}
				itemType={locale === 'ru' ? 'параметр' : 'parametro'}
				warningMessage={
					parameterToDelete?._count.categoryParameters > 0
						? locale === 'ru'
							? `Параметр используется в ${parameterToDelete._count.categoryParameters} категориях. Удаление может повлиять на конфигуратор.`
							: `Il parametro è utilizzato in ${parameterToDelete._count.categoryParameters} categorie. L'eliminazione potrebbe influire sul configuratore.`
						: undefined
				}
				isLoading={isDeleting}
			/>
		</div>
	)
}
