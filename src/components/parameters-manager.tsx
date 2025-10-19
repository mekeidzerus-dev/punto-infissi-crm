'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Plus, Edit, Trash2, Search, X } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import ParameterEditForm from './parameter-edit-form'

interface Parameter {
	id: string
	name: string
	nameIt: string
	type: string
	description?: string
	unit?: string
	minValue?: number
	maxValue?: number
	values: any[]
	_count: {
		categoryParameters: number
		supplierOverrides: number
	}
}

export function ParametersManager() {
	const { t, locale } = useLanguage()
	const [parameters, setParameters] = useState<Parameter[]>([])
	const [loading, setLoading] = useState(true)
	const [searchTerm, setSearchTerm] = useState('')
	const [showAddModal, setShowAddModal] = useState(false)
	const [selectedParameter, setSelectedParameter] = useState<Parameter | null>(
		null
	)
	const [showDeleteModal, setShowDeleteModal] = useState(false)
	const [parameterToDelete, setParameterToDelete] = useState<Parameter | null>(
		null
	)

	useEffect(() => {
		fetchParameters()
	}, [])

	const fetchParameters = async () => {
		try {
			const response = await fetch('/api/parameters')
			const data = await response.json()
			setParameters(data)
		} catch (error) {
			console.error('Error fetching parameters:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleDelete = async () => {
		if (!parameterToDelete) return

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
			console.error('Error deleting parameter:', error)
			alert(t('errorDeleting'))
		}
	}

	const handleSave = async (data: any) => {
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
		} catch (error: any) {
			throw error
		}
	}

	const filteredParameters = parameters.filter(
		p =>
			p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			p.nameIt?.toLowerCase().includes(searchTerm.toLowerCase())
	)

	const getTypeLabel = (type: string) => {
		const types = {
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

			{/* Поиск */}
			<div className='relative'>
				<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
				<Input
					placeholder={t('search')}
					value={searchTerm}
					onChange={e => setSearchTerm(e.target.value)}
					className='pl-10'
				/>
			</div>

			{/* Список параметров */}
			<div className='grid grid-cols-1 gap-4'>
				{filteredParameters.map(param => (
					<Card
						key={param.id}
						className='p-4 hover:shadow-md transition-shadow'
					>
						<div className='flex items-start justify-between'>
							<div className='flex-1'>
								<div className='flex items-center gap-3'>
									<h3 className='font-semibold text-lg'>
										{locale === 'ru' ? param.name : param.nameIt}
									</h3>
									<span className='px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded'>
										{getTypeLabel(param.type)}
									</span>
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
													{locale === 'ru' ? v.value : v.valueIt}
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
							</div>
						</div>
					</Card>
				))}
			</div>

			{filteredParameters.length === 0 && (
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

			{/* Модальное окно удаления */}
			{showDeleteModal && parameterToDelete && (
				<div
					className='fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50'
					onClick={() => {
						setShowDeleteModal(false)
						setParameterToDelete(null)
					}}
				>
					<Card
						className='p-6 max-w-md w-full mx-4'
						onClick={e => e.stopPropagation()}
					>
						<h3 className='text-lg font-semibold mb-4 text-red-700'>
							{t('delete')} / Elimina
						</h3>
						<p className='text-gray-600 mb-6'>
							{locale === 'ru'
								? `Удалить параметр "${parameterToDelete.name}"?`
								: `Eliminare il parametro "${parameterToDelete.nameIt}"?`}
							<br />
							<br />
							{parameterToDelete._count.categoryParameters > 0 && (
								<span className='text-red-600 font-medium'>
									⚠️ {parameterToDelete._count.categoryParameters}{' '}
									{locale === 'ru'
										? 'категорий используют этот параметр!'
										: 'categorie usano questo parametro!'}
								</span>
							)}
						</p>
						<div className='flex justify-end gap-3'>
							<Button
								variant='outline'
								onClick={() => {
									setShowDeleteModal(false)
									setParameterToDelete(null)
								}}
								className='border-gray-300 text-gray-700 hover:bg-gray-50'
							>
								{t('cancel')}
							</Button>
							<Button
								onClick={handleDelete}
								className='bg-red-600 hover:bg-red-700 text-white'
							>
								<Trash2 className='h-4 w-4 mr-2' />
								{t('delete')}
							</Button>
						</div>
					</Card>
				</div>
			)}
		</div>
	)
}
