'use client'

import React, { useState, useEffect } from 'react'
import { Check, X, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/LanguageContext'
import { logger } from '@/lib/logger'

interface CategoryParameter {
	id: string
	name: string
	nameIt?: string
	type: string
	isRequired: boolean
	isVisible: boolean
	isLinked: boolean
	unit?: string
	min?: number
	max?: number
	step?: number
	values?: Array<{
		value: string
		valueIt?: string
		displayName?: string
		hexColor?: string
	}>
}

interface CategoryParametersManagerProps {
	categoryId: string
	categoryName: string
}

export default function CategoryParametersManager({
	categoryId,
	categoryName,
}: CategoryParametersManagerProps) {
	const { locale } = useLanguage()
	const [parameters, setParameters] = useState<CategoryParameter[]>([])
	const [loading, setLoading] = useState(true)
	const [editingParam, setEditingParam] = useState<string | null>(null)
	const [editData, setEditData] = useState<any>({})
	const [isSaving, setIsSaving] = useState(false)

	useEffect(() => {
		fetchData()
	}, [categoryId])

	const fetchData = async () => {
		setLoading(true)
		try {
			const response = await fetch(
				`/api/category-parameters?categoryId=${categoryId}`
			)
			const data = await response.json()
			setParameters(data)
		} catch (error) {
			logger.error('Error fetching data:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleStartEdit = (param: CategoryParameter) => {
		setEditingParam(param.id)
		setEditData({
			isRequired: param.isRequired,
			isVisible: param.isVisible,
		})
	}

	const handleCancelEdit = () => {
		setEditingParam(null)
		setEditData({})
	}

	const handleSaveEdit = async (paramId: string) => {
		setIsSaving(true)
		try {
			// TODO: Добавить API для обновления настроек параметра категории
			// Нужно создать endpoint PUT /api/category-parameters/[id] или использовать существующий
			// Пока что просто закрываем редактирование
			logger.warn(
				'handleSaveEdit: API для обновления настроек параметра категории не реализован'
			)
			setEditingParam(null)
			setEditData({})
			await fetchData() // Перезагружаем данные
		} catch (error) {
			logger.error('Error saving edit:', error)
		} finally {
			setIsSaving(false)
		}
	}

	const handleAddParameter = async (parameterId: string) => {
		try {
			const response = await fetch(`/api/categories/${categoryId}/parameters`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					parameterId,
					isRequired: false,
					isVisible: true,
					order: parameters.length,
				}),
			})

			if (response.ok) {
				await fetchData()
			} else {
				const error = await response.json()
				logger.error('Error adding parameter:', error)
				// Можно добавить toast для показа ошибки пользователю
			}
		} catch (error) {
			logger.error('Error adding parameter:', error)
		}
	}

	const handleRemoveParameter = async (parameterId: string) => {
		try {
			const response = await fetch(
				`/api/categories/${categoryId}/parameters?parameterId=${parameterId}`,
				{
					method: 'DELETE',
				}
			)

			if (response.ok) {
				await fetchData()
			} else {
				const error = await response.json()
				logger.error('Error removing parameter:', error)
				// Можно добавить toast для показа ошибки пользователю
			}
		} catch (error) {
			logger.error('Error removing parameter:', error)
		}
	}

	if (loading) {
		return (
			<div className='p-4 text-center text-gray-500'>
				{locale === 'ru' ? 'Загрузка...' : 'Caricamento...'}
			</div>
		)
	}

	return (
		<div className='space-y-4'>
			{/* Все параметры */}
			<div className='space-y-2'>
				{parameters.map(param => {
					const isEditing = editingParam === param.id
					const displayName =
						locale === 'ru' ? param.name : param.nameIt || param.name

					return (
						<div
							key={param.id}
							className={`p-4 border rounded transition-all ${
								param.isLinked
									? 'bg-blue-50 border-blue-200'
									: 'bg-gray-50 border-gray-200'
							}`}
						>
							{!isEditing ? (
								// Режим просмотра
								<div className='space-y-3'>
									<div className='flex items-center justify-between'>
										<div className='flex items-center gap-3'>
											<h4 className='font-semibold'>{displayName}</h4>
											<span className='px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded'>
												{param.type}
											</span>
											{param.isRequired && (
												<span className='px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded'>
													{locale === 'ru' ? 'Обязательный' : 'Obbligatorio'}
												</span>
											)}
											{!param.isVisible && (
												<span className='px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded'>
													{locale === 'ru' ? 'Скрыт' : 'Nascosto'}
												</span>
											)}
											{param.isLinked && (
												<span className='px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded'>
													{locale === 'ru' ? 'Привязан' : 'Collegato'}
												</span>
											)}
										</div>

										<div className='flex gap-2'>
											<Button
												variant='outline'
												size='sm'
												onClick={() => handleStartEdit(param)}
												className='hover:bg-blue-50'
											>
												<Settings className='h-4 w-4' />
											</Button>
											{param.isLinked ? (
												<Button
													variant='outline'
													size='sm'
													onClick={() => handleRemoveParameter(param.id)}
													className='hover:bg-red-50 text-red-600 border-red-300'
												>
													<X className='h-4 w-4' />
												</Button>
											) : (
												<Button
													size='sm'
													onClick={() => handleAddParameter(param.id)}
													className='bg-green-600 hover:bg-green-700 text-white'
												>
													+
												</Button>
											)}
										</div>
									</div>

									{/* Информация о параметре */}
									{param.unit && (
										<div className='text-sm text-gray-600'>
											{locale === 'ru' ? 'Единица:' : 'Unità:'} {param.unit}
										</div>
									)}
								</div>
							) : (
								// Режим редактирования
								<div className='space-y-4'>
									<div className='flex items-center justify-between'>
										<h4 className='font-semibold'>{displayName}</h4>
										<div className='flex gap-2'>
											<Button
												size='sm'
												onClick={() => handleSaveEdit(param.id)}
												disabled={isSaving}
												className='bg-green-600 hover:bg-green-700 text-white'
											>
												<Check className='h-4 w-4' />
											</Button>
											<Button
												variant='outline'
												size='sm'
												onClick={handleCancelEdit}
												disabled={isSaving}
												className='border-red-300 text-red-600 hover:bg-red-50'
											>
												<X className='h-4 w-4' />
											</Button>
										</div>
									</div>

									<div className='grid grid-cols-2 gap-4'>
										<label className='flex items-center gap-2 cursor-pointer'>
											<input
												type='checkbox'
												checked={editData.isRequired}
												onChange={e =>
													setEditData({
														...editData,
														isRequired: e.target.checked,
													})
												}
												className='w-4 h-4'
											/>
											<span className='text-sm'>
												{locale === 'ru' ? 'Обязательный' : 'Obbligatorio'}
											</span>
										</label>
										<label className='flex items-center gap-2 cursor-pointer'>
											<input
												type='checkbox'
												checked={editData.isVisible}
												onChange={e =>
													setEditData({
														...editData,
														isVisible: e.target.checked,
													})
												}
												className='w-4 h-4'
											/>
											<span className='text-sm'>
												{locale === 'ru' ? 'Видимый' : 'Visibile'}
											</span>
										</label>
									</div>
								</div>
							)}
						</div>
					)
				})}
			</div>

			{parameters.length === 0 && (
				<div className='p-8 text-center border-2 border-dashed rounded text-gray-500'>
					<p>{locale === 'ru' ? 'Нет параметров' : 'Nessun parametro'}</p>
				</div>
			)}
		</div>
	)
}
