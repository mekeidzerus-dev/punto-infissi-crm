'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useLanguage } from '@/contexts/LanguageContext'
import { validateProduct, formatValidationErrors } from '@/lib/validate-product'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	ChevronLeft,
	ChevronRight,
	Check,
	X,
	Plus,
	Edit,
	Trash2,
	ArrowLeft,
} from 'lucide-react'
import { ProductVisualizer } from '@/components/product-visualizer'
import { AddCategoryModal } from '@/components/add-category-modal'
import {
	ProductVisualizer as EnhancedProductVisualizer,
	LegacyProductVisualizer,
} from '@/components/product-visualizer-enhanced'
import { ColorSelector, getColorScheme } from '@/components/color-selector'
import { UserSuggestion } from '@/components/user-suggestion'
import { FeatureGate } from '@/lib/feature-flags'
import { ApprovalStatusBadge } from '@/components/approval-status-badge'
import { InlineAddSelectValue } from '@/components/inline-add-select-value'
import { ParameterValuesManager } from '@/components/parameter-values-manager'

interface ProductCategory {
	id: string
	name: string
	icon: string
	description?: string
}

interface Supplier {
	id: number
	name: string
}

interface Parameter {
	id: string
	name: string
	type: 'select' | 'number' | 'text'
	options?: string[]
	min?: number
	max?: number
	required: boolean
	default?: string | number
}

interface SupplierCategory {
	id: string
	supplierId: number
	categoryId: string
	supplier: Supplier
	parameters: Parameter[]
}

export interface Configuration {
	categoryId: string
	categoryName?: string
	supplierId: number
	supplierName?: string
	supplierCategoryId: string
	parameters: Record<string, string | number>
	customNotes?: string
}

interface ProductConfiguratorProps {
	onComplete: (config: Configuration) => void
	onCancel: () => void
}

