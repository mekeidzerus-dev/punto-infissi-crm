'use client'

import React from 'react'
import { FeatureGate } from '@/lib/feature-flags'

interface ProductVisualizationProps {
	configuration: {
		parameters: Record<string, any>
		categoryId: string
	}
	category: {
		name: string
	}
}

// Компонент размерных линий (улучшенный)
const DimensionLines = ({
	width,
	height,
}: {
	width: number
	height: number
}) => {
	return (
		<>
			{/* Горизонтальная линия (ширина) - снизу */}
			<div className='absolute -bottom-10 left-0 right-0'>
				<div className='flex justify-center'>
					<div className='flex items-center'>
						<div className='w-3 h-0.5 bg-blue-500'></div>
						<span className='mx-3 text-sm font-medium text-blue-600'>
							{width} мм
						</span>
						<div className='w-3 h-0.5 bg-blue-500'></div>
					</div>
				</div>
			</div>

			{/* Вертикальная линия (высота) - справа, дальше */}
			<div className='absolute -right-12 top-0 bottom-0'>
				<div className='flex flex-col justify-center h-full'>
					<div className='flex flex-col items-center'>
						<div className='w-0.5 h-3 bg-blue-500'></div>
						<span
							className='my-3 text-sm font-medium text-blue-600'
							style={{
								writingMode: 'vertical-rl',
								textOrientation: 'mixed',
							}}
						>
							{height} мм
						</span>
						<div className='w-0.5 h-3 bg-blue-500'></div>
					</div>
				</div>
			</div>
		</>
	)
}

// Функция отрисовки паттернов открытия С УЛУЧШЕННЫМИ ИНДИКАТОРАМИ
const renderOpeningPattern = (
	openingType: string,
	openingSide: string = 'Влево'
) => {
	const type = String(openingType).toLowerCase()
	const side = String(openingSide).toLowerCase()

	// Battente (распашное) - открывается наружу
	if (type.includes('battente') || type.includes('casement')) {
		const isLeftSide =
			side.includes('влево') ||
			side.includes('sinistra') ||
			side.includes('left')

		return (
			<div className='absolute inset-0'>
				{/* Петли - слева или справа в зависимости от стороны открытия */}
				<div
					className={`absolute ${
						isLeftSide ? 'left-1' : 'right-1'
					} top-1/2 transform -translate-y-1/2`}
				>
					<div className='w-1 h-3 bg-gray-600 rounded-full'></div>
					<div className='w-1 h-3 bg-gray-600 rounded-full mt-1'></div>
					<div className='w-1 h-3 bg-gray-600 rounded-full mt-1'></div>
				</div>

				{/* Стрелка направления открытия */}
				<div
					className={`absolute top-1/2 ${
						isLeftSide ? 'right-2' : 'left-2'
					} transform -translate-y-1/2`}
				>
					<div
						className={`text-blue-600 font-bold text-lg ${
							isLeftSide ? '' : 'transform scale-x-[-1]'
						}`}
					>
						→
					</div>
				</div>

				{/* Линия траектории открытия */}
				<div
					className={`absolute top-1/2 ${
						isLeftSide ? 'right-1' : 'left-1'
					} transform -translate-y-1/2`}
				>
					<div
						className={`w-8 h-0.5 bg-blue-300 opacity-50 ${
							isLeftSide ? '' : 'transform scale-x-[-1]'
						}`}
					></div>
					<div
						className={`absolute top-0 ${
							isLeftSide ? 'right-0' : 'left-0'
						} w-0 h-0 border-l-4 border-l-blue-300 border-t-2 border-t-transparent border-b-2 border-b-transparent ${
							isLeftSide ? '' : 'transform scale-x-[-1]'
						}`}
					></div>
				</div>
			</div>
		)
	}

	// Ribalta / Поворотно-откидное - наклоняется внутрь
	if (
		type.includes('ribalta') ||
		type.includes('tilt') ||
		type.includes('поворотно')
	) {
		return (
			<div className='absolute inset-0'>
				{/* Центральная ось поворота */}
				<div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
					<div className='w-8 h-8 border-2 border-gray-500 rounded-full bg-gray-200 bg-opacity-50 flex items-center justify-center'>
						<div className='w-2 h-2 bg-gray-500 rounded-full'></div>
					</div>
				</div>

				{/* Стрелка наклона (без текста) */}
				<div className='absolute bottom-2 left-1/2 transform -translate-x-1/2'>
					<div className='text-blue-600 font-bold text-lg'>↓</div>
				</div>

				{/* Линии траектории наклона */}
				<div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
					<div className='w-6 h-0.5 bg-blue-300 opacity-50 transform rotate-45'></div>
					<div className='w-6 h-0.5 bg-blue-300 opacity-50 transform -rotate-45'></div>
				</div>
			</div>
		)
	}

	// Scorrevole (раздвижное) - скользит горизонтально
	if (
		type.includes('scorrevole') ||
		type.includes('slide') ||
		type.includes('раздвижное')
	) {
		return (
			<div className='absolute inset-0'>
				{/* Направляющие рельсы */}
				<div className='absolute top-1 left-0 right-0 h-0.5 bg-gray-400'></div>
				<div className='absolute bottom-1 left-0 right-0 h-0.5 bg-gray-400'></div>

				{/* Ролики */}
				<div className='absolute top-0.5 left-2'>
					<div className='w-1 h-1 bg-gray-600 rounded-full'></div>
				</div>
				<div className='absolute top-0.5 right-2'>
					<div className='w-1 h-1 bg-gray-600 rounded-full'></div>
				</div>
				<div className='absolute bottom-0.5 left-2'>
					<div className='w-1 h-1 bg-gray-600 rounded-full'></div>
				</div>
				<div className='absolute bottom-0.5 right-2'>
					<div className='w-1 h-1 bg-gray-600 rounded-full'></div>
				</div>

				{/* Стрелки скольжения (без текста) */}
				<div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
					<div className='flex items-center space-x-2'>
						<div className='text-blue-600 font-bold text-sm'>←</div>
						<div className='text-blue-600 font-bold text-sm'>→</div>
					</div>
				</div>
			</div>
		)
	}

	// Fisso (глухое) - не открывается
	if (
		type.includes('fisso') ||
		type.includes('fixed') ||
		type.includes('глухое')
	) {
		return (
			<div className='absolute inset-0'>
				{/* Заглушка (без текста) */}
				<div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
					<div className='text-gray-400 font-bold text-xl'>🔒</div>
				</div>

				{/* Декоративные элементы */}
				<div className='absolute top-2 left-2 w-1 h-1 bg-gray-300 rounded-full'></div>
				<div className='absolute top-2 right-2 w-1 h-1 bg-gray-300 rounded-full'></div>
				<div className='absolute bottom-2 left-2 w-1 h-1 bg-gray-300 rounded-full'></div>
				<div className='absolute bottom-2 right-2 w-1 h-1 bg-gray-300 rounded-full'></div>
			</div>
		)
	}

	return null
}

