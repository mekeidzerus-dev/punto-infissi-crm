'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { logger } from '@/lib/logger'
import { Plus, X } from 'lucide-react'
import { ProductVisualization } from './product-visualization'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'
import { ParameterValueAddDialog } from './parameter-value-add-dialog'
import { toast } from 'sonner'

interface Parameter {
	id: string
	name: string
	nameIt?: string // Итальянское название
	type:
		| 'TEXT'
		| 'NUMBER'
		| 'SELECT'
		| 'COLOR'
		| 'BOOLEAN'
		| 'MULTI_SELECT'
		| 'DATE'
		| 'RANGE'
	isRequired: boolean
	isVisible: boolean
	isGlobal?: boolean // Глобальный параметр (отображается во всех категориях)
	isLinked?: boolean // Привязан ли к категории
	isSystem?: boolean // Системный параметр (размеры)
	values?: Array<{
		id?: string // ID значения (если есть)
		value: string
		valueIt?: string
		displayName?: string
		hexColor?: string
	}>
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
	onComplete: (
		configuration: Record<string, string | number | string[]>,
		parameters: Parameter[]
	) => void
	onCancel: () => void
	onParameterReload?: () => void // Callback для перезагрузки списка параметров
	isEditMode?: boolean // Режим редактирования для отвязки параметров
	reloadTrigger?: number // Триггер для принудительной перезагрузки параметров
}

