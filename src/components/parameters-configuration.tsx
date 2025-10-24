'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Plus, Check, X } from 'lucide-react'
import { ProductVisualization } from './product-visualization'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'

interface Parameter {
	id: string
	name: string
	type: 'TEXT' | 'NUMBER' | 'SELECT' | 'COLOR' | 'BOOLEAN'
	isRequired: boolean
	isVisible: boolean
	values?: string[]
	min?: number
	max?: number
	step?: number
	unit?: string
	group?: string
}

interface ParametersConfigurationProps {
	categoryId: string
	supplierId: number
	onBack: () => void
	onComplete: (configuration: Record<string, any>) => void
	onCancel: () => void
}

export function ParametersConfiguration({
	categoryId,
	supplierId,
	onBack,
	onComplete,
	onCancel,
}: ParametersConfigurationProps) {
	const { t } = useLanguage()
	const [parameters, setParameters] = useState<Parameter[]>([])
	const [configuration, setConfiguration] = useState<Record<string, any>>({
		width: '',
		height: '',
		depth: '',
	})
	const [validationErrors, setValidationErrors] = useState<
		Record<string, string>
	>({})
	const [loading, setLoading] = useState(true)
	const [comboStates, setComboStates] = useState<
		Record<string, { isOpen: boolean; newValue: string }>
	>({})

	// Загрузка параметров категории
	useEffect(() => {
		const loadParameters = async () => {
			if (!categoryId) return

			setLoading(true)
			try {
				const response = await fetch(
					`/api/category-parameters?categoryId=${categoryId}`
				)
				if (response.ok) {
					const data = await response.json()
					setParameters(data)
					console.log('📋 Loaded parameters:', data)
				} else {
					console.error('Failed to load parameters')
				}
			} catch (error) {
				console.error('Error loading parameters:', error)
			} finally {
				setLoading(false)
			}
		}

		loadParameters()
	}, [categoryId])

	// Обработка клика вне комбо-полей для их закрытия
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as HTMLElement
			if (!target.closest('[data-combo-field]')) {
				// Закрываем все открытые комбо-поля
				setComboStates(prev => {
					const newStates = { ...prev }
					Object.keys(newStates).forEach(key => {
						newStates[key] = { ...newStates[key], isOpen: false }
					})
					return newStates
				})
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	// Обновление параметра
	const updateParameter = (parameterId: string, value: any) => {
		setConfiguration(prev => ({
			...prev,
			[parameterId]: value,
		}))
		// Очистка ошибки валидации
		if (validationErrors[parameterId]) {
			setValidationErrors(prev => {
				const newErrors = { ...prev }
				delete newErrors[parameterId]
				return newErrors
			})
		}
	}

	// Добавление нового значения для параметра
	const addNewValue = async (parameterId: string, value: string) => {
		try {
			const response = await fetch('/api/parameter-values/quick-add', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ parameterId, value }),
			})

			if (response.ok) {
				const newValue = await response.json()
				// Обновляем параметры с новым значением
				setParameters(prev =>
					prev.map(param =>
						param.id === parameterId
							? { ...param, values: [...(param.values || []), newValue.value] }
							: param
					)
				)
				return newValue.value
			}
		} catch (error) {
			console.error('Error adding new value:', error)
		}
		return null
	}

	// Валидация конфигурации
	const validateConfiguration = () => {
		const errors: Record<string, string> = {}

		// Валидация размеров
		if (!configuration.width || configuration.width <= 0) {
			errors.width = 'Ширина должна быть больше 0'
		}
		if (!configuration.height || configuration.height <= 0) {
			errors.height = 'Высота должна быть больше 0'
		}

		// Валидация параметров
		parameters.forEach(parameter => {
			if (
				parameter.isRequired &&
				(!configuration[parameter.id] || configuration[parameter.id] === '')
			) {
				errors[parameter.id] = `${parameter.name} обязательно для заполнения`
			}
		})

		setValidationErrors(errors)
		return Object.keys(errors).length === 0
	}

	// Завершение конфигурации
	const handleComplete = () => {
		if (validateConfiguration()) {
			onComplete(configuration)
		}
	}

	// Рендер комбо-поля для SELECT и COLOR параметров
	const renderComboField = (parameter: any) => {
		const value = configuration[parameter.id]
		const error = validationErrors[parameter.id]
		const comboState = comboStates[parameter.id] || {
			isOpen: false,
			newValue: '',
		}

		const handleSelectValue = (selectedValue: string) => {
			updateParameter(parameter.id, selectedValue)
			setComboStates(prev => ({
				...prev,
				[parameter.id]: { ...comboState, isOpen: false },
			}))
		}

		const handleAddNewValue = async () => {
			if (comboState.newValue.trim()) {
				const addedValue = await addNewValue(
					parameter.id,
					comboState.newValue.trim()
				)
				if (addedValue) {
					updateParameter(parameter.id, addedValue)
					setComboStates(prev => ({
						...prev,
						[parameter.id]: { isOpen: false, newValue: '' },
					}))
				}
			}
		}

		const toggleCombo = () => {
			setComboStates(prev => ({
				...prev,
				[parameter.id]: { ...comboState, isOpen: !comboState.isOpen },
			}))
		}

		const updateNewValue = (newVal: string) => {
			setComboStates(prev => ({
				...prev,
				[parameter.id]: { ...comboState, newValue: newVal },
			}))
		}

		return (
			<div className='space-y-1' data-combo-field={parameter.id}>
				<div className='relative'>
					{/* Поле ввода */}
					<div className='flex items-center space-x-2'>
						<div className='relative flex-1'>
							<div className='absolute -left-2 top-1/2 transform -translate-y-1/2 bg-cyan-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center z-10'>
								A
							</div>
							<Input
								id={parameter.id}
								type='text'
								value={value || ''}
								onChange={e => updateParameter(parameter.id, e.target.value)}
								onFocus={() =>
									setComboStates(prev => ({
										...prev,
										[parameter.id]: { ...comboState, isOpen: true },
									}))
								}
								className={cn('h-9', error && 'border-red-500')}
								placeholder={parameter.name}
							/>

							{/* Кнопка выпадающего списка */}
							<div className='absolute -right-2 top-1/2 transform -translate-y-1/2 bg-cyan-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center z-10'>
								B
							</div>
							<button
								type='button'
								onClick={toggleCombo}
								className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
							>
								<svg
									className='w-4 h-4'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M19 9l-7 7-7-7'
									/>
								</svg>
							</button>
						</div>

						{parameter.isRequired && (
							<span className='text-red-500 text-xs'>*</span>
						)}
					</div>

					{/* Выпадающий список */}
					{comboState.isOpen && (
						<div className='absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto'>
							{/* Существующие значения */}
							{parameter.values?.map((val: string, index: number) => (
								<div
									key={val}
									className='px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm relative'
									onClick={() => handleSelectValue(val)}
								>
									<div className='absolute -left-2 top-1/2 transform -translate-y-1/2 bg-teal-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center z-10'>
										C{index + 1}
									</div>
									{val}
								</div>
							))}

							{/* Разделитель */}
							{parameter.values?.length > 0 && (
								<div className='border-t border-gray-200'></div>
							)}

							{/* Добавление нового значения */}
							<div className='p-2 border-t border-gray-200 relative'>
								<div className='absolute -left-2 top-1/2 transform -translate-y-1/2 bg-lime-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center z-10'>
									D
								</div>
								<div className='flex space-x-2'>
									<Input
										type='text'
										value={comboState.newValue}
										onChange={e => updateNewValue(e.target.value)}
										placeholder='Добавить новое значение'
										className='h-8 text-sm'
										onKeyPress={e => {
											if (e.key === 'Enter') {
												handleAddNewValue()
											}
										}}
									/>
									<button
										type='button'
										onClick={handleAddNewValue}
										className='px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600'
									>
										+
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
				{error && <p className='text-xs text-red-500'>{error}</p>}
			</div>
		)
	}

	// Рендер поля параметра
	const renderParameterField = (parameter: any) => {
		const value = configuration[parameter.id]
		const error = validationErrors[parameter.id]

		switch (parameter.type) {
			case 'TEXT':
				return (
					<div className='space-y-1'>
						<div className='flex items-center space-x-2'>
							<Input
								id={parameter.id}
								type='text'
								value={value || ''}
								onChange={e => updateParameter(parameter.id, e.target.value)}
								className={cn('h-9', error && 'border-red-500')}
								placeholder={parameter.name}
							/>
							{parameter.isRequired && (
								<span className='text-red-500 text-xs'>*</span>
							)}
						</div>
						{error && <p className='text-xs text-red-500'>{error}</p>}
					</div>
				)

			case 'NUMBER':
				return (
					<div className='space-y-1'>
						<div className='flex items-center space-x-2'>
							<Input
								id={parameter.id}
								type='number'
								value={value || ''}
								onChange={e =>
									updateParameter(
										parameter.id,
										parseFloat(e.target.value) || ''
									)
								}
								min={parameter.min || 1}
								max={parameter.max || 10000}
								step={parameter.step || 1}
								className={cn('h-9', error && 'border-red-500')}
								placeholder={parameter.name}
							/>
							{parameter.unit && (
								<span className='text-xs text-gray-500'>{parameter.unit}</span>
							)}
							{parameter.isRequired && (
								<span className='text-red-500 text-xs'>*</span>
							)}
						</div>
						{error && <p className='text-xs text-red-500'>{error}</p>}
					</div>
				)

			case 'SELECT':
			case 'COLOR':
				return renderComboField(parameter)

			default:
				return null
		}
	}

	// Рендер поля размера
	const renderDimensionField = (
		dimension: string,
		labelKey: string,
		unitKey: string = 'mm',
		isRequired: boolean = true
	) => {
		const value = configuration[dimension]
		const error = validationErrors[dimension]

		return (
			<div className='space-y-1'>
				<div className='flex items-center space-x-2'>
					<Input
						id={dimension}
						type='number'
						value={value || ''}
						onChange={e => {
							const inputValue = e.target.value
							if (inputValue === '') {
								updateParameter(dimension, '')
							} else {
								updateParameter(dimension, parseFloat(inputValue) || 0)
							}
						}}
						min={1}
						max={10000}
						step={1}
						className={cn('h-9', error && 'border-red-500')}
						placeholder={t(`${dimension}Placeholder`)}
					/>
					{isRequired && <span className='text-red-500 text-xs'>*</span>}
				</div>
				{error && <p className='text-xs text-red-500'>{error}</p>}
			</div>
		)
	}

	if (loading) {
		return (
			<div className='flex items-center justify-center h-64'>
				<div className='text-gray-500'>Загрузка параметров...</div>
			</div>
		)
	}

	return (
		<div className='h-full flex flex-col'>
			{/* Основная область - прокручиваемая */}
			<div className='flex-1 overflow-y-auto min-h-0'>
				<div className='grid grid-cols-2 gap-8 p-6'>
					{/* Левая колонка - Все параметры */}
					<div className='space-y-6'>
						{/* Размеры */}
						<div className='bg-white border rounded-lg p-4 relative'>
							<div className='absolute -top-2 -left-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center z-10'>
								1
							</div>
							<h3 className='font-semibold text-lg mb-4 text-center'>
								Размеры
							</h3>
							<div className='space-y-4'>
								<div className='relative'>
									<div className='absolute -left-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center z-10'>
										1.1
									</div>
									{renderDimensionField('width', 'width', 'mm', true)}
								</div>
								<div className='relative'>
									<div className='absolute -left-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center z-10'>
										1.2
									</div>
									{renderDimensionField('height', 'height', 'mm', true)}
								</div>
								<div className='relative'>
									<div className='absolute -left-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center z-10'>
										1.3
									</div>
									{renderDimensionField('depth', 'depth', 'mm', false)}
								</div>
							</div>
						</div>

						{/* Параметры категории */}
						{parameters.length > 0 && (
							<div className='bg-white border rounded-lg p-4 relative'>
								<div className='absolute -top-2 -left-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center z-10'>
									2
								</div>
								<h3 className='font-semibold text-lg mb-4 text-center'>
									Параметры
								</h3>
								<div className='space-y-4'>
									{parameters.map((parameter, index) => (
										<div key={parameter.id} className='relative'>
											<div className='absolute -left-2 top-1/2 transform -translate-y-1/2 bg-green-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center z-10'>
												{2}.{index + 1}
											</div>
											{renderParameterField(parameter)}
										</div>
									))}
								</div>
							</div>
						)}
					</div>

					{/* Правая колонка - Визуализация */}
					<div className='bg-white border rounded-lg p-3 relative'>
						<div className='absolute -top-2 -left-2 bg-purple-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center z-10'>
							3
						</div>
						<ProductVisualization
							configuration={configuration}
							parameters={parameters}
							className='w-full h-[200px]'
						/>
					</div>
				</div>
			</div>
		</div>
	)
}