export function ProductConfigurator({
	onComplete,
	onCancel,
}: ProductConfiguratorProps) {
	const { t, locale } = useLanguage()
	const [step, setStep] = useState(1)
	const [categories, setCategories] = useState<ProductCategory[]>([])
	const [suppliers, setSuppliers] = useState<Supplier[]>([])
	const [supplierCategories, setSupplierCategories] = useState<
		SupplierCategory[]
	>([])
	const [config, setConfig] = useState<Configuration>({
		categoryId: '',
		supplierId: 0,
		supplierCategoryId: '',
		parameters: {},
		customNotes: '',
	})
	const [loading, setLoading] = useState(false)
	const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
	const [showEditCategoryModal, setShowEditCategoryModal] = useState(false)
	const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false)
	const [selectedCategoryForEdit, setSelectedCategoryForEdit] =
		useState<ProductCategory | null>(null)
	const [selectedCategoryForDelete, setSelectedCategoryForDelete] =
		useState<ProductCategory | null>(null)
	const [categoryParameters, setCategoryParameters] = useState<any[]>([])
	const [loadingParameters, setLoadingParameters] = useState(false)
	const [supplierOverrides, setSupplierOverrides] = useState<any[]>([])
	const [showValuesManager, setShowValuesManager] = useState(false)
	const [selectedParameterForManager, setSelectedParameterForManager] =
		useState<{ id: string; name: string; type: string } | null>(null)

	// Загружаем категории
	useEffect(() => {
		fetchCategories()
		fetchSuppliers()
	}, [])

	// Загружаем параметры при выборе категории
	useEffect(() => {
		if (config.categoryId) {
			fetchCategoryParameters(config.categoryId)
		}
	}, [config.categoryId])

	const fetchCategories = async () => {
		try {
			const response = await fetch('/api/product-categories')
			const data = await response.json()
			setCategories(data)
		} catch (error) {
			console.error('Error fetching categories:', error)
		}
	}

	const fetchSuppliers = async () => {
		try {
			const response = await fetch('/api/suppliers')
			const data = await response.json()
			setSuppliers(data)
		} catch (error) {
			console.error('Error fetching suppliers:', error)
		}
	}

	// Загружаем параметры категории
	const fetchCategoryParameters = async (categoryId: string) => {
		setLoadingParameters(true)
		try {
			const response = await fetch(
				`/api/category-parameters?categoryId=${categoryId}`
			)
			const data = await response.json()
			setCategoryParameters(data)
			console.log(`✅ Loaded ${data.length} parameters for category`)
		} catch (error) {
			console.error('Error fetching category parameters:', error)
			setCategoryParameters([])
		} finally {
			setLoadingParameters(false)
		}
	}

	// Обработка добавления нового значения параметра
	const handleValueAdded = async (newValue: any, parameterId: string) => {
		// Перезагружаем параметры категории для обновления списка значений
		if (config.categoryId) {
			await fetchCategoryParameters(config.categoryId)
		}
		// Автоматически выбираем новое значение
		handleParameterChange(parameterId, newValue.value)
	}

	// Открытие менеджера значений параметра
	const handleShowAllValues = (
		paramId: string,
		paramName: string,
		paramType: string
	) => {
		setSelectedParameterForManager({
			id: paramId,
			name: paramName,
			type: paramType,
		})
		setShowValuesManager(true)
	}

	// Закрытие менеджера значений
	const handleCloseValuesManager = () => {
		setShowValuesManager(false)
		setSelectedParameterForManager(null)
		// Перезагружаем параметры
		if (config.categoryId) {
			fetchCategoryParameters(config.categoryId)
		}
	}

	const handleAddCategory = async (categoryData: {
		name: string
		icon: string
		description?: string
	}) => {
		try {
			const response = await fetch('/api/product-categories', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(categoryData),
			})

			if (response.ok) {
				const newCategory = await response.json()
				setCategories(prev => [...prev, newCategory])
				console.log('✅ Categoria creata:', newCategory.name)
			} else {
				const error = await response.json()
				console.error('❌ Errore creazione categoria:', error.error)
				alert(`Errore: ${error.error}`)
			}
		} catch (error) {
			console.error('❌ Errore:', error)
			alert('Errore durante la creazione della categoria')
		}
	}

	const handleEditCategory = (
		category: ProductCategory,
		e: React.MouseEvent
	) => {
		e.stopPropagation()
		setSelectedCategoryForEdit(category)
		setShowEditCategoryModal(true)
	}

	const handleDeleteCategory = (
		category: ProductCategory,
		e: React.MouseEvent
	) => {
		e.stopPropagation()
		setSelectedCategoryForDelete(category)
		setShowDeleteCategoryModal(true)
	}

	const handleCategoryUpdated = async (categoryData: {
		name: string
		icon: string
		description?: string
	}) => {
		if (!selectedCategoryForEdit) return

		try {
			const response = await fetch(
				`/api/product-categories/${selectedCategoryForEdit.id}`,
				{
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(categoryData),
				}
			)

			if (response.ok) {
				const updatedCategory = await response.json()
				setCategories(prev =>
					prev.map(cat =>
						cat.id === selectedCategoryForEdit.id ? updatedCategory : cat
					)
				)
				console.log('✅ Categoria aggiornata:', updatedCategory.name)
				setShowEditCategoryModal(false)
				setSelectedCategoryForEdit(null)
			} else {
				const error = await response.json()
				console.error('❌ Errore aggiornamento categoria:', error.error)
				alert(`Errore: ${error.error}`)
			}
		} catch (error) {
			console.error('❌ Errore aggiornamento categoria:', error)
			alert("Errore durante l'aggiornamento della categoria")
		}
	}

	const handleCategoryDeleted = async () => {
		if (!selectedCategoryForDelete) return

		try {
			const response = await fetch(
				`/api/product-categories/${selectedCategoryForDelete.id}`,
				{
					method: 'DELETE',
				}
			)

			if (response.ok) {
				setCategories(prev =>
					prev.filter(cat => cat.id !== selectedCategoryForDelete.id)
				)
				console.log('✅ Categoria eliminata:', selectedCategoryForDelete.name)
				setShowDeleteCategoryModal(false)
				setSelectedCategoryForDelete(null)
			} else {
				const error = await response.json()
				console.error('❌ Errore eliminazione categoria:', error.error)
				alert(`Errore: ${error.error}`)
			}
		} catch (error) {
			console.error('❌ Errore eliminazione categoria:', error)
			alert("Errore durante l'eliminazione della categoria")
		}
	}

	const goBack = () => {
		if (step > 1) {
			setStep(step - 1)
		}
	}

	const fetchSupplierCategories = async (categoryId: string) => {
		try {
			const response = await fetch(
				`/api/supplier-categories?categoryId=${categoryId}`
			)
			const data = await response.json()
			setSupplierCategories(data)
		} catch (error) {
			console.error('Error fetching supplier categories:', error)
		}
	}

	const handleCategorySelect = (categoryId: string) => {
		const category = categories.find(c => c.id === categoryId)
		setConfig(prev => ({
			...prev,
			categoryId,
			categoryName: category?.name,
		}))
		fetchSupplierCategories(categoryId)
		setStep(2)
	}

	const handleSupplierSelect = async (supplierId: number) => {
		const supplierCategory = supplierCategories.find(
			sc => sc.supplierId === supplierId
		)
		if (supplierCategory) {
			setConfig(prev => ({
				...prev,
				supplierId,
				supplierName: supplierCategory.supplier.name,
				supplierCategoryId: supplierCategory.id,
				parameters: {},
			}))

			// Загружаем переопределения поставщика
			try {
				const response = await fetch(
					`/api/suppliers/${supplierId}/parameter-overrides`
				)
				if (response.ok) {
					const overrides = await response.json()
					setSupplierOverrides(overrides)
					console.log(`✅ Loaded ${overrides.length} supplier overrides`)
				} else {
					setSupplierOverrides([])
				}
			} catch (error) {
				console.error('Error loading supplier overrides:', error)
				setSupplierOverrides([])
			}

			setStep(3)
		}
	}

	const handleParameterChange = (paramId: string, value: string | number) => {
		setConfig(prev => ({
			...prev,
			parameters: {
				...prev.parameters,
				[paramId]: value,
			},
		}))
	}

	const handleComplete = async () => {
		setLoading(true)
		try {
			await onComplete(config)
		} finally {
			setLoading(false)
		}
	}

	const getCurrentSupplierCategory = () => {
		return supplierCategories.find(sc => sc.supplierId === config.supplierId)
	}

	// Группировка параметров по логическим группам
	const groupParameters = (params: any[]) => {
		const groups: Record<string, any[]> = {
			dimensions: [],
			materials: [],
			functionality: [],
			hardware: [],
			other: [],
		}

		params.forEach(cp => {
			const paramName = (
				cp.parameter.nameIt ||
				cp.parameter.name ||
				''
			).toLowerCase()

			if (
				paramName.includes('larghezza') ||
				paramName.includes('altezza') ||
				paramName.includes('ширина') ||
				paramName.includes('высота')
			) {
				groups.dimensions.push(cp)
			} else if (
				paramName.includes('materiale') ||
				paramName.includes('colore') ||
				paramName.includes('материал') ||
				paramName.includes('цвет')
			) {
				groups.materials.push(cp)
			} else if (
				paramName.includes('apertura') ||
				paramName.includes('vetro') ||
				paramName.includes('открытия') ||
				paramName.includes('стекло')
			) {
				groups.functionality.push(cp)
			} else if (
				paramName.includes('ferramenta') ||
				paramName.includes('фурнитура')
			) {
				groups.hardware.push(cp)
			} else {
				groups.other.push(cp)
			}
		})

		return groups
	}

	const canProceed = () => {
		switch (step) {
			case 1:
				return config.categoryId
			case 2:
				return config.supplierId
			case 3:
				// Проверяем динамические параметры из БД
				if (categoryParameters.length > 0) {
					const requiredParams = categoryParameters.filter(cp => cp.isRequired)
					return requiredParams.every(cp => {
						const value = config.parameters[cp.parameter.id]
						return value !== undefined && value !== '' && value !== null
					})
				}
				// Fallback к старым параметрам
				const supplierCategory = getCurrentSupplierCategory()
				if (!supplierCategory) return false
				return supplierCategory.parameters.every(
					param => !param.required || config.parameters[param.id] !== undefined
				)
			default:
				return false
		}
	}

	// Применяем переопределения поставщика к параметру
	const applySupplierOverrides = (param: any) => {
		const override = supplierOverrides.find(o => o.parameterId === param.id)
		if (!override) return param

		// Если параметр недоступен для поставщика, возвращаем null
		if (!override.isAvailable) return null

		// Применяем переопределения
		const modifiedParam = { ...param }

		// Для NUMBER: применяем min/max
		if (param.type === 'NUMBER') {
			if (override.minValue !== null && override.minValue !== undefined) {
				modifiedParam.minValue = override.minValue
			}
			if (override.maxValue !== null && override.maxValue !== undefined) {
				modifiedParam.maxValue = override.maxValue
			}
		}

		// Для SELECT/COLOR: добавляем кастомные значения
		if (
			(param.type === 'SELECT' || param.type === 'COLOR') &&
			override.customValues
		) {
			try {
				const customValues = JSON.parse(override.customValues)
				// Добавляем кастомные значения к стандартным
				const customValuesObjects = customValues.map(
					(v: string, idx: number) => ({
						id: `custom_${idx}`,
						value: v,
						valueIt: v,
						displayName: v,
						isActive: true,
					})
				)
				modifiedParam.values = [...param.values, ...customValuesObjects]
			} catch (error) {
				console.error('Error parsing custom values:', error)
			}
		}

		return modifiedParam
	}

	// Рендеринг динамических параметров из БД
	const renderDynamicParameter = (categoryParam: any) => {
		let param = categoryParam.parameter

		// Применяем переопределения поставщика
		param = applySupplierOverrides(param)

		// Если параметр недоступен для поставщика, не отображаем его
		if (!param) return null

		const paramId = param.id
		const value = config.parameters[paramId] || categoryParam.defaultValue || ''

		const label = (
			<Label htmlFor={paramId} className='text-sm font-medium'>
				{locale === 'ru' ? param.name : param.nameIt || param.name}
				{categoryParam.isRequired && (
					<span className='text-red-500 ml-1'>*</span>
				)}
				{param.unit && (
					<span className='text-gray-500 ml-1'>({param.unit})</span>
				)}
			</Label>
		)

		switch (param.type) {
			case 'NUMBER':
				return (
					<div key={paramId} className='space-y-2'>
						{label}
						<Input
							id={paramId}
							type='number'
							value={value}
							onChange={e =>
								handleParameterChange(paramId, parseFloat(e.target.value) || 0)
							}
							min={param.minValue || undefined}
							max={param.maxValue || undefined}
							step={param.step || 1}
							placeholder={
								categoryParam.helpText ||
								`${param.minValue || 0} - ${param.maxValue || 9999}`
							}
							className='w-full'
						/>
						{categoryParam.helpText && (
							<p className='text-xs text-gray-500'>{categoryParam.helpText}</p>
						)}
					</div>
				)

			case 'SELECT':
				return (
					<div key={paramId} className='space-y-2'>
						{label}
						<Select
							value={String(value)}
							onValueChange={val => handleParameterChange(paramId, val)}
						>
							<SelectTrigger className='w-full'>
								<SelectValue placeholder={t('select')} />
							</SelectTrigger>
							<SelectContent>
								{param.values?.map((v: any) => (
									<SelectItem key={v.id} value={v.value}>
										<div className='flex items-center justify-between w-full gap-2 group'>
											<span className='flex-1'>
												{locale === 'ru'
													? v.displayName || v.value
													: v.valueIt || v.value}
												{v.ralCode && ` (${v.ralCode})`}
											</span>
											<div className='flex items-center gap-1'>
												{v.approvalStatus &&
													v.approvalStatus !== 'approved' && (
														<ApprovalStatusBadge
															status={v.approvalStatus}
															size='sm'
															showText={false}
														/>
													)}
												<button
													onClick={e => {
														e.preventDefault()
														e.stopPropagation()
														// TODO: открыть быстрое редактирование
														console.log('Edit value:', v.id)
													}}
													className='opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-opacity'
													title='Редактировать'
												>
													<Edit className='h-3 w-3 text-gray-500' />
												</button>
											</div>
										</div>
									</SelectItem>
								))}

								{/* Кнопка добавления ВНУТРИ выпадающего списка */}
								<InlineAddSelectValue
									parameterId={paramId}
									parameterName={param.name}
									parameterType='SELECT'
									onValueAdded={newVal => handleValueAdded(newVal, paramId)}
									onShowAllValues={() =>
										handleShowAllValues(paramId, param.name, 'SELECT')
									}
								/>
							</SelectContent>
						</Select>
					</div>
				)

			case 'COLOR':
				return (
					<div key={paramId} className='space-y-2'>
						{label}
						<div className='flex-1'>
							<FeatureGate
								feature='COLOR_SQUARES'
								fallback={
									<Select
										value={String(value)}
										onValueChange={val => handleParameterChange(paramId, val)}
									>
										<SelectTrigger className='w-full'>
											<SelectValue placeholder={t('select')} />
										</SelectTrigger>
										<SelectContent>
											{param.values?.map((v: any) => (
												<SelectItem key={v.id} value={v.value}>
													<div className='flex items-center gap-2'>
														{v.hexColor && (
															<div
																className='w-4 h-4 rounded border border-gray-300'
																style={{ backgroundColor: v.hexColor }}
															/>
														)}
														<span>
															{locale === 'ru'
																? v.displayName || v.value
																: v.valueIt || v.value}
															{v.ralCode && ` (${v.ralCode})`}
														</span>
														{v.approvalStatus &&
															v.approvalStatus !== 'approved' && (
																<ApprovalStatusBadge
																	status={v.approvalStatus}
																	size='sm'
																	showText={false}
																/>
															)}
													</div>
												</SelectItem>
											))}

											{/* Кнопка добавления ВНУТРИ выпадающего списка */}
											<InlineAddSelectValue
												parameterId={paramId}
												parameterName={param.name}
												parameterType='COLOR'
												onValueAdded={newVal =>
													handleValueAdded(newVal, paramId)
												}
												onShowAllValues={() =>
													handleShowAllValues(paramId, param.name, 'COLOR')
												}
											/>
										</SelectContent>
									</Select>
								}
							>
								<ColorSelector
									colors={
										param.values?.map((v: any) => ({
											value: v.value,
											name:
												locale === 'ru'
													? v.displayName || v.value
													: v.valueIt || v.value,
											hex: v.hexColor,
											ral: v.ralCode,
											approvalStatus: v.approvalStatus,
										})) || []
									}
									selectedColor={String(value)}
									onSelect={val => handleParameterChange(paramId, val)}
								/>
							</FeatureGate>
						</div>
					</div>
				)

			case 'TEXT':
				return (
					<div key={paramId} className='space-y-2'>
						{label}
						<Input
							id={paramId}
							type='text'
							value={value}
							onChange={e => handleParameterChange(paramId, e.target.value)}
							placeholder={categoryParam.helpText || ''}
							className='w-full'
						/>
					</div>
				)

			case 'BOOLEAN':
				return (
					<div key={paramId} className='flex items-center space-x-2'>
						<input
							id={paramId}
							type='checkbox'
							checked={value === true || value === 'true'}
							onChange={e =>
								handleParameterChange(
									paramId,
									e.target.checked ? 'true' : 'false'
								)
							}
							className='h-4 w-4 rounded border-gray-300'
						/>
						{label}
					</div>
				)

			default:
				return (
					<div key={paramId} className='space-y-2'>
						{label}
						<Input
							id={paramId}
							type='text'
							value={value}
							onChange={e => handleParameterChange(paramId, e.target.value)}
							className='w-full'
						/>
					</div>
				)
		}
	}

	const renderParameter = (param: Parameter) => {
		const value = config.parameters[param.id] || param.default || ''

		switch (param.type) {
			case 'select':
				return (
					<div key={param.id}>
						<Label htmlFor={param.id} className='text-sm font-medium'>
							{param.name} {param.required && '*'}
						</Label>
						<Select
							value={String(value)}
							onValueChange={val => handleParameterChange(param.id, val)}
						>
							<SelectTrigger>
								<SelectValue
									placeholder={`Выберите ${param.name.toLowerCase()}`}
								/>
							</SelectTrigger>
							<SelectContent>
								{param.options?.map(option => (
									<SelectItem key={option} value={option}>
										{option}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)

			case 'number':
				return (
					<div key={param.id}>
						<Label htmlFor={param.id} className='text-sm font-medium'>
							{param.name} {param.required && '*'}
						</Label>
						<Input
							id={param.id}
							type='number'
							min={param.min}
							max={param.max}
							value={value}
							onChange={e =>
								handleParameterChange(param.id, parseInt(e.target.value) || 0)
							}
							placeholder={param.name}
						/>
					</div>
				)

			case 'text':
				return (
					<div key={param.id}>
						<Label htmlFor={param.id} className='text-sm font-medium'>
							{param.name} {param.required && '*'}
						</Label>
						<Input
							id={param.id}
							type='text'
							value={value}
							onChange={e => handleParameterChange(param.id, e.target.value)}
							placeholder={param.name}
						/>
					</div>
				)

			default:
				return null
		}
	}

	const renderVisualization = () => {
		const category = categories.find(c => c.id === config.categoryId)
		const supplier = suppliers.find(s => s.id === config.supplierId)

		if (!category || !supplier) return null

		// Проверяем наличие параметров ширины и высоты (могут быть с разными ID из БД)
		const widthParam = categoryParameters.find(
			cp =>
				cp.parameter.name === 'Ширина' || cp.parameter.nameIt === 'Larghezza'
		)
		const heightParam = categoryParameters.find(
			cp => cp.parameter.name === 'Высота' || cp.parameter.nameIt === 'Altezza'
		)

		const width = widthParam
			? config.parameters[widthParam.parameter.id]
			: config.parameters.width
		const height = heightParam
			? config.parameters[heightParam.parameter.id]
			: config.parameters.height

		// Если есть все необходимые параметры - показываем полную визуализацию
		const hasRequiredParams = width && height

		return (
			<Card className='p-6'>
				{/* Новая улучшенная визуализация */}
				<FeatureGate
					feature='PRODUCT_VISUALIZATION'
					fallback={
						// Fallback к старой визуализации
						hasRequiredParams ? (
							<ProductVisualizer
								categoryName={category.name}
								parameters={config.parameters}
								categoryParameters={categoryParameters}
							/>
						) : (
							<div>
								<h3 className='text-lg font-semibold mb-4'>{t('preview')}</h3>
								<div className='flex items-center justify-center h-32 bg-gray-50 rounded-lg'>
									<div className='text-center'>
										<div
											className='w-12 h-12 mx-auto mb-2 flex items-center justify-center bg-blue-50 rounded-lg'
											dangerouslySetInnerHTML={{ __html: category.icon }}
										/>
										<div className='text-sm text-gray-600'>{category.name}</div>
										<div className='text-xs text-gray-500'>{supplier.name}</div>
										<div className='text-xs text-gray-400 mt-2'>
											{t('fillDimensionsForVisualization')}
										</div>
									</div>
								</div>

								{/* Текущая конфигурация */}
								{Object.keys(config.parameters).length > 0 && (
									<div className='mt-4'>
										<div className='text-sm font-medium mb-2'>
											{t('configuration')}:
										</div>
										<div className='grid grid-cols-2 gap-2 text-xs'>
											{Object.entries(config.parameters).map(([key, value]) => (
												<div key={key} className='flex justify-between'>
													<span className='text-gray-600'>{key}:</span>
													<span className='font-medium'>{String(value)}</span>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						)
					}
				>
					<EnhancedProductVisualizer
						configuration={config}
						category={category}
					/>
				</FeatureGate>
			</Card>
		)
	}

	return (
		<div className='max-w-7xl mx-auto p-4'>
			{/* Breadcrumbs */}
			<div className='mb-6'>
				<div className='flex items-center space-x-2 text-sm text-gray-600'>
					<span className={step >= 1 ? 'text-blue-600 font-medium' : ''}>
						1. Categoria
					</span>
					<ChevronRight className='w-4 h-4' />
					<span className={step >= 2 ? 'text-blue-600 font-medium' : ''}>
						2. Fornitore
					</span>
					<ChevronRight className='w-4 h-4' />
					<span className={step >= 3 ? 'text-blue-600 font-medium' : ''}>
						3. Parametri
					</span>
				</div>
			</div>

			{step === 1 && (
				<div>
					<div className='flex justify-end items-center mb-4'>
						<Button
							onClick={() => setShowAddCategoryModal(true)}
							variant='outline'
							size='sm'
							className='bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
						>
							<Plus className='h-4 w-4 mr-2' />
							Aggiungi Categoria
						</Button>
					</div>
					{/* АДАПТИВНАЯ СЕТКА: 5 в ряд на desktop, скролл на mobile */}
					<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
						{categories.map(category => (
							<Card
								key={category.id}
								className='p-3 cursor-pointer hover:bg-gray-50 transition-colors relative group'
								onClick={() => handleCategorySelect(category.id)}
							>
								<div className='text-center'>
									<div
										className='w-10 h-10 mx-auto mb-2 flex items-center justify-center bg-blue-50 rounded-lg'
										dangerouslySetInnerHTML={{ __html: category.icon }}
									/>
									<h4 className='text-sm font-medium'>{category.name}</h4>
								</div>
								{/* Кнопки редактирования и удаления */}
								<div className='absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity'>
									<div className='flex gap-1'>
										<Button
											size='sm'
											variant='outline'
											className='h-6 w-6 p-0 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
											onClick={e => handleEditCategory(category, e)}
										>
											<Edit className='h-3 w-3' />
										</Button>
										<Button
											size='sm'
											variant='outline'
											className='h-6 w-6 p-0 bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
											onClick={e => handleDeleteCategory(category, e)}
										>
											<Trash2 className='h-3 w-3' />
										</Button>
									</div>
								</div>
							</Card>
						))}
					</div>
				</div>
			)}

			{step === 2 && (
				<div>
					<h3 className='text-lg font-semibold mb-4'>{t('selectSupplier')}</h3>
					<div className='grid grid-cols-2 gap-4'>
						{supplierCategories.map(supplierCategory => (
							<Card
								key={supplierCategory.id}
								className='p-6 cursor-pointer hover:bg-gray-50 transition-colors'
								onClick={() =>
									handleSupplierSelect(supplierCategory.supplierId)
								}
							>
								<div className='text-center'>
									<div className='text-2xl mb-2'>🏭</div>
									<h4 className='font-medium'>
										{supplierCategory.supplier.name}
									</h4>
									<p className='text-sm text-gray-600 mt-1'>
										Параметров: {supplierCategory.parameters.length}
									</p>
								</div>
							</Card>
						))}
					</div>
				</div>
			)}

			{step === 3 && (
				<div className='grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6'>
					{/* ЛЕВАЯ ЗОНА: ФОРМА С ПАРАМЕТРАМИ (60%) */}
					<div className='space-y-6'>
						{loadingParameters ? (
							<div className='text-center py-8 text-gray-500'>
								{t('loading')}
							</div>
						) : categoryParameters.length > 0 ? (
							(() => {
								const groups = groupParameters(
									categoryParameters.filter(cp => cp.isVisible)
								)

								return (
									<div className='space-y-6'>
										{/* ГРУППА: РАЗМЕРЫ */}
										{groups.dimensions.length > 0 && (
											<Card className='p-4 bg-gray-50 border border-gray-200'>
												<h4 className='text-base font-semibold mb-4 text-gray-800'>
													📏 {locale === 'ru' ? 'Размеры' : 'Dimensioni'}
												</h4>
												<div className='space-y-4'>
													{groups.dimensions
														.sort((a, b) => a.order - b.order)
														.map(renderDynamicParameter)}
												</div>
											</Card>
										)}

										{/* ГРУППА: МАТЕРИАЛЫ И ЦВЕТА */}
										{groups.materials.length > 0 && (
											<Card className='p-4 bg-gray-50 border border-gray-200'>
												<h4 className='text-base font-semibold mb-4 text-gray-800'>
													🎨{' '}
													{locale === 'ru'
														? 'Материалы и цвета'
														: 'Materiali e colori'}
												</h4>
												<div className='space-y-4'>
													{groups.materials
														.sort((a, b) => a.order - b.order)
														.map(renderDynamicParameter)}
												</div>
											</Card>
										)}

										{/* ГРУППА: ФУНКЦИОНАЛЬНОСТЬ */}
										{groups.functionality.length > 0 && (
											<Card className='p-4 bg-gray-50 border border-gray-200'>
												<h4 className='text-base font-semibold mb-4 text-gray-800'>
													🔄{' '}
													{locale === 'ru'
														? 'Функциональность'
														: 'Funzionalità'}
												</h4>
												<div className='space-y-4'>
													{groups.functionality
														.sort((a, b) => a.order - b.order)
														.map(renderDynamicParameter)}
												</div>
											</Card>
										)}

										{/* ГРУППА: ФУРНИТУРА */}
										{groups.hardware.length > 0 && (
											<Card className='p-4 bg-gray-50 border border-gray-200'>
												<h4 className='text-base font-semibold mb-4 text-gray-800'>
													🔧 {locale === 'ru' ? 'Фурнитура' : 'Ferramenta'}
												</h4>
												<div className='space-y-4'>
													{groups.hardware
														.sort((a, b) => a.order - b.order)
														.map(renderDynamicParameter)}
												</div>
											</Card>
										)}

										{/* ГРУППА: ПРОЧЕЕ */}
										{groups.other.length > 0 && (
											<Card className='p-4 bg-gray-50 border border-gray-200'>
												<h4 className='text-base font-semibold mb-4 text-gray-800'>
													📋 {locale === 'ru' ? 'Дополнительно' : 'Altro'}
												</h4>
												<div className='space-y-4'>
													{groups.other
														.sort((a, b) => a.order - b.order)
														.map(renderDynamicParameter)}
												</div>
											</Card>
										)}
									</div>
								)
							})()
						) : (
							<div className='space-y-4'>
								{getCurrentSupplierCategory()?.parameters.map(renderParameter)}
							</div>
						)}

						<div className='mt-6 flex space-x-3'>
							<Button
								onClick={handleComplete}
								disabled={!canProceed() || loading}
								className='flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:bg-gray-400'
							>
								<Check className='w-4 h-4 mr-2' />
								{loading ? t('saving') : t('addToProposal')}
							</Button>
						</div>
					</div>

					{/* ПРАВАЯ ЗОНА: ВИЗУАЛИЗАЦИЯ (40%) - STICKY */}
					<div className='lg:sticky lg:top-4 lg:self-start'>
						{renderVisualization()}
					</div>
				</div>
			)}

			{/* Дополнительные заметки УДАЛЕНЫ - не нужны на Шаге 1 и Шаге 2 */}

			<div className='mt-6 flex justify-end gap-3'>
				{step > 1 && (
					<Button
						onClick={goBack}
						variant='outline'
						className='bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
					>
						<ArrowLeft className='h-4 w-4 mr-2' />
						Indietro
					</Button>
				)}
				<Button
					variant='outline'
					onClick={onCancel}
					className='border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400'
				>
					<X className='w-4 h-4 mr-2' />
					{t('cancel')}
				</Button>
			</div>

			{/* Модальное окно добавления категории */}
			<AddCategoryModal
				isOpen={showAddCategoryModal}
				onClose={() => setShowAddCategoryModal(false)}
				onSave={handleAddCategory}
			/>

			{/* Модальное окно редактирования категории */}
			{selectedCategoryForEdit && (
				<AddCategoryModal
					isOpen={showEditCategoryModal}
					onClose={() => {
						setShowEditCategoryModal(false)
						setSelectedCategoryForEdit(null)
					}}
					onSave={handleCategoryUpdated}
					initialData={{
						name: selectedCategoryForEdit.name,
						icon: selectedCategoryForEdit.icon,
						description: selectedCategoryForEdit.description || '',
					}}
				/>
			)}

			{/* Модальное окно удаления категории */}
			{selectedCategoryForDelete && (
				<div className='fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50'>
					<div className='bg-white rounded-xl shadow-xl border border-gray-200 p-6 max-w-md w-full mx-4'>
						<h3 className='text-lg font-semibold mb-4'>
							Conferma eliminazione
						</h3>
						<p className='text-gray-600 mb-6'>
							Sei sicuro di voler eliminare la categoria "
							{selectedCategoryForDelete.name}"? Questa azione non può essere
							annullata.
						</p>
						<div className='flex justify-end gap-3'>
							<Button
								variant='outline'
								onClick={() => {
									setShowDeleteCategoryModal(false)
									setSelectedCategoryForDelete(null)
								}}
							>
								Annulla
							</Button>
							<Button
								variant='outline'
								onClick={handleCategoryDeleted}
								className='bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
							>
								<Trash2 className='h-4 w-4 mr-2' />
								Elimina
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Модальное окно управления значениями параметра */}
			{selectedParameterForManager && (
				<ParameterValuesManager
					parameterId={selectedParameterForManager.id}
					parameterName={selectedParameterForManager.name}
					parameterType={selectedParameterForManager.type}
					open={showValuesManager}
					onClose={handleCloseValuesManager}
					onValuesChanged={handleCloseValuesManager}
				/>
			)}
		</div>
	)
}
