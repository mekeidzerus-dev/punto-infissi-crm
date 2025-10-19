'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/LanguageContext'

interface ParameterValue {
	id: string
	value: string
	valueIt: string
	hexColor?: string
	ralCode?: string
}

interface Parameter {
	id: string
	name: string
	nameIt: string
	type: string
	unit?: string
	minValue?: number
	maxValue?: number
	values: ParameterValue[]
}

interface Override {
	id: string
	parameterId: string
	customValues?: string
	minValue?: number
	maxValue?: number
	isAvailable: boolean
	parameter: Parameter
}

interface SupplierParameterOverridesProps {
	supplierId: number
	categoryIds: string[] // Категории, к которым привязан поставщик
}

export default function SupplierParameterOverrides({
	supplierId,
	categoryIds,
}: SupplierParameterOverridesProps) {
	const { locale } = useLanguage()
	const [overrides, setOverrides] = useState<Override[]>([])
	const [allParameters, setAllParameters] = useState<Parameter[]>([])
	const [loading, setLoading] = useState(true)
	const [showAddModal, setShowAddModal] = useState(false)
	const [selectedParameter, setSelectedParameter] = useState<Parameter | null>(
		null
	)
	const [editingOverride, setEditingOverride] = useState<Override | null>(null)

	useEffect(() => {
		fetchData()
	}, [supplierId, categoryIds])

	const fetchData = async () => {
		setLoading(true)
		try {
			// Получаем переопределения поставщика
			const overridesRes = await fetch(
				`/api/suppliers/${supplierId}/parameter-overrides`
			)
			const overridesData = await overridesRes.json()
			setOverrides(overridesData)

			// Получаем все параметры для категорий поставщика
			if (categoryIds.length > 0) {
				const paramsPromises = categoryIds.map(catId =>
					fetch(`/api/category-parameters?categoryId=${catId}`).then(res =>
						res.json()
					)
				)
				const paramsResults = await Promise.all(paramsPromises)

				// Объединяем и удаляем дубликаты
				const uniqueParams = new Map<string, Parameter>()
				paramsResults.flat().forEach(cp => {
					if (!uniqueParams.has(cp.parameter.id)) {
						uniqueParams.set(cp.parameter.id, cp.parameter)
					}
				})

				setAllParameters(Array.from(uniqueParams.values()))
			}
		} catch (error) {
			console.error('Error fetching data:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleCreateOverride = async (parameterId: string) => {
		try {
			const response = await fetch(
				`/api/suppliers/${supplierId}/parameter-overrides`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						parameterId,
						isAvailable: true,
					}),
				}
			)

			if (response.ok) {
				await fetchData()
				setShowAddModal(false)
				setSelectedParameter(null)
			} else {
				const error = await response.json()
				alert(error.error || 'Ошибка при создании переопределения')
			}
		} catch (error) {
			console.error('Error creating override:', error)
			alert('Ошибка при создании переопределения')
		}
	}

	const handleUpdateOverride = async (
		overrideId: string,
		data: Partial<Override>
	) => {
		try {
			const response = await fetch(
				`/api/supplier-parameter-overrides/${overrideId}`,
				{
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(data),
				}
			)

			if (response.ok) {
				await fetchData()
				setEditingOverride(null)
			} else {
				const error = await response.json()
				alert(error.error || 'Ошибка при обновлении переопределения')
			}
		} catch (error) {
			console.error('Error updating override:', error)
			alert('Ошибка при обновлении переопределения')
		}
	}

	const handleDeleteOverride = async (overrideId: string) => {
		if (!confirm('Удалить переопределение параметра?')) return

		try {
			const response = await fetch(
				`/api/supplier-parameter-overrides/${overrideId}`,
				{
					method: 'DELETE',
				}
			)

			if (response.ok) {
				await fetchData()
			} else {
				const error = await response.json()
				alert(error.error || 'Ошибка при удалении переопределения')
			}
		} catch (error) {
			console.error('Error deleting override:', error)
			alert('Ошибка при удалении переопределения')
		}
	}

	// Параметры, для которых еще нет переопределений
	const availableParameters = allParameters.filter(
		p => !overrides.some(o => o.parameterId === p.id)
	)

	if (loading) {
		return <div className='p-4 text-center text-gray-500'>Загрузка...</div>
	}

	if (categoryIds.length === 0) {
		return (
			<div className='p-4 text-center text-gray-500'>
				Сначала привяжите поставщика к категориям
			</div>
		)
	}

	return (
		<div className='space-y-4'>
			<div className='flex items-center justify-between'>
				<h3 className='font-medium text-lg'>
					Переопределения параметров / Parameter overrides
				</h3>
				<Button
					onClick={() => setShowAddModal(true)}
					className='bg-green-600 hover:bg-green-700 text-white'
					size='sm'
					disabled={availableParameters.length === 0}
				>
					<Plus className='h-4 w-4 mr-2' />
					Добавить
				</Button>
			</div>

			{overrides.length === 0 ? (
				<div className='p-8 text-center border-2 border-dashed rounded text-gray-500'>
					<p>Нет переопределений параметров</p>
					<p className='text-sm mt-2'>
						Используются стандартные значения параметров
					</p>
				</div>
			) : (
				<div className='space-y-3'>
					{overrides.map(override => (
						<div
							key={override.id}
							className='p-4 border rounded bg-white hover:shadow-md transition-shadow'
						>
							<div className='flex items-start justify-between'>
								<div className='flex-1'>
									<div className='flex items-center gap-2'>
										<h4 className='font-semibold'>
											{locale === 'ru'
												? override.parameter.name
												: override.parameter.nameIt}
										</h4>
										<span className='px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded'>
											{override.parameter.type}
										</span>
										{!override.isAvailable && (
											<span className='px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded'>
												Недоступно
											</span>
										)}
									</div>

									{/* Переопределения NUMBER */}
									{override.parameter.type === 'NUMBER' && (
										<div className='mt-2 text-sm text-gray-600 flex gap-4'>
											{override.minValue !== null &&
												override.minValue !== undefined && (
													<div>
														Мин:{' '}
														<span className='font-medium text-blue-600'>
															{override.minValue}
														</span>
														{override.parameter.unit && (
															<span className='ml-1'>
																{override.parameter.unit}
															</span>
														)}
													</div>
												)}
											{override.maxValue !== null &&
												override.maxValue !== undefined && (
													<div>
														Макс:{' '}
														<span className='font-medium text-blue-600'>
															{override.maxValue}
														</span>
														{override.parameter.unit && (
															<span className='ml-1'>
																{override.parameter.unit}
															</span>
														)}
													</div>
												)}
										</div>
									)}

									{/* Переопределения SELECT/COLOR */}
									{(override.parameter.type === 'SELECT' ||
										override.parameter.type === 'COLOR') && (
										<div className='mt-2'>
											{override.customValues ? (
												<div>
													<div className='text-xs text-gray-500 mb-1'>
														Кастомные значения:
													</div>
													<div className='flex flex-wrap gap-2'>
														{JSON.parse(override.customValues).map(
															(v: string, idx: number) => (
																<span
																	key={idx}
																	className='px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded'
																>
																	{v}
																</span>
															)
														)}
													</div>
												</div>
											) : (
												<div className='text-sm text-gray-500'>
													Используются стандартные значения (
													{override.parameter.values.length})
												</div>
											)}
										</div>
									)}
								</div>

								{/* Действия */}
								<div className='flex gap-2'>
									<Button
										variant='outline'
										size='sm'
										className='hover:bg-blue-50'
										onClick={() => setEditingOverride(override)}
									>
										<Edit className='h-4 w-4' />
									</Button>
									<Button
										variant='outline'
										size='sm'
										className='hover:bg-red-50 text-red-600'
										onClick={() => handleDeleteOverride(override.id)}
									>
										<Trash2 className='h-4 w-4' />
									</Button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Модальное окно добавления параметра */}
			{showAddModal && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
					<div className='bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto'>
						<div className='sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between'>
							<h3 className='text-lg font-semibold'>
								Добавить переопределение параметра
							</h3>
							<button
								onClick={() => setShowAddModal(false)}
								className='text-gray-400 hover:text-gray-600'
							>
								<X className='w-6 h-6' />
							</button>
						</div>

						<div className='p-6'>
							{availableParameters.length === 0 ? (
								<p className='text-center text-gray-500 py-8'>
									Все параметры категорий уже имеют переопределения
								</p>
							) : (
								<div className='space-y-2'>
									<p className='text-sm text-gray-600 mb-4'>
										Выберите параметр для создания переопределения:
									</p>
									{availableParameters.map(param => (
										<div
											key={param.id}
											className='flex items-center justify-between p-3 border rounded hover:bg-gray-50'
										>
											<div>
												<div className='font-medium'>
													{locale === 'ru' ? param.name : param.nameIt}
												</div>
												<div className='text-xs text-gray-500'>
													{param.type}
													{param.values.length > 0 &&
														` • ${param.values.length} значений`}
												</div>
											</div>
											<Button
												size='sm'
												onClick={() => handleCreateOverride(param.id)}
												className='bg-green-600 hover:bg-green-700 text-white'
											>
												<Plus className='h-4 w-4 mr-1' />
												Добавить
											</Button>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Модальное окно редактирования переопределения */}
			{editingOverride && (
				<EditOverrideModal
					override={editingOverride}
					onSave={data => handleUpdateOverride(editingOverride.id, data)}
					onClose={() => setEditingOverride(null)}
					locale={locale}
				/>
			)}
		</div>
	)
}

// Модальное окно редактирования переопределения
function EditOverrideModal({
	override,
	onSave,
	onClose,
	locale,
}: {
	override: Override
	onSave: (data: any) => void
	onClose: () => void
	locale: string
}) {
	const [isAvailable, setIsAvailable] = useState(override.isAvailable)
	const [minValue, setMinValue] = useState<number | undefined>(
		override.minValue || undefined
	)
	const [maxValue, setMaxValue] = useState<number | undefined>(
		override.maxValue || undefined
	)
	const [customValues, setCustomValues] = useState<string[]>(
		override.customValues ? JSON.parse(override.customValues) : []
	)
	const [newValue, setNewValue] = useState('')

	const handleAddCustomValue = () => {
		if (newValue.trim()) {
			setCustomValues([...customValues, newValue.trim()])
			setNewValue('')
		}
	}

	const handleRemoveCustomValue = (index: number) => {
		setCustomValues(customValues.filter((_, i) => i !== index))
	}

	const handleSubmit = () => {
		const data: any = {
			isAvailable,
		}

		if (override.parameter.type === 'NUMBER') {
			data.minValue = minValue !== undefined ? minValue : null
			data.maxValue = maxValue !== undefined ? maxValue : null
		}

		if (
			override.parameter.type === 'SELECT' ||
			override.parameter.type === 'COLOR'
		) {
			data.customValues =
				customValues.length > 0 ? JSON.stringify(customValues) : null
		}

		onSave(data)
	}

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
			<div className='bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto'>
				<div className='sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between'>
					<h3 className='text-lg font-semibold'>
						Настройка переопределения:{' '}
						{locale === 'ru'
							? override.parameter.name
							: override.parameter.nameIt}
					</h3>
					<button
						onClick={onClose}
						className='text-gray-400 hover:text-gray-600'
					>
						<X className='w-6 h-6' />
					</button>
				</div>

				<div className='p-6 space-y-6'>
					{/* Доступность параметра */}
					<div className='flex items-center justify-between p-4 border rounded'>
						<div>
							<div className='font-medium'>Параметр доступен</div>
							<div className='text-sm text-gray-500'>
								Отключите, если этот поставщик не работает с этим параметром
							</div>
						</div>
						<label className='relative inline-flex items-center cursor-pointer'>
							<input
								type='checkbox'
								checked={isAvailable}
								onChange={e => setIsAvailable(e.target.checked)}
								className='sr-only peer'
							/>
							<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
						</label>
					</div>

					{isAvailable && (
						<>
							{/* Переопределения для NUMBER типа */}
							{override.parameter.type === 'NUMBER' && (
								<div className='space-y-4'>
									<h4 className='font-medium'>Ограничения диапазона</h4>
									<div className='grid grid-cols-2 gap-4'>
										<div>
											<label className='block text-sm font-medium mb-1'>
												Минимум
												{override.parameter.unit && (
													<span className='text-gray-500 ml-1'>
														({override.parameter.unit})
													</span>
												)}
											</label>
											<input
												type='number'
												value={minValue || ''}
												onChange={e =>
													setMinValue(
														e.target.value ? Number(e.target.value) : undefined
													)
												}
												className='w-full border rounded px-3 py-2'
												placeholder={`По умолчанию: ${
													override.parameter.minValue || 'нет'
												}`}
											/>
										</div>
										<div>
											<label className='block text-sm font-medium mb-1'>
												Максимум
												{override.parameter.unit && (
													<span className='text-gray-500 ml-1'>
														({override.parameter.unit})
													</span>
												)}
											</label>
											<input
												type='number'
												value={maxValue || ''}
												onChange={e =>
													setMaxValue(
														e.target.value ? Number(e.target.value) : undefined
													)
												}
												className='w-full border rounded px-3 py-2'
												placeholder={`По умолчанию: ${
													override.parameter.maxValue || 'нет'
												}`}
											/>
										</div>
									</div>
								</div>
							)}

							{/* Переопределения для SELECT/COLOR типа */}
							{(override.parameter.type === 'SELECT' ||
								override.parameter.type === 'COLOR') && (
								<div className='space-y-4'>
									<div className='flex items-center justify-between'>
										<h4 className='font-medium'>Дополнительные значения</h4>
										<span className='text-xs text-gray-500'>
											Эксклюзивные для этого поставщика
										</span>
									</div>

									{/* Стандартные значения */}
									<div>
										<div className='text-sm text-gray-600 mb-2'>
											Стандартные значения ({override.parameter.values.length}
											):
										</div>
										<div className='flex flex-wrap gap-2'>
											{override.parameter.values.map(v => (
												<span
													key={v.id}
													className='px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded'
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
										</div>
									</div>

									{/* Кастомные значения */}
									<div>
										<div className='text-sm text-gray-600 mb-2'>
											Дополнительные значения (только для этого поставщика):
										</div>
										<div className='flex items-center gap-2 mb-2'>
											<input
												type='text'
												value={newValue}
												onChange={e => setNewValue(e.target.value)}
												onKeyDown={e => {
													if (e.key === 'Enter') {
														e.preventDefault()
														handleAddCustomValue()
													}
												}}
												placeholder='Введите значение и нажмите Enter'
												className='flex-1 border rounded px-3 py-2 text-sm'
											/>
											<Button
												type='button'
												size='sm'
												onClick={handleAddCustomValue}
												className='bg-blue-600 hover:bg-blue-700 text-white'
											>
												<Plus className='h-4 w-4' />
											</Button>
										</div>

										{customValues.length > 0 && (
											<div className='flex flex-wrap gap-2'>
												{customValues.map((value, idx) => (
													<span
														key={idx}
														className='px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded flex items-center gap-1'
													>
														{value}
														<button
															onClick={() => handleRemoveCustomValue(idx)}
															className='text-blue-500 hover:text-blue-700'
														>
															<X className='h-3 w-3' />
														</button>
													</span>
												))}
											</div>
										)}
									</div>
								</div>
							)}
						</>
					)}
				</div>

				{/* Actions */}
				<div className='flex items-center justify-end space-x-3 border-t p-4'>
					<Button
						variant='outline'
						onClick={onClose}
						className='border-gray-300 text-gray-700 hover:bg-gray-50'
					>
						Отмена
					</Button>
					<Button
						onClick={handleSubmit}
						className='bg-green-600 hover:bg-green-700 text-white'
					>
						<Check className='h-4 w-4 mr-2' />
						Сохранить
					</Button>
				</div>
			</div>
		</div>
	)
}
