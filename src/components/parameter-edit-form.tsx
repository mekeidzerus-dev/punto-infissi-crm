'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { X, Plus, Trash2, GripVertical, Save } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

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
	categoryId?: string // ID категории для автопривязки при создании из конфигуратора
	isQuickCreate?: boolean // Флаг быстрого создания из конфигуратора
}

export default function ParameterEditForm({
	parameter,
	onSave,
	onClose,
	categoryId,
	isQuickCreate = false,
}: ParameterEditFormProps) {
	const { t, locale } = useLanguage()
	const isEdit = !!parameter

	const [name, setName] = useState(
		locale === 'ru'
			? parameter?.name || ''
			: parameter?.nameIt || parameter?.name || ''
	)
	const [unit, setUnit] = useState(parameter?.unit || '')

	// Поля для перевода (другой язык)
	const [nameTranslation, setNameTranslation] = useState(
		locale === 'ru' ? parameter?.nameIt || '' : parameter?.name || ''
	)

	const [type, setType] = useState<
		'TEXT' | 'NUMBER' | 'SELECT' | 'COLOR' | 'BOOLEAN'
	>(parameter?.type || 'SELECT')

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
			setError(
				locale === 'ru'
					? 'Название параметра обязательно'
					: 'Il nome del parametro è obbligatorio'
			)
			return
		}

		if ((type === 'SELECT' || type === 'COLOR') && values.length === 0) {
			setError(
				locale === 'ru'
					? 'Добавьте хотя бы одно значение для параметра'
					: 'Aggiungi almeno un valore per il parametro'
			)
			return
		}

		// Проверка заполненности значений
		if (type === 'SELECT' || type === 'COLOR') {
			const emptyValues = values.filter(v => {
				// Проверяем основное значение в зависимости от языка
				const mainValue = locale === 'ru' ? v.value : v.valueIt || v.value
				return !mainValue.trim()
			})
			if (emptyValues.length > 0) {
				setError(
					locale === 'ru'
						? 'Все значения должны быть заполнены'
						: 'Tutti i valori devono essere compilati'
				)
				return
			}
		}

		setIsSaving(true)

		try {
			const data = {
				name: name.trim(),
				nameIt: nameTranslation.trim() || null,
				type,
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

			// Если это быстрое создание из конфигуратора, используем API quick-create
			if (isQuickCreate) {
				const response = await fetch('/api/parameters/quick-create', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						...data,
						// isGlobal и categoryId не передаются - параметр создается без привязки
						// Привязка произойдет при создании товара
					}),
				})

				if (!response.ok) {
					const error = await response.json()
					throw new Error(error.error || 'Failed to create parameter')
				}

				const created = await response.json()
				// Передаем созданный параметр с ID для последующей привязки
				await onSave(created)
			} else {
				await onSave(data)
			}

			onClose()
		} catch (err: any) {
			setError(
				err.message ||
					(locale === 'ru'
						? 'Ошибка при сохранении параметра'
						: 'Errore durante il salvataggio del parametro')
			)
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className='max-w-4xl max-h-[90vh] flex flex-col'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2'>
						{isEdit ? (
							<>
								<Save className='h-5 w-5' />
								{locale === 'ru'
									? 'Редактировать параметр'
									: 'Modifica parametro'}
							</>
						) : (
							<>
								<Plus className='h-5 w-5' />
								{locale === 'ru' ? 'Создать параметр' : 'Crea parametro'}
							</>
						)}
					</DialogTitle>
				</DialogHeader>

				<div className='flex-1 overflow-y-auto'>
					<form onSubmit={handleSubmit} className='space-y-6'>
						{/* Error */}
						{error && (
							<div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg'>
								{error}
							</div>
						)}

						{/* Основная информация */}
						<Card className='p-6'>
							<h3 className='font-semibold text-lg mb-4'>
								{locale === 'ru'
									? 'Основная информация'
									: 'Informazioni principali'}
							</h3>

							<div className='space-y-4'>
								{/* Название и перевод */}
								<div className='grid grid-cols-2 gap-4'>
									<div className='space-y-2'>
										<Label htmlFor='name'>
											{locale === 'ru' ? 'Название' : 'Nome'}{' '}
											<span className='text-red-500'>*</span>
										</Label>
										<Input
											id='name'
											type='text'
											value={name}
											onChange={e => setName(e.target.value)}
											placeholder={locale === 'ru' ? 'Материал' : 'Materiale'}
											required
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='nameTranslation'>
											{locale === 'ru' ? 'Перевод' : 'Traduzione'}
										</Label>
										<Input
											id='nameTranslation'
											type='text'
											value={nameTranslation}
											onChange={e => setNameTranslation(e.target.value)}
											placeholder={locale === 'ru' ? 'Materiale' : 'Материал'}
										/>
									</div>
								</div>

								{/* Тип параметра */}
								<div className='space-y-2'>
									<Label htmlFor='type'>
										{locale === 'ru' ? 'Тип параметра' : 'Tipo parametro'}{' '}
										<span className='text-red-500'>*</span>
									</Label>
									<Select
										value={type}
										onValueChange={value =>
											setType(
												value as
													| 'TEXT'
													| 'NUMBER'
													| 'SELECT'
													| 'COLOR'
													| 'BOOLEAN'
											)
										}
										disabled={isEdit}
									>
										<SelectTrigger>
											<SelectValue
												placeholder={
													locale === 'ru' ? 'Выберите тип' : 'Seleziona tipo'
												}
											/>
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='NUMBER'>
												{locale === 'ru' ? 'Число (NUMBER)' : 'Numero (NUMBER)'}
											</SelectItem>
											<SelectItem value='SELECT'>
												{locale === 'ru'
													? 'Выбор из списка (SELECT)'
													: 'Selezione da lista (SELECT)'}
											</SelectItem>
											<SelectItem value='COLOR'>
												{locale === 'ru' ? 'Цвет (COLOR)' : 'Colore (COLOR)'}
											</SelectItem>
											<SelectItem value='TEXT'>
												{locale === 'ru' ? 'Текст (TEXT)' : 'Testo (TEXT)'}
											</SelectItem>
											<SelectItem value='BOOLEAN'>
												{locale === 'ru'
													? 'Да/Нет (BOOLEAN)'
													: 'Sì/No (BOOLEAN)'}
											</SelectItem>
										</SelectContent>
									</Select>
									{isEdit && (
										<p className='text-xs text-gray-500'>
											{locale === 'ru'
												? 'Тип параметра нельзя изменить после создания'
												: 'Il tipo di parametro non può essere modificato dopo la creazione'}
										</p>
									)}
								</div>

								{/* Единица измерения (только для NUMBER) */}
								{type === 'NUMBER' && (
									<div className='space-y-2'>
										<Label htmlFor='unit'>
											{locale === 'ru'
												? 'Единица измерения'
												: 'Unità di misura'}
										</Label>
										<Input
											id='unit'
											type='text'
											value={unit}
											onChange={e => setUnit(e.target.value)}
											placeholder={
												locale === 'ru' ? 'мм, см, кг' : 'mm, cm, kg'
											}
										/>
									</div>
								)}
							</div>
						</Card>

						{/* Настройки для числовых параметров */}
						{type === 'NUMBER' && (
							<Card className='p-6'>
								<h3 className='font-semibold text-lg mb-4'>
									{locale === 'ru'
										? 'Настройки числового параметра'
										: 'Impostazioni parametro numerico'}
								</h3>

								<div className='grid grid-cols-3 gap-4'>
									<div className='space-y-2'>
										<Label htmlFor='minValue'>
											{locale === 'ru' ? 'Минимум' : 'Minimo'}
										</Label>
										<Input
											id='minValue'
											type='number'
											value={minValue || ''}
											onChange={e =>
												setMinValue(
													e.target.value ? Number(e.target.value) : undefined
												)
											}
											placeholder='400'
										/>
									</div>

									<div className='space-y-2'>
										<Label htmlFor='maxValue'>
											{locale === 'ru' ? 'Максимум' : 'Massimo'}
										</Label>
										<Input
											id='maxValue'
											type='number'
											value={maxValue || ''}
											onChange={e =>
												setMaxValue(
													e.target.value ? Number(e.target.value) : undefined
												)
											}
											placeholder='3000'
										/>
									</div>

									<div className='space-y-2'>
										<Label htmlFor='step'>
											{locale === 'ru' ? 'Шаг' : 'Passo'}
										</Label>
										<Input
											id='step'
											type='number'
											value={step || ''}
											onChange={e =>
												setStep(
													e.target.value ? Number(e.target.value) : undefined
												)
											}
											placeholder='10'
										/>
									</div>
								</div>
							</Card>
						)}

						{/* Значения параметра (для SELECT и COLOR) */}
						{(type === 'SELECT' || type === 'COLOR') && (
							<Card className='p-6'>
								<div className='flex items-center justify-between mb-4'>
									<h3 className='font-semibold text-lg'>
										{locale === 'ru'
											? 'Значения параметра'
											: 'Valori parametro'}
									</h3>
									<Button
										type='button'
										onClick={handleAddValue}
										variant='outline'
										size='sm'
										className='flex items-center gap-2'
									>
										<Plus className='h-4 w-4' />
										{locale === 'ru' ? 'Добавить значение' : 'Aggiungi valore'}
									</Button>
								</div>

								{values.length === 0 ? (
									<div className='text-center py-8 text-gray-500 border-2 border-dashed rounded-lg'>
										{locale === 'ru'
											? 'Нет значений. Нажмите "Добавить значение" для создания.'
											: 'Nessun valore. Clicca "Aggiungi valore" per creare.'}
									</div>
								) : (
									<div className='space-y-3'>
										{values.map((value, index) => (
											<Card key={index} className='p-4'>
												<div className='flex items-start gap-3'>
													{/* Drag Handle */}
													<div className='flex flex-col gap-1 mt-2'>
														<Button
															type='button'
															variant='ghost'
															size='sm'
															onClick={() => handleMoveValueUp(index)}
															disabled={index === 0}
															className='h-6 w-6 p-0'
														>
															<GripVertical className='w-4 h-4' />
														</Button>
													</div>

													{/* Fields */}
													<div className='flex-1 space-y-3'>
														{/* Основное значение и перевод */}
														<div className='grid grid-cols-2 gap-3'>
															<div className='space-y-1'>
																<Label className='text-xs text-gray-600'>
																	{locale === 'ru' ? 'Значение' : 'Valore'} *
																</Label>
																<Input
																	type='text'
																	value={
																		locale === 'ru'
																			? value.value
																			: value.valueIt || value.value
																	}
																	onChange={e => {
																		if (locale === 'ru') {
																			handleUpdateValue(
																				index,
																				'value',
																				e.target.value
																			)
																		} else {
																			handleUpdateValue(
																				index,
																				'valueIt',
																				e.target.value
																			)
																		}
																	}}
																	placeholder={
																		locale === 'ru' ? 'Алюминий' : 'Alluminio'
																	}
																	required
																	size='sm'
																/>
															</div>
															<div className='space-y-1'>
																<Label className='text-xs text-gray-600'>
																	{locale === 'ru' ? 'Перевод' : 'Traduzione'}
																</Label>
																<Input
																	type='text'
																	value={
																		locale === 'ru'
																			? value.valueIt || ''
																			: value.value || ''
																	}
																	onChange={e => {
																		if (locale === 'ru') {
																			handleUpdateValue(
																				index,
																				'valueIt',
																				e.target.value
																			)
																		} else {
																			handleUpdateValue(
																				index,
																				'value',
																				e.target.value
																			)
																		}
																	}}
																	placeholder={
																		locale === 'ru' ? 'Alluminio' : 'Алюминий'
																	}
																	size='sm'
																/>
															</div>
														</div>

														{/* Для COLOR - hex и RAL */}
														{type === 'COLOR' && (
															<>
																<div className='space-y-1'>
																	<Label className='text-xs text-gray-600'>
																		{locale === 'ru'
																			? 'HEX Цвет'
																			: 'Colore HEX'}
																	</Label>
																	<div className='flex items-center gap-2'>
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
																		<Input
																			type='text'
																			value={value.hexColor || '#FFFFFF'}
																			onChange={e =>
																				handleUpdateValue(
																					index,
																					'hexColor',
																					e.target.value
																				)
																			}
																			placeholder='#FFFFFF'
																			size='sm'
																		/>
																	</div>
																</div>

																<div className='space-y-1'>
																	<Label className='text-xs text-gray-600'>
																		{locale === 'ru' ? 'RAL Код' : 'Codice RAL'}
																	</Label>
																	<Input
																		type='text'
																		value={value.ralCode || ''}
																		onChange={e =>
																			handleUpdateValue(
																				index,
																				'ralCode',
																				e.target.value
																			)
																		}
																		placeholder='RAL 9010'
																		size='sm'
																	/>
																</div>
															</>
														)}
													</div>

													{/* Delete Button */}
													<Button
														type='button'
														variant='ghost'
														size='sm'
														onClick={() => handleRemoveValue(index)}
														className='text-red-500 hover:text-red-700 h-8 w-8 p-0'
													>
														<Trash2 className='w-4 h-4' />
													</Button>
												</div>
											</Card>
										))}
									</div>
								)}
							</Card>
						)}
					</form>
				</div>

				{/* Закрепленная панель действий */}
				<div className='flex items-center justify-end gap-3 pt-4 border-t bg-white'>
					<Button
						type='button'
						variant='outline'
						onClick={onClose}
						disabled={isSaving}
						className='bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
					>
						{locale === 'ru' ? 'Отмена' : 'Annulla'}
					</Button>
					<Button
						type='submit'
						disabled={isSaving}
						className='bg-green-600 hover:bg-green-700 text-white'
						onClick={handleSubmit}
					>
						{isSaving
							? locale === 'ru'
								? 'Сохранение...'
								: 'Salvataggio...'
							: isEdit
							? locale === 'ru'
								? 'Сохранить'
								: 'Salva'
							: locale === 'ru'
							? 'Создать'
							: 'Crea'}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
