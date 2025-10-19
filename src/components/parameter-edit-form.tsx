'use client'

import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2, GripVertical } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { t } from '@/lib/i18n'

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

interface ParameterEditFormProps {
	parameter?: {
		id: string
		name: string
		nameIt?: string
		type: 'NUMBER' | 'SELECT' | 'COLOR' | 'TEXT' | 'BOOLEAN'
		description?: string
		unit?: string
		minValue?: number
		maxValue?: number
		step?: number
		values?: ParameterValue[]
	}
	onSave: (data: any) => Promise<void>
	onClose: () => void
}

export default function ParameterEditForm({
	parameter,
	onSave,
	onClose,
}: ParameterEditFormProps) {
	const { locale } = useLanguage()
	const isEdit = !!parameter

	// Основные поля
	const [name, setName] = useState(parameter?.name || '')
	const [nameIt, setNameIt] = useState(parameter?.nameIt || '')
	const [type, setType] = useState<ParameterEditFormProps['parameter']['type']>(
		parameter?.type || 'SELECT'
	)
	const [description, setDescription] = useState(parameter?.description || '')
	const [unit, setUnit] = useState(parameter?.unit || '')

	// Поля для числовых параметров
	const [minValue, setMinValue] = useState<number | undefined>(
		parameter?.minValue
	)
	const [maxValue, setMaxValue] = useState<number | undefined>(
		parameter?.maxValue
	)
	const [step, setStep] = useState<number | undefined>(parameter?.step)

	// Значения параметра
	const [values, setValues] = useState<ParameterValue[]>(
		parameter?.values || []
	)

	const [isSaving, setIsSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Добавить новое значение
	const handleAddValue = () => {
		const newValue: ParameterValue = {
			value: '',
			valueIt: '',
			displayName: '',
			hexColor: type === 'COLOR' ? '#FFFFFF' : undefined,
			ralCode: type === 'COLOR' ? '' : undefined,
			icon: '',
			order: values.length,
			isActive: true,
		}
		setValues([...values, newValue])
	}

	// Удалить значение
	const handleRemoveValue = (index: number) => {
		setValues(values.filter((_, i) => i !== index))
	}

	// Обновить значение
	const handleUpdateValue = (
		index: number,
		field: keyof ParameterValue,
		value: any
	) => {
		const newValues = [...values]
		newValues[index] = { ...newValues[index], [field]: value }
		setValues(newValues)
	}

	// Переместить значение вверх
	const handleMoveValueUp = (index: number) => {
		if (index === 0) return
		const newValues = [...values]
		;[newValues[index - 1], newValues[index]] = [
			newValues[index],
			newValues[index - 1],
		]
		// Обновляем порядок
		newValues.forEach((v, i) => (v.order = i))
		setValues(newValues)
	}

	// Переместить значение вниз
	const handleMoveValueDown = (index: number) => {
		if (index === values.length - 1) return
		const newValues = [...values]
		;[newValues[index], newValues[index + 1]] = [
			newValues[index + 1],
			newValues[index],
		]
		// Обновляем порядок
		newValues.forEach((v, i) => (v.order = i))
		setValues(newValues)
	}

	// Сохранить
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)

		// Валидация
		if (!name.trim()) {
			setError('Название параметра обязательно')
			return
		}

		if ((type === 'SELECT' || type === 'COLOR') && values.length === 0) {
			setError('Добавьте хотя бы одно значение для параметра')
			return
		}

		// Проверка заполненности значений
		if (type === 'SELECT' || type === 'COLOR') {
			const emptyValues = values.filter(v => !v.value.trim())
			if (emptyValues.length > 0) {
				setError('Все значения должны быть заполнены')
				return
			}
		}

		setIsSaving(true)

		try {
			const data = {
				name,
				nameIt: nameIt || null,
				type,
				description: description || null,
				unit: unit || null,
				minValue: type === 'NUMBER' ? minValue : null,
				maxValue: type === 'NUMBER' ? maxValue : null,
				step: type === 'NUMBER' ? step : null,
				values:
					type === 'SELECT' || type === 'COLOR'
						? values.map((v, index) => ({
								...v,
								order: index,
								hexColor: type === 'COLOR' ? v.hexColor : null,
								ralCode: type === 'COLOR' ? v.ralCode : null,
						  }))
						: [],
			}

			await onSave(data)
			onClose()
		} catch (err: any) {
			setError(err.message || 'Ошибка при сохранении параметра')
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
			<div className='bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
				{/* Header */}
				<div className='sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between'>
					<h2 className='text-xl font-semibold'>
						{isEdit ? 'Редактировать параметр' : 'Создать параметр'}
					</h2>
					<button
						onClick={onClose}
						className='text-gray-400 hover:text-gray-600'
					>
						<X className='w-6 h-6' />
					</button>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className='p-6 space-y-6'>
					{/* Error */}
					{error && (
						<div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
							{error}
						</div>
					)}

					{/* Основная информация */}
					<div className='space-y-4'>
						<h3 className='font-medium text-lg'>Основная информация</h3>

						<div className='grid grid-cols-2 gap-4'>
							{/* Название RU */}
							<div>
								<label className='block text-sm font-medium mb-1'>
									Название <span className='text-red-500'>*</span>
								</label>
								<input
									type='text'
									value={name}
									onChange={e => setName(e.target.value)}
									className='w-full border rounded px-3 py-2'
									placeholder='Материал'
									required
								/>
							</div>

							{/* Название IT */}
							<div>
								<label className='block text-sm font-medium mb-1'>
									Название IT
								</label>
								<input
									type='text'
									value={nameIt}
									onChange={e => setNameIt(e.target.value)}
									className='w-full border rounded px-3 py-2'
									placeholder='Materiale'
								/>
							</div>
						</div>

						{/* Тип параметра */}
						<div>
							<label className='block text-sm font-medium mb-1'>
								Тип параметра <span className='text-red-500'>*</span>
							</label>
							<select
								value={type}
								onChange={e =>
									setType(
										e.target
											.value as ParameterEditFormProps['parameter']['type']
									)
								}
								className='w-full border rounded px-3 py-2'
								disabled={isEdit} // Нельзя изменить тип у существующего параметра
							>
								<option value='NUMBER'>Число (NUMBER)</option>
								<option value='SELECT'>Выбор из списка (SELECT)</option>
								<option value='COLOR'>Цвет (COLOR)</option>
								<option value='TEXT'>Текст (TEXT)</option>
								<option value='BOOLEAN'>Да/Нет (BOOLEAN)</option>
							</select>
							{isEdit && (
								<p className='text-xs text-gray-500 mt-1'>
									Тип параметра нельзя изменить после создания
								</p>
							)}
						</div>

						{/* Описание */}
						<div>
							<label className='block text-sm font-medium mb-1'>Описание</label>
							<textarea
								value={description}
								onChange={e => setDescription(e.target.value)}
								className='w-full border rounded px-3 py-2'
								rows={2}
								placeholder='Материал изготовления двери или окна'
							/>
						</div>

						{/* Единица измерения (только для NUMBER) */}
						{type === 'NUMBER' && (
							<div>
								<label className='block text-sm font-medium mb-1'>
									Единица измерения
								</label>
								<input
									type='text'
									value={unit}
									onChange={e => setUnit(e.target.value)}
									className='w-full border rounded px-3 py-2'
									placeholder='мм, см, кг'
								/>
							</div>
						)}
					</div>

					{/* Настройки для числовых параметров */}
					{type === 'NUMBER' && (
						<div className='space-y-4 border-t pt-4'>
							<h3 className='font-medium text-lg'>
								Настройки числового параметра
							</h3>

							<div className='grid grid-cols-3 gap-4'>
								<div>
									<label className='block text-sm font-medium mb-1'>
										Минимум
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
										placeholder='400'
									/>
								</div>

								<div>
									<label className='block text-sm font-medium mb-1'>
										Максимум
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
										placeholder='3000'
									/>
								</div>

								<div>
									<label className='block text-sm font-medium mb-1'>Шаг</label>
									<input
										type='number'
										value={step || ''}
										onChange={e =>
											setStep(
												e.target.value ? Number(e.target.value) : undefined
											)
										}
										className='w-full border rounded px-3 py-2'
										placeholder='10'
									/>
								</div>
							</div>
						</div>
					)}

					{/* Значения параметра (для SELECT и COLOR) */}
					{(type === 'SELECT' || type === 'COLOR') && (
						<div className='space-y-4 border-t pt-4'>
							<div className='flex items-center justify-between'>
								<h3 className='font-medium text-lg'>Значения параметра</h3>
								<button
									type='button'
									onClick={handleAddValue}
									className='flex items-center space-x-2 px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm'
								>
									<Plus className='w-4 h-4' />
									<span>Добавить значение</span>
								</button>
							</div>

							{values.length === 0 ? (
								<div className='text-center py-8 text-gray-500 border-2 border-dashed rounded'>
									Нет значений. Нажмите "Добавить значение" для создания.
								</div>
							) : (
								<div className='space-y-2'>
									{values.map((value, index) => (
										<div
											key={index}
											className='flex items-start space-x-2 p-3 bg-gray-50 rounded border'
										>
											{/* Drag Handle */}
											<div className='flex flex-col space-y-1 mt-2'>
												<button
													type='button'
													onClick={() => handleMoveValueUp(index)}
													disabled={index === 0}
													className='text-gray-400 hover:text-gray-600 disabled:opacity-30'
												>
													<GripVertical className='w-4 h-4' />
												</button>
											</div>

											{/* Fields */}
											<div className='flex-1 grid grid-cols-2 gap-2'>
												{/* Значение RU */}
												<div>
													<label className='block text-xs text-gray-600 mb-1'>
														Значение (RU) *
													</label>
													<input
														type='text'
														value={value.value}
														onChange={e =>
															handleUpdateValue(index, 'value', e.target.value)
														}
														className='w-full border rounded px-2 py-1 text-sm'
														placeholder='Алюминий'
														required
													/>
												</div>

												{/* Значение IT */}
												<div>
													<label className='block text-xs text-gray-600 mb-1'>
														Значение (IT)
													</label>
													<input
														type='text'
														value={value.valueIt}
														onChange={e =>
															handleUpdateValue(
																index,
																'valueIt',
																e.target.value
															)
														}
														className='w-full border rounded px-2 py-1 text-sm'
														placeholder='Alluminio'
													/>
												</div>

												{/* Для COLOR - hex и RAL */}
												{type === 'COLOR' && (
													<>
														<div>
															<label className='block text-xs text-gray-600 mb-1'>
																HEX Цвет
															</label>
															<div className='flex items-center space-x-2'>
																<input
																	type='color'
																	value={value.hexColor || '#FFFFFF'}
																	onChange={e =>
																		handleUpdateValue(
																			index,
																			'hexColor',
																			e.target.value
																		)
																	}
																	className='w-10 h-8 border rounded cursor-pointer'
																/>
																<input
																	type='text'
																	value={value.hexColor || '#FFFFFF'}
																	onChange={e =>
																		handleUpdateValue(
																			index,
																			'hexColor',
																			e.target.value
																		)
																	}
																	className='flex-1 border rounded px-2 py-1 text-sm'
																	placeholder='#FFFFFF'
																/>
															</div>
														</div>

														<div>
															<label className='block text-xs text-gray-600 mb-1'>
																RAL Код
															</label>
															<input
																type='text'
																value={value.ralCode || ''}
																onChange={e =>
																	handleUpdateValue(
																		index,
																		'ralCode',
																		e.target.value
																	)
																}
																className='w-full border rounded px-2 py-1 text-sm'
																placeholder='RAL 9010'
															/>
														</div>
													</>
												)}
											</div>

											{/* Delete Button */}
											<button
												type='button'
												onClick={() => handleRemoveValue(index)}
												className='text-red-500 hover:text-red-700 mt-6'
											>
												<Trash2 className='w-4 h-4' />
											</button>
										</div>
									))}
								</div>
							)}
						</div>
					)}

					{/* Actions */}
					<div className='flex items-center justify-end space-x-3 border-t pt-4'>
						<button
							type='button'
							onClick={onClose}
							className='px-4 py-2 border rounded hover:bg-gray-50'
							disabled={isSaving}
						>
							Отмена
						</button>
						<button
							type='submit'
							className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300'
							disabled={isSaving}
						>
							{isSaving ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}