export function ParametersConfiguration({
	categoryId,
	supplierId,
	onBack,
	onComplete,
	onCancel,
	onParameterReload,
	isEditMode = false,
	reloadTrigger,
}: ParametersConfigurationProps) {
	const { locale } = useLanguage()

	// В продакшене locale всегда определен благодаря LanguageProvider и useLanguage
	// Если locale undefined, useLanguage выбросит ошибку, что правильнее чем скрывать проблему
	const currentLocale: 'ru' | 'it' = locale

	// Логируем изменение isEditMode (только в dev)
	useEffect(() => {
		if (process.env.NODE_ENV === 'development') {
			console.log('🔧 isEditMode changed:', isEditMode)
		}
	}, [isEditMode])

	const [parameters, setParameters] = useState<Parameter[]>([])
	const [configuration, setConfiguration] = useState<Record<string, any>>({})
	const [validationErrors, setValidationErrors] = useState<
		Record<string, string>
	>({})
	const [loading, setLoading] = useState(true)
	const [customNotes, setCustomNotes] = useState('') // Дополнительная информация
	const [addValueDialogOpen, setAddValueDialogOpen] = useState(false)
	const [selectedParameterForValue, setSelectedParameterForValue] =
		useState<Parameter | null>(null)

	// Используем ref для хранения актуальных значений
	const configurationRef = useRef(configuration)
	const parametersRef = useRef(parameters)

	// Обновляем ref при изменении состояния
	useEffect(() => {
		configurationRef.current = configuration
	}, [configuration])

	useEffect(() => {
		parametersRef.current = parameters
	}, [parameters])

	// Загрузка параметров категории (общая функция)
	const loadParameters = useCallback(async () => {
		if (!categoryId) return

		setLoading(true)
		try {
			const response = await fetch(
				`/api/category-parameters?categoryId=${categoryId}`
			)
			if (response.ok) {
				const data = await response.json()
				setParameters(data)
				logger.info('📋 Loaded parameters:', data)
			} else {
				logger.error('Failed to load parameters')
			}
		} catch (error) {
			logger.error('Error loading parameters:', error)
		} finally {
			setLoading(false)
		}
	}, [categoryId])

	// Загрузка параметров при монтировании
	useEffect(() => {
		loadParameters()
	}, [loadParameters])

	// Перезагрузка параметров при изменении reloadTrigger (после создания нового параметра)
	useEffect(() => {
		if (reloadTrigger && reloadTrigger > 0) {
			logger.info('🔄 Reloading parameters after parameter creation...')
			loadParameters()
		}
	}, [reloadTrigger, loadParameters])

	// Обработка клика вне комбо-полей для их закрытия

	// Обновление параметра
	const updateParameter = (parameterId: string, value: any) => {
		// Убеждаемся что не сохраняем объект вместо строки
		// Если value - объект со свойством value, извлекаем строку
		let stringValue =
			typeof value === 'object' &&
			value !== null &&
			!Array.isArray(value) &&
			'value' in value
				? value.value
				: value

		// Для булевых значений конвертируем в строку 'true'/'false'
		if (typeof stringValue === 'boolean') {
			stringValue = stringValue ? 'true' : 'false'
		}

		setConfiguration(prev => ({
			...prev,
			[parameterId]: stringValue,
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

	// Валидация конфигурации
	const validateConfiguration = () => {
		const errors: Record<string, string> = {}

		// Валидация только реальных параметров
		parameters.forEach(parameter => {
			if (parameter.isRequired) {
				const value = configuration[parameter.id]
				// Проверяем что значение есть и это не пустая строка или пустой массив
				const isEmpty =
					!value ||
					(typeof value === 'string' && value.trim() === '') ||
					(Array.isArray(value) && value.length === 0) ||
					(Array.isArray(value) &&
						value.every(
							(v: any) => !v || (typeof v === 'string' && v.trim() === '')
						))
				if (isEmpty) {
					errors[parameter.id] =
						currentLocale === 'ru'
							? `${parameter.name} обязательно для заполнения`
							: `${parameter.name} è obbligatorio`
				}
			}
		})

		setValidationErrors(errors)
		return Object.keys(errors).length === 0
	}

	// Функция валидации (используем refs для получения актуальных данных)
	const validateConfigurationRefs = useCallback(() => {
		const currentConfig = configurationRef.current
		const currentParams = parametersRef.current

		// Критическая проверка: если configuration пустой {}, не создаем продукт
		if (!currentConfig || Object.keys(currentConfig).length === 0) {
			logger.warn('⚠️ Configuration is empty, cannot create product')
			return false
		}

		const errors: Record<string, string> = {}

		// Находим параметр "Модель" - он всегда обязателен
		const modelParameter = currentParams.find(
			p => p.name === 'Модель' || p.nameIt === 'Modello'
		)

		// Проверяем обязательность параметра "Модель"
		if (modelParameter) {
			const modelValue = currentConfig[modelParameter.id]
			const isEmpty =
				!modelValue ||
				(typeof modelValue === 'string' && modelValue.trim() === '')
			if (isEmpty) {
				errors[modelParameter.id] =
					currentLocale === 'ru'
						? 'Модель обязательна для заполнения'
						: 'Il modello è obbligatorio'
			}
		}

		// Валидация остальных обязательных параметров
		currentParams.forEach(parameter => {
			// Пропускаем "Модель", так как уже проверили выше
			if (parameter.name === 'Модель' || parameter.nameIt === 'Modello') {
				return
			}

			if (parameter.isRequired) {
				const value = currentConfig[parameter.id]
				const isEmpty =
					!value ||
					(typeof value === 'string' && value.trim() === '') ||
					(Array.isArray(value) && value.length === 0)
				if (isEmpty) {
					errors[parameter.id] =
						currentLocale === 'ru'
							? `${parameter.name} обязательно для заполнения`
							: `${parameter.nameIt || parameter.name} è obbligatorio`
				}
			}
		})

		if (Object.keys(errors).length > 0) {
			setValidationErrors(errors)
			return false
		}

		// Дополнительная проверка: есть ли хотя бы одно заполненное значение
		const hasAnyValue = Object.values(currentConfig).some(
			value =>
				value !== undefined &&
				value !== null &&
				value !== '' &&
				(typeof value !== 'string' || value.trim() !== '')
		)

		if (!hasAnyValue) {
			logger.warn('⚠️ No parameter values filled, cannot create product')
			return false
		}

		return true
	}, [currentLocale])


	// Перезагрузка параметров - используется через loadParameters при необходимости
	// Если родительский компонент передает onParameterReload, он должен вызывать loadParameters
	// Для обеспечения динамического обновления вызываем loadParameters при монтировании и изменении categoryId

	// Обработчик отвязки параметра от категории
	const handleUnlinkParameter = async (parameterId: string) => {
		try {
			logger.info(
				`🗑️ Unlinking parameter ${parameterId} from category ${categoryId}`
			)

			// Используем правильный API endpoint для отвязки параметра от категории
			const response = await fetch(
				`/api/categories/${categoryId}/parameters?parameterId=${parameterId}`,
				{
					method: 'DELETE',
					headers: { 'Content-Type': 'application/json' },
				}
			)

			const responseData = await response.json()

			if (response.ok) {
				logger.info('✅ Parameter unlinked successfully')
				// Перезагружаем список параметров
				await loadParameters()

				// Показываем пользовательское уведомление (опционально)
				if (process.env.NODE_ENV === 'development') {
					console.log('✅ Параметр успешно отвязан от категории')
				}
			} else {
				logger.error('Failed to unlink parameter:', responseData)

				// Показываем подробную ошибку
				if (response.status === 404) {
					logger.warn(
						'⚠️ Parameter link not found. It may already be unlinked or is a global parameter.'
					)
					if (process.env.NODE_ENV === 'development') {
						console.warn('⚠️ Параметр уже отвязан или является глобальным')
					}
				} else {
					logger.error('Error unlinking parameter:', responseData)
					if (process.env.NODE_ENV === 'development') {
						console.error('❌ Ошибка при отвязке:', responseData.error)
					}
				}
			}
		} catch (error) {
			logger.error('Error unlinking parameter:', error)
			if (process.env.NODE_ENV === 'development') {
				console.error('❌ Неожиданная ошибка при отвязке параметра:', error)
			}
		}
	}

	// Рендер комбо-поля для SELECT и COLOR параметров
	const renderComboField = (
		parameter: Parameter,
		isEditMode: boolean = false
	) => {
		const rawValue = configuration[parameter.id]
		// Убеждаемся что value - строка, а не объект
		const value =
			typeof rawValue === 'object' &&
			rawValue !== null &&
			!Array.isArray(rawValue) &&
			'value' in rawValue
				? rawValue.value
				: typeof rawValue === 'string'
				? rawValue
				: String(rawValue || '')
		const error = validationErrors[parameter.id]

		const handleSelectValue = (selectedValue: string) => {
			updateParameter(parameter.id, selectedValue)
		}

		// Рендер в виде тегов вместо dropdown
		const renderTagField = () => {
			const displayName =
				currentLocale === 'ru'
					? parameter.name
					: parameter.nameIt || parameter.name

			// Логируем для отладки (только в dev)
			if (process.env.NODE_ENV === 'development') {
				console.log('🔍 Render tag field:', {
					parameterName: parameter.name,
					isEditMode,
					isLinked: parameter.isLinked,
					shouldShowButton: isEditMode && parameter.isLinked,
				})
			}

			// Проверяем, является ли параметр "Модель" (всегда обязателен)
			const isModelParameter =
				parameter.name === 'Модель' || parameter.nameIt === 'Modello'
			const isRequired = parameter.isRequired || isModelParameter

			return (
				<div
					className='space-y-2 border border-gray-200 rounded-lg p-4 bg-white'
					id={`param-${parameter.id}`}
					data-param-id={parameter.id}
				>
					<div className='flex items-center justify-between mb-2'>
						<label className='block font-semibold text-gray-900'>
							{displayName}
							{isRequired && (
								<span
									className='text-red-500 ml-1'
									title={
										currentLocale === 'ru'
											? 'Обязательное поле'
											: 'Campo obbligatorio'
									}
								>
									*
								</span>
							)}
						</label>
						{/* Кнопка удаления в режиме редактирования - только для параметров, привязанных к категории (не глобальных) */}
						{isEditMode && parameter.isLinked && !parameter.isGlobal && (
							<Button
								type='button'
								variant='ghost'
								size='sm'
								onClick={async () => {
									await handleUnlinkParameter(parameter.id)
								}}
								className='text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0'
							>
								<X className='w-4 h-4' />
							</Button>
						)}
					</div>
					<div className='flex flex-wrap gap-2'>
						{parameter.values?.map((val: any, index: number) => {
							// Правильно извлекаем строковое значение из объекта или строки
							// Важно: если value пустое, но есть valueIt - используем valueIt
							// Это защита от ситуации когда значение было создано с пустым value
							const valText =
								typeof val === 'string'
									? val
									: val?.value?.trim() ||
									  val?.valueIt?.trim() ||
									  String(val || '')

							// Используем строгое сравнение строк для правильного выделения
							// Важно: сравниваем приведенные к строке значения, тримим пробелы
							const currentValue = String(value || '').trim()
							const currentValText = String(valText || '').trim()

							// Упрощенная и надежная логика выделения:
							// Если значение имеет уникальный ID - используем его для точного сравнения
							// Если ID нет или значения дублируются - используем индекс + значение для уникальности
							let isSelected = false

							if (currentValue !== '' && currentValue === currentValText) {
								// Проверяем, есть ли значения с одинаковым текстом
								// Учитываем что value может быть пустым, но есть valueIt
								const valuesWithSameText =
									parameter.values?.filter((v: any) => {
										const vText =
											typeof v === 'string'
												? v
												: v?.value?.trim() ||
												  v?.valueIt?.trim() ||
												  String(v || '')
										return String(vText || '').trim() === currentValue
									}) || []

								if (valuesWithSameText.length === 1) {
									// Если только одно значение с таким текстом - выделяем его
									isSelected = true
								} else if (valuesWithSameText.length > 1) {
									// Если есть дубликаты - используем индекс для идентификации первого вхождения
									// Учитываем что value может быть пустым, но есть valueIt
									const firstIndex =
										parameter.values?.findIndex((v: any) => {
											const vText =
												typeof v === 'string'
													? v
													: v?.value?.trim() ||
													  v?.valueIt?.trim() ||
													  String(v || '')
											return String(vText || '').trim() === currentValue
										}) ?? -1

									// Выделяем только если это первое вхождение с таким значением
									isSelected = index === firstIndex
								}
							}

							// Определяем отображаемое значение (с учетом локали)
							const displayValue =
								typeof val === 'string'
									? val
									: currentLocale === 'ru'
									? val?.value || String(val || '')
									: val?.valueIt || val?.value || String(val || '')

							// Используем уникальный ключ: ID значения если есть, иначе комбинация
							const valueKey = val?.id
								? `${parameter.id}-value-${val.id}`
								: `${parameter.id}-tag-${index}-${currentValText}`

							return (
								<button
									key={valueKey}
									type='button'
									onClick={() => {
										// Используем полное значение (value или valueIt) при сохранении
										// Это важно для корректной работы с исправленными данными
										const valueToSave =
											val?.value?.trim() || val?.valueIt?.trim() || valText

										// Логируем для отладки (только в dev)
										if (process.env.NODE_ENV === 'development') {
											console.log('🖱️ Clicked value:', {
												valText,
												valueToSave,
												rawValue: val?.value,
												rawValueIt: val?.valueIt,
												valueId: val?.id || `idx-${index}`,
												index,
												parameterId: parameter.id,
												parameterName: parameter.name,
												hasDuplicate:
													(parameter.values?.filter((v: any) => {
														const vText =
															typeof v === 'string'
																? v
																: v?.value?.trim() ||
																  v?.valueIt?.trim() ||
																  String(v || '')
														return String(vText || '').trim() === currentValText
													}).length || 0) > 1,
											})
										}
										handleSelectValue(valueToSave)
									}}
									className={cn(
										'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
										isSelected
											? 'bg-blue-500 text-white hover:bg-blue-600'
											: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
									)}
								>
									{displayValue}
								</button>
							)
						})}
						{/* Кнопка + для добавления нового значения */}
						<button
							type='button'
							onClick={() => {
								setSelectedParameterForValue(parameter)
								setAddValueDialogOpen(true)
							}}
							className='px-3 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 text-sm font-medium'
						>
							+
						</button>
					</div>

					{error && <p className='text-xs text-red-500'>{error}</p>}
				</div>
			)
		}

		// Возвращаем новый UI с тегами
		return renderTagField()
	}

	// Обработчик добавления значения через модальное окно
	const handleValueAdded = (newValue: {
		id: string
		value: string
		valueIt?: string
		displayName?: string
		hexColor?: string
		ralCode?: string
	}) => {
		if (!selectedParameterForValue) return

		// Обновляем список параметров с новым значением
		setParameters(prev =>
			prev.map(param =>
				param.id === selectedParameterForValue.id
					? {
							...param,
							values: [
								...(param.values || []),
								{
									id: newValue.id, // Добавляем ID для уникальной идентификации
									value: newValue.value,
									valueIt: newValue.valueIt,
									displayName: newValue.displayName,
									hexColor: newValue.hexColor,
								},
							],
					  }
					: param
			)
		)
		// Автоматически выбираем новое значение
		updateParameter(selectedParameterForValue.id, newValue.value)
	}

	// Рендер поля параметра
	const renderParameterField = (
		parameter: Parameter,
		isEditMode: boolean = false
	) => {
		const rawValue = configuration[parameter.id]
		// Убеждаемся что value - строка или массив, а не объект (для TEXT с множественными значениями)
		const value =
			typeof rawValue === 'object' &&
			rawValue !== null &&
			!Array.isArray(rawValue) &&
			'value' in rawValue
				? rawValue.value
				: rawValue
		const error = validationErrors[parameter.id]

		switch (parameter.type) {
			case 'TEXT':
				// Проверяем, является ли значение массивом (множественные значения)
				const textValues = Array.isArray(value) ? value : value ? [value] : ['']

				// Проверяем, является ли параметр "Модель" (всегда обязателен)
				const isModelParameter =
					parameter.name === 'Модель' || parameter.nameIt === 'Modello'
				const isRequired = parameter.isRequired || isModelParameter

				return (
					<div
						className='space-y-2 border border-gray-200 rounded-lg p-4 bg-white'
						id={`param-${parameter.id}`}
						data-param-id={parameter.id}
					>
						<div className='flex items-center justify-between mb-2'>
							<label className='block font-semibold text-gray-900 text-sm'>
								{parameter.name}
								{isRequired && (
									<span
										className='text-red-500 ml-1'
										title={
											currentLocale === 'ru'
												? 'Обязательное поле'
												: 'Campo obbligatorio'
										}
									>
										*
									</span>
								)}
							</label>
							{/* Кнопка удаления в режиме редактирования - только для параметров, привязанных к категории (не глобальных) */}
							{isEditMode && parameter.isLinked && !parameter.isGlobal && (
								<Button
									type='button'
									variant='ghost'
									size='sm'
									onClick={async () => {
										await handleUnlinkParameter(parameter.id)
									}}
									className='text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0'
								>
									<X className='w-4 h-4' />
								</Button>
							)}
						</div>
						{textValues.map((val, index) => (
							<div
								key={`${parameter.id}-${index}`}
								className='flex items-center gap-2'
							>
								<Input
									type='text'
									value={val}
									onChange={e => {
										const newValues = [...textValues]
										newValues[index] = e.target.value
										updateParameter(
											parameter.id,
											newValues.length === 1 && newValues[0] === ''
												? ''
												: newValues
										)
									}}
									className={cn('flex-1', error && 'border-red-500')}
									placeholder={parameter.name}
								/>
								{/* Кнопка удаления (показываем если больше одной строки) */}
								{textValues.length > 1 && (
									<Button
										type='button'
										variant='outline'
										size='icon'
										onClick={() => {
											const newValues = textValues.filter((_, i) => i !== index)
											updateParameter(
												parameter.id,
												newValues.length === 0 ? '' : newValues
											)
										}}
										className='h-9 w-9 text-red-500 hover:bg-red-50'
									>
										<X className='w-4 h-4' />
									</Button>
								)}
							</div>
						))}
						{/* Кнопка добавления новой строки */}
						<Button
							type='button'
							variant='outline'
							onClick={() => {
								const newValues = [...textValues, '']
								updateParameter(parameter.id, newValues)
							}}
							className='w-full text-sm'
						>
							<Plus className='w-4 h-4 mr-2' />
							{currentLocale === 'ru' ? 'Добавить ещё' : 'Aggiungi ancora'}
						</Button>
						{error && <p className='text-xs text-red-500'>{error}</p>}
					</div>
				)

			case 'NUMBER':
				const numberParamName = currentLocale === 'ru' 
					? parameter.name 
					: parameter.nameIt || parameter.name
				return (
					<div
						className='space-y-1'
						id={`param-${parameter.id}`}
						data-param-id={parameter.id}
					>
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
								placeholder={numberParamName}
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
				return renderComboField(parameter, isEditMode)

			case 'MULTI_SELECT':
				return (
					<div className='space-y-1'>
						<div className='text-sm text-gray-600 mb-2'>
							{parameter.name} (множественный выбор)
						</div>
						<div className='text-xs text-gray-500'>Функция в разработке</div>
					</div>
				)

			case 'BOOLEAN':
				return (
					<div
						className='space-y-1'
						id={`param-${parameter.id}`}
						data-param-id={parameter.id}
					>
						<div className='flex items-center space-x-2'>
							<input
								type='checkbox'
								id={parameter.id}
								checked={value === true || value === 'true'}
								onChange={e => updateParameter(parameter.id, e.target.checked)}
								className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
							/>
							<label htmlFor={parameter.id} className='text-sm text-gray-700'>
								{parameter.name}
							</label>
							{parameter.isRequired && (
								<span className='text-red-500 text-xs'>*</span>
							)}
						</div>
						{error && <p className='text-xs text-red-500'>{error}</p>}
					</div>
				)

			case 'DATE':
				return (
					<div
						className='space-y-1'
						id={`param-${parameter.id}`}
						data-param-id={parameter.id}
					>
						<div className='flex items-center space-x-2'>
							<Input
								id={parameter.id}
								type='date'
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

			case 'RANGE':
				return (
					<div className='space-y-1'>
						<div className='text-sm text-gray-600 mb-2'>
							{parameter.name} (диапазон)
						</div>
						<div className='text-xs text-gray-500'>Функция в разработке</div>
					</div>
				)

			default:
				return (
					<div className='space-y-1'>
						<div className='text-sm text-gray-600 mb-2'>
							{parameter.name} (тип: {parameter.type})
						</div>
						<div className='text-xs text-gray-500'>
							Неподдерживаемый тип параметра
						</div>
					</div>
				)
		}
	}

	// Функция валидации и завершения (вызывается напрямую)
	const handleComplete = useCallback(() => {
		const currentConfig = configurationRef.current
		const currentParams = parametersRef.current
		const currentNotes = customNotes

		// Валидация
		const errors: Record<string, string> = {}

		const modelParameter = currentParams.find(
			p => p.name === 'Модель' || p.nameIt === 'Modello'
		)
		if (modelParameter) {
			const modelValue = currentConfig[modelParameter.id]
			const isEmpty =
				!modelValue ||
				(typeof modelValue === 'string' && modelValue.trim() === '')
			if (isEmpty) {
				errors[modelParameter.id] =
					currentLocale === 'ru'
						? 'Модель обязательна для заполнения'
						: 'Il modello è obbligatorio'
			}
		}

		currentParams.forEach(parameter => {
			if (modelParameter && parameter.id === modelParameter.id) return
			if (parameter.isRequired) {
				const value = currentConfig[parameter.id]
				const isEmpty =
					!value ||
					(typeof value === 'string' && value.trim() === '') ||
					(Array.isArray(value) && value.length === 0)
				if (isEmpty) {
					errors[parameter.id] =
						currentLocale === 'ru'
							? `${parameter.name} обязательно для заполнения`
							: `${parameter.nameIt || parameter.name} è obbligatorio`
				}
			}
		})

		if (Object.keys(errors).length > 0) {
			setTimeout(() => {
				setValidationErrors(errors)
				const firstErrorParamId = Object.keys(errors)[0]
				setTimeout(() => {
					const errorElement =
						document.getElementById(`param-${firstErrorParamId}`) ||
						document.querySelector(
							`[data-param-id="${firstErrorParamId}"]`
						) ||
						document.getElementById(firstErrorParamId)
					if (errorElement) {
						errorElement.scrollIntoView({
							behavior: 'smooth',
							block: 'center',
						})
						const input = errorElement.querySelector(
							'input, textarea, select'
						) as HTMLElement
						if (input) {
							setTimeout(() => input.focus(), 200)
						}
					}
				}, 100)
			}, 0)

			const errorMessage =
				currentLocale === 'ru'
					? 'Не все обязательные поля заполнены. Проверьте форму.'
					: 'Non tutti i campi obbligatori sono compilati. Controlla il modulo.'
			toast.error(errorMessage, { duration: 4000 })
			logger.warn(errorMessage)
			return
		}

		// Успешная валидация
		setTimeout(() => {
			const configWithNotes = {
				...currentConfig,
				_customNotes: currentNotes,
			}
			logger.info('✅ Validation passed, calling onComplete')
			onComplete(configWithNotes, currentParams)
		}, 0)
	}, [customNotes, currentLocale, onComplete])

	// Рендер поля размера
	if (loading) {
		return (
			<div className='flex items-center justify-center h-64'>
				<div className='text-gray-500'>
					{currentLocale === 'ru'
						? 'Загрузка параметров...'
						: 'Caricamento parametri...'}
				</div>
			</div>
		)
	}

	return (
		<div className='h-full flex flex-col'>
			{/* Основная область - прокручиваемая */}
			<div className='flex-1 overflow-y-auto min-h-0'>
				<div className='grid grid-cols-2 gap-8 p-6'>
					{/* Левая колонка - Параметры */}
					<div className='space-y-6'>
						{/* Блок 1: Системные параметры размеров */}
						{parameters.filter(p => p.isSystem).length > 0 && (
							<div className='bg-white border border-blue-200 rounded-lg p-6 relative'>
								<div className='absolute -top-2 -left-2 bg-blue-600 text-white text-xs font-medium w-6 h-6 rounded-full flex items-center justify-center z-10'>
									📏
								</div>
								<h3 className='font-medium text-lg mb-6 text-blue-700'>
									{currentLocale === 'ru' ? 'Размеры' : 'Dimensioni'}
								</h3>
								<div className='space-y-4'>
									{parameters
										.filter(p => p.isSystem)
										.map((parameter) => (
											<div key={parameter.id}>
												{renderParameterField(parameter, isEditMode)}
											</div>
										))}
								</div>
							</div>
						)}

						{/* Блок 2: Остальные параметры категории и глобальные */}
						{parameters.filter(p => !p.isSystem).length > 0 ? (
							<div className='bg-white border border-gray-200 rounded-lg p-6 relative'>
								<div className='absolute -top-2 -left-2 bg-gray-800 text-white text-xs font-medium w-6 h-6 rounded-full flex items-center justify-center z-10'>
									⚙️
								</div>
								<h3 className='font-medium text-lg mb-6 text-gray-700'>
									{currentLocale === 'ru' ? 'Параметры' : 'Parametri'}
								</h3>
								<div className='space-y-4'>
									{parameters
										.filter(p => !p.isSystem)
										.map((parameter) => (
											<div key={parameter.id}>
												{renderParameterField(parameter, isEditMode)}
											</div>
										))}
								</div>
							</div>
						) : parameters.length === 0 ? (
							<div className='bg-white border rounded-lg p-8 text-center'>
								<div className='text-gray-500 mb-4'>
									{currentLocale === 'ru'
										? 'Нет параметров для данной категории'
										: 'Nessun parametro per questa categoria'}
								</div>
								<div className='text-sm text-gray-400'>
									{currentLocale === 'ru'
										? 'Свяжите параметры с категорией в настройках'
										: 'Collega i parametri alla categoria nelle impostazioni'}
								</div>
							</div>
						) : null}

						{/* Поле для дополнительной информации */}
						<div
							className='bg-white border border-gray-200 rounded-lg p-6'
							id='param-custom-notes'
							data-param-id='custom-notes'
						>
							<label className='block font-semibold text-gray-900 mb-2'>
								{currentLocale === 'ru'
									? 'Дополнительная информация'
									: 'Informazioni aggiuntive'}
							</label>
							<Textarea
								id='custom-notes'
								value={customNotes}
								onChange={e => {
									const newValue = e.target.value
									// Валидация максимальной длины для предотвращения проблем с БД
									const maxLength = 10000
									if (newValue.length > maxLength) {
										logger.warn(
											`Custom notes exceeds max length (${maxLength}), truncating`
										)
										setCustomNotes(newValue.slice(0, maxLength))
										return
									}
									setCustomNotes(newValue)
								}}
								placeholder={
									currentLocale === 'ru'
										? 'Введите дополнительную информацию о продукте...'
										: 'Inserisci informazioni aggiuntive sul prodotto...'
								}
								className='min-h-[100px] resize-none'
								rows={4}
							/>
						</div>

						{/* Кнопка подтверждения (скрыта, вызывается программно из левой панели) */}
						<div className='hidden'>
							<Button
								onClick={handleComplete}
								data-conferma-button
								className='bg-green-600 hover:bg-green-700 text-white px-8'
							>
								{currentLocale === 'ru' ? 'Подтвердить' : 'Conferma'}
							</Button>
						</div>
					</div>

					{/* Правая колонка - Визуализация */}
					<div className='bg-white border border-gray-200 rounded-lg p-6 relative'>
						<div className='absolute -top-2 -left-2 bg-gray-800 text-white text-xs font-medium w-6 h-6 rounded-full flex items-center justify-center z-10'>
							2
						</div>
						<h3 className='font-medium text-lg mb-6 text-gray-700'>
							{currentLocale === 'ru' ? 'Визуализация' : 'Visualizzazione'}
						</h3>
						<ProductVisualization
							configuration={configuration}
							parameters={parameters}
							className='w-full h-[200px]'
						/>
					</div>
				</div>
			</div>

			{/* Модальное окно добавления значения параметра */}
			{selectedParameterForValue && (
				<ParameterValueAddDialog
					open={addValueDialogOpen}
					onOpenChange={setAddValueDialogOpen}
					parameterId={selectedParameterForValue.id}
					parameterName={
						currentLocale === 'ru'
							? selectedParameterForValue.name
							: selectedParameterForValue.nameIt ||
							  selectedParameterForValue.name
					}
					parameterType={selectedParameterForValue.type}
					onValueAdded={handleValueAdded}
				/>
			)}
		</div>
	)
}