// Основной компонент визуализации
export const ProductVisualizer = ({
	configuration,
	category,
}: ProductVisualizationProps) => {
	const { parameters } = configuration

	// ОТЛАДКА: выводим параметры в консоль
	console.log('🔍 ProductVisualizer parameters:', parameters)
	console.log('🔍 Parameter keys:', Object.keys(parameters))
	console.log('🔍 Parameter values:', Object.values(parameters))

	// Извлекаем значения из динамических параметров
	// Параметры теперь хранятся по ID из базы данных
	const getParameterValue = (names: string[]) => {
		for (const [key, value] of Object.entries(parameters)) {
			// Ищем по ID или по старому ключу
			if (names.includes(key)) {
				return value
			}
		}
		return null
	}

	// Извлекаем ширину и высоту из параметров по ID
	// Ищем числовые значения, которые могут быть размерами
	const numericValues = Object.values(parameters).filter(
		v => typeof v === 'number' && v > 0
	) as number[]

	// Сортируем числа: меньшее = ширина, большее = высота
	const sortedValues = numericValues.sort((a, b) => a - b)

	const width =
		sortedValues.length >= 1
			? sortedValues[0] >= 400 && sortedValues[0] <= 3000
				? sortedValues[0]
				: 1000
			: 1000
	const height =
		sortedValues.length >= 2
			? sortedValues[1] >= 400 && sortedValues[1] <= 2500
				? sortedValues[1]
				: 2000
			: sortedValues.length === 1 && sortedValues[0] > 1000
			? sortedValues[0] // Если только одно число и оно большое, считаем высотой
			: 2000

	// Извлекаем цвета и тип открытия из строковых значений
	const stringValues = Object.values(parameters).filter(
		v => typeof v === 'string' && v.length > 0
	) as string[]

	// Ищем цвет рамки среди строковых значений (более точный поиск)
	const colorKeywords = [
		'Bianco',
		'Белый',
		'Marrone',
		'Коричневый',
		'Antracite',
		'Антрацит',
		'Grigio',
		'Серый',
		'Nero',
		'Черный',
		'Beige',
		'Бежевый',
	]

	const frameColor =
		stringValues.find(color =>
			colorKeywords.some(keyword =>
				color.toLowerCase().includes(keyword.toLowerCase())
			)
		) || 'Bianco'

	// Ищем тип открытия среди строковых значений (более точный поиск)
	const openingKeywords = [
		'Battente',
		'Ribalta',
		'Scorrevole',
		'Fisso',
		'распашное',
		'поворотно-откидное',
		'раздвижное',
		'глухое',
	]

	const openingType =
		stringValues.find(type =>
			openingKeywords.some(keyword =>
				type.toLowerCase().includes(keyword.toLowerCase())
			)
		) || 'Fisso'

	// Извлекаем сторону открытия
	const openingSideKeywords = [
		'влево',
		'вправо',
		'sinistra',
		'destra',
		'left',
		'right',
	]
	const openingSide =
		stringValues.find(side =>
			openingSideKeywords.some(keyword =>
				side.toLowerCase().includes(keyword.toLowerCase())
			)
		) || 'Влево'

	const glassColor = '#87CEEB' // Стандартный цвет стекла

	// ОТЛАДКА: выводим извлеченные значения
	console.log('📏 Extracted width:', width)
	console.log('📏 Extracted height:', height)
	console.log('🎨 Extracted frameColor:', frameColor)
	console.log('🔄 Extracted openingType:', openingType)
	console.log('↔️ Extracted openingSide:', openingSide)
	console.log('🔢 Numeric values:', numericValues)
	console.log('🔢 Sorted values:', sortedValues)
	console.log('📝 String values:', stringValues)
	console.log(
		'🎨 Color keywords found:',
		stringValues.filter(color =>
			colorKeywords.some(keyword =>
				color.toLowerCase().includes(keyword.toLowerCase())
			)
		)
	)
	console.log(
		'🔄 Opening keywords found:',
		stringValues.filter(type =>
			openingKeywords.some(keyword =>
				type.toLowerCase().includes(keyword.toLowerCase())
			)
		)
	)

	// Определяем hex цвет для рамки (улучшенная версия)
	const getHexColor = (colorValue: any) => {
		if (!colorValue) return '#FFFFFF'

		const colorValueStr = String(colorValue).toLowerCase()

		// Белый
		if (colorValueStr.includes('bianco') || colorValueStr.includes('белый')) {
			return '#FFFFFF'
		}
		// Коричневый
		if (
			colorValueStr.includes('marrone') ||
			colorValueStr.includes('коричневый')
		) {
			return '#8B4513'
		}
		// Антрацит
		if (
			colorValueStr.includes('antracite') ||
			colorValueStr.includes('антрацит')
		) {
			return '#36454F'
		}
		// Серый
		if (colorValueStr.includes('grigio') || colorValueStr.includes('серый')) {
			return '#808080'
		}
		// Черный
		if (colorValueStr.includes('nero') || colorValueStr.includes('черный')) {
			return '#000000'
		}
		// Бежевый
		if (colorValueStr.includes('beige') || colorValueStr.includes('бежевый')) {
			return '#F5F5DC'
		}

		// Fallback
		return '#FFFFFF'
	}

	return (
		<FeatureGate feature='PRODUCT_VISUALIZATION'>
			<div className='bg-gray-50 p-6 rounded-lg'>
				<h3 className='font-semibold mb-4'>Визуализация заказа</h3>

				<div className='relative'>
					{/* Основная визуализация - ТОЛЬКО ГРАФИКА */}
					<div className='relative inline-block'>
						{/* Рамка продукта */}
						<div
							className='border-4 relative'
							style={{
								width: `${Math.min(Number(width) / 10, 300)}px`,
								height: `${Math.min(Number(height) / 10, 200)}px`,
								backgroundColor: getHexColor(frameColor),
								borderColor: getHexColor(frameColor),
							}}
						>
							{/* Стекло */}
							<div
								className='absolute inset-2'
								style={{ backgroundColor: glassColor }}
							>
								{/* Паттерны открытия */}
								{renderOpeningPattern(openingType, openingSide)}
							</div>

							{/* Ручки - только для открывающихся окон */}
							{openingType !== 'Fisso' &&
								openingType !== 'fixed' &&
								!openingType.toLowerCase().includes('fisso') && (
									<div className='absolute right-1 top-1/2 transform -translate-y-1/2'>
										<div className='w-1.5 h-4 bg-gray-600 rounded-sm'></div>
										<div className='absolute -right-0.5 top-1/2 transform -translate-y-1/2 w-1 h-1 bg-gray-600 rounded-full'></div>
									</div>
								)}
						</div>

						{/* Размерные линии */}
						<DimensionLines width={Number(width)} height={Number(height)} />
					</div>

					{/* ИНФОРМАЦИОННАЯ ПАНЕЛЬ УДАЛЕНА - параметры уже есть слева */}
				</div>
			</div>
		</FeatureGate>
	)
}

// Fallback компонент (старая визуализация)
export const LegacyProductVisualizer = ({
	configuration,
}: {
	configuration: any
}) => {
	return (
		<div className='bg-gray-50 p-4 rounded-lg'>
			<h3 className='font-semibold mb-2'>Конфигурация товара</h3>
			<div className='space-y-1 text-sm'>
				{Object.entries(configuration.parameters || {}).map(([key, value]) => (
					<div key={key} className='flex justify-between'>
						<span className='capitalize'>{key}:</span>
						<span className='font-medium'>{String(value)}</span>
					</div>
				))}
			</div>
		</div>
	)
}
