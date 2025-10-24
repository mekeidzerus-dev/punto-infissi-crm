'use client'

import React, { useState, useEffect } from 'react'
import { Check, X, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useLanguage } from '@/contexts/LanguageContext'

interface ParameterValue {
	id: string
	value: string
	valueIt: string
}

interface Parameter {
	id: string
	name: string
	nameIt: string
	type: string
	unit?: string
	values: ParameterValue[]
}

interface CategoryParameter {
	id: string
	parameterId: string
	isRequired: boolean
	isVisible: boolean
	defaultValue?: string
	displayName?: string
	helpText?: string
	unit?: string
	parameter: Parameter
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
	const [categoryParameters, setCategoryParameters] = useState<
		CategoryParameter[]
	>([])
	const [allParameters, setAllParameters] = useState<Parameter[]>([])
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
			// Загружаем параметры категории
			const categoryParamsRes = await fetch(
				`/api/category-parameters?categoryId=${categoryId}`
			)
			const categoryParamsData = await categoryParamsRes.json()
			setCategoryParameters(categoryParamsData)

			// Загружаем все доступные параметры
			const allParamsRes = await fetch('/api/parameters')
			const allParamsData = await allParamsRes.json()
			setAllParameters(allParamsData)
		} catch (error) {
			console.error('Error fetching data:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleStartEdit = (cp: CategoryParameter) => {
		setEditingParam(cp.parameterId)
		setEditData({
			isRequired: cp.isRequired,
			isVisible: cp.isVisible,
			defaultValue: cp.defaultValue || '',
			displayName: cp.displayName || '',
			helpText: cp.helpText || '',
			unit: cp.unit || '',
		})
	}

	const handleCancelEdit = () => {
		setEditingParam(null)
		setEditData({})
	}

	const handleSaveEdit = async (parameterId: string) => {
		setIsSaving(true)
		try {
			const response = await fetch(`/api/categories/${categoryId}/parameters`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					parameters: [
						{
							parameterId,
							...editData,
							defaultValue: editData.defaultValue || null,
							displayName: editData.displayName || null,
							helpText: editData.helpText || null,
							unit: editData.unit || null,
						},
					],
				}),
			})

			if (response.ok) {
				await fetchData()
				handleCancelEdit()
			} else {
				const error = await response.json()
				alert(error.error || 'Ошибка при сохранении')
			}
		} catch (error) {
			console.error('Error saving:', error)
			alert('Ошибка при сохранении')
		} finally {
			setIsSaving(false)
		}
	}

	const handleToggleParameter = async (
		parameterId: string,
		field: 'isRequired' | 'isVisible',
		currentValue: boolean
	) => {
		try {
			const response = await fetch(`/api/categories/${categoryId}/parameters`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					parameters: [
						{
							parameterId,
							[field]: !currentValue,
						},
					],
				}),
			})

			if (response.ok) {
				await fetchData()
			}
		} catch (error) {
			console.error('Error toggling parameter:', error)
		}
	}

	const handleAddParameter = async (parameterId: string) => {
		try {
			const response = await fetch(`/api/categories/${categoryId}/parameters`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					parameters: [
						{
							parameterId,
							isRequired: false,
							isVisible: true,
						},
					],
				}),
			})

			if (response.ok) {
				await fetchData()
			}
		} catch (error) {
			console.error('Error adding parameter:', error)
		}
	}

	// Параметры, которые еще не привязаны к категории
	const availableParameters = allParameters.filter(
		p => !categoryParameters.some(cp => cp.parameterId === p.id)
	)

	if (loading) {
		return <div className='p-4 text-center text-gray-500'>Загрузка...</div>
	}

	return (
		<div className='space-y-4'>
			<div className='flex items-center justify-between'>
				<h3 className='font-medium text-lg'>
					Параметры категории: {categoryName}
				</h3>
				{availableParameters.length > 0 && (
					<div className='text-sm text-gray-500'>
						Доступно для добавления: {availableParameters.length}
					</div>
				)}
			</div>

			{/* Привязанные параметры */}
			<div className='space-y-2'>
				{categoryParameters.map(cp => {
					const isEditing = editingParam === cp.parameterId
					const param = cp.parameter

					return (
						<div
							key={cp.id}
							className='p-4 border rounded bg-white hover:shadow-sm transition-shadow'
						>
							{!isEditing ? (
								// Режим просмотра
								<div className='space-y-3'>
									<div className='flex items-start justify-between'>
										<div className='flex-1'>
											<div className='flex items-center gap-3'>
												<h4 className='font-semibold'>
													{locale === 'ru'
														? param.name
														: param.nameIt || param.name}
												</h4>
												<span className='px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded'>
													{param.type}
												</span>
												{cp.isRequired && (
													<span className='px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded'>
														Обязательный
													</span>
												)}
												{!cp.isVisible && (
													<span className='px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded'>
														Скрыт
													</span>
												)}
											</div>

											{/* Информация о настройках */}
											<div className='mt-2 grid grid-cols-2 gap-4 text-sm'>
												{cp.displayName && (
													<div>
														<span className='text-gray-500'>
															Отображаемое имя:
														</span>{' '}
														<span className='font-medium'>
															{cp.displayName}
														</span>
													</div>
												)}
												{cp.defaultValue && (
													<div>
														<span className='text-gray-500'>По умолчанию:</span>{' '}
														<span className='font-medium'>
															{cp.defaultValue}
														</span>
													</div>
												)}
												{cp.unit && (
													<div>
														<span className='text-gray-500'>Единица:</span>{' '}
														<span className='font-medium'>{cp.unit}</span>
													</div>
												)}
											</div>

											{cp.helpText && (
												<div className='mt-2 text-sm text-gray-600 italic'>
													💡 {cp.helpText}
												</div>
											)}
										</div>

										<Button
											variant='outline'
											size='sm'
											onClick={() => handleStartEdit(cp)}
											className='hover:bg-blue-50'
										>
											<Settings className='h-4 w-4' />
										</Button>
									</div>

									{/* Переключатели */}
									<div className='flex gap-4 pt-2 border-t'>
										<label className='flex items-center gap-2 cursor-pointer'>
											<input
												type='checkbox'
												checked={cp.isRequired}
												onChange={() =>
													handleToggleParameter(
														cp.parameterId,
														'isRequired',
														cp.isRequired
													)
												}
												className='w-4 h-4'
											/>
											<span className='text-sm'>Обязательный</span>
										</label>
										<label className='flex items-center gap-2 cursor-pointer'>
											<input
												type='checkbox'
												checked={cp.isVisible}
												onChange={() =>
													handleToggleParameter(
														cp.parameterId,
														'isVisible',
														cp.isVisible
													)
												}
												className='w-4 h-4'
											/>
											<span className='text-sm'>Видимый</span>
										</label>
									</div>
								</div>
							) : (
								// Режим редактирования
								<div className='space-y-4'>
									<div className='flex items-center justify-between'>
										<h4 className='font-semibold'>
											{locale === 'ru'
												? param.name
												: param.nameIt || param.name}
										</h4>
										<div className='flex gap-2'>
											<Button
												size='sm'
												onClick={() => handleSaveEdit(cp.parameterId)}
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
										{/* Переопределение названия */}
										<div>
											<label className='block text-sm font-medium mb-1'>
												Отображаемое имя
											</label>
											<Input
												value={editData.displayName || ''}
												onChange={e =>
													setEditData({
														...editData,
														displayName: e.target.value,
													})
												}
												placeholder={
													locale === 'ru'
														? param.name
														: param.nameIt || param.name
												}
											/>
											<p className='text-xs text-gray-500 mt-1'>
												Оставьте пустым для стандартного
											</p>
										</div>

										{/* Значение по умолчанию */}
										<div>
											<label className='block text-sm font-medium mb-1'>
												Значение по умолчанию
											</label>
											{param.type === 'SELECT' || param.type === 'COLOR' ? (
												<select
													value={editData.defaultValue || ''}
													onChange={e =>
														setEditData({
															...editData,
															defaultValue: e.target.value,
														})
													}
													className='w-full border rounded px-3 py-2'
												>
													<option value=''>Не задано</option>
													{param.values.map(v => (
														<option key={v.id} value={v.value}>
															{locale === 'ru' ? v.value : v.valueIt}
														</option>
													))}
												</select>
											) : (
												<Input
													value={editData.defaultValue || ''}
													onChange={e =>
														setEditData({
															...editData,
															defaultValue: e.target.value,
														})
													}
													placeholder='Значение по умолчанию'
												/>
											)}
										</div>

										{/* Единица измерения (переопределение для NUMBER) */}
										{param.type === 'NUMBER' && (
											<div>
												<label className='block text-sm font-medium mb-1'>
													Единица измерения
												</label>
												<Input
													value={editData.unit || ''}
													onChange={e =>
														setEditData({ ...editData, unit: e.target.value })
													}
													placeholder={param.unit || 'мм, см, кг'}
												/>
												<p className='text-xs text-gray-500 mt-1'>
													Оставьте пустым для стандартной ({param.unit})
												</p>
											</div>
										)}

										{/* Подсказка */}
										<div className='col-span-2'>
											<label className='block text-sm font-medium mb-1'>
												Подсказка (helpText)
											</label>
											<Textarea
												value={editData.helpText || ''}
												onChange={e =>
													setEditData({ ...editData, helpText: e.target.value })
												}
												placeholder='Например: Выберите материал изготовления двери'
												rows={2}
											/>
										</div>
									</div>

									{/* Переключатели */}
									<div className='flex gap-4 pt-2 border-t'>
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
											<span className='text-sm font-medium'>Обязательный</span>
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
											<span className='text-sm font-medium'>Видимый</span>
										</label>
									</div>
								</div>
							)}
						</div>
					)
				})}
			</div>

			{/* Добавление новых параметров */}
			{availableParameters.length > 0 && (
				<div className='border-t pt-4 mt-4'>
					<h4 className='font-medium text-sm text-gray-700 mb-3'>
						Добавить параметр к категории:
					</h4>
					<div className='grid grid-cols-2 gap-2'>
						{availableParameters.map(param => (
							<div
								key={param.id}
								className='flex items-center justify-between p-2 border rounded hover:bg-gray-50'
							>
								<div className='text-sm'>
									<div className='font-medium'>
										{locale === 'ru' ? param.name : param.nameIt || param.name}
									</div>
									<div className='text-xs text-gray-500'>{param.type}</div>
								</div>
								<Button
									size='sm'
									onClick={() => handleAddParameter(param.id)}
									className='bg-blue-600 hover:bg-blue-700 text-white'
								>
									+
								</Button>
							</div>
						))}
					</div>
				</div>
			)}

			{categoryParameters.length === 0 && (
				<div className='p-8 text-center border-2 border-dashed rounded text-gray-500'>
					<p>Нет параметров для этой категории</p>
					<p className='text-sm mt-2'>
						Добавьте параметры из списка доступных выше
					</p>
				</div>
			)}
		</div>
	)
}
