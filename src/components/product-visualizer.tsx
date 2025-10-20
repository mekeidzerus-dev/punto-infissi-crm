'use client'

import { useEffect, useState } from 'react'

interface ProductVisualizerProps {
	categoryName: string
	parameters: Record<string, any>
	categoryParameters?: any[]
}

export function ProductVisualizer({
	categoryName,
	parameters,
	categoryParameters = [],
}: ProductVisualizerProps) {
	const [dimensions, setDimensions] = useState({ width: 300, height: 400 })

	// Утилита для получения значения параметра по имени
	const getParamValue = (names: string[]) => {
		for (const name of names) {
			const param = categoryParameters.find(
				cp =>
					cp.parameter.name === name ||
					cp.parameter.nameIt === name ||
					cp.parameter.name.toLowerCase().includes(name.toLowerCase())
			)
			if (param && parameters[param.parameter.id]) {
				return parameters[param.parameter.id]
			}
		}
		return null
	}

	// Получаем ширину и высоту
	const width = getParamValue(['Ширина', 'Larghezza', 'width']) || 1000
	const height = getParamValue(['Высота', 'Altezza', 'height']) || 2000

	useEffect(() => {
		// Масштабируем размеры для отображения (фиксированный размер контейнера)
		const maxWidth = 300
		const maxHeight = 400
		const scale = Math.min(maxWidth / width, maxHeight / height)
		setDimensions({
			width: width * scale,
			height: height * scale,
		})
	}, [width, height])

	// Получаем цвет рамы (может быть с HEX или RAL кодом)
	const getFrameColor = () => {
		const colorValue =
			getParamValue(['Цвет рамы', 'Colore telaio', 'frame_color']) || ''

		// Если это объект с hexColor
		if (typeof colorValue === 'object' && colorValue.hexColor) {
			return colorValue.hexColor
		}

		// Если это строка с HEX
		if (typeof colorValue === 'string' && colorValue.startsWith('#')) {
			return colorValue
		}

		// Если это строка с названием - пытаемся определить цвет
		const colorStr = typeof colorValue === 'string' ? colorValue : ''
		if (
			colorStr.includes('Белый') ||
			colorStr.includes('Bianco') ||
			colorStr.includes('9010') ||
			colorStr.includes('9016')
		)
			return '#F1F0EA'
		if (
			colorStr.includes('Серый') ||
			colorStr.includes('Grigio') ||
			colorStr.includes('7016')
		)
			return '#383E42'
		if (
			colorStr.includes('Коричневый') ||
			colorStr.includes('Marrone') ||
			colorStr.includes('8011')
		)
			return '#5A3A29'
		if (
			colorStr.includes('Чёрн') ||
			colorStr.includes('Nero') ||
			colorStr.includes('9005')
		)
			return '#0E0E10'

		return '#CBD0CC' // По умолчанию светло-серый (RAL 7035)
	}

	// Получаем материал
	const getMaterial = () => {
		const material = getParamValue(['Материал', 'Materiale', 'material']) || ''
		const materialStr = typeof material === 'string' ? material : ''
		if (materialStr.includes('ПВХ') || materialStr.includes('PVC')) return 'PVC'
		if (materialStr.includes('Алюминий') || materialStr.includes('Alluminio'))
			return 'AL'
		if (materialStr.includes('Дерев') || materialStr.includes('Legno'))
			return 'WOOD'
		return materialStr
	}

	const frameColor = getFrameColor()
	const material = getMaterial()

	// Рендер двери
	const renderDoor = () => {
		const openingType =
			getParamValue(['Тип открытия', 'Tipo di apertura', 'opening_type']) || ''
		const openingSide =
			getParamValue(['Сторона открытия', 'Lato di apertura', 'opening_side']) ||
			'Влево'

		const opening = `${openingType} ${openingSide}`
		const hasHandle = true // Всегда показываем ручку для дверей

		return (
			<div
				className='relative'
				style={{ width: dimensions.width, height: dimensions.height }}
			>
				{/* Основа двери */}
				<div
					className='absolute inset-0 rounded-lg shadow-lg border-4'
					style={{
						backgroundColor: frameColor,
						borderColor: '#374151',
					}}
				>
					{/* Текстура материала */}
					{material === 'WOOD' && (
						<div className='absolute inset-0 opacity-20'>
							<svg width='100%' height='100%'>
								<defs>
									<pattern
										id='wood'
										x='0'
										y='0'
										width='20'
										height='20'
										patternUnits='userSpaceOnUse'
									>
										<line
											x1='0'
											y1='0'
											x2='0'
											y2='20'
											stroke='#000'
											strokeWidth='0.5'
										/>
										<line
											x1='10'
											y1='0'
											x2='10'
											y2='20'
											stroke='#000'
											strokeWidth='0.3'
										/>
									</pattern>
								</defs>
								<rect width='100%' height='100%' fill='url(#wood)' />
							</svg>
						</div>
					)}

					{/* Панели двери */}
					<div className='absolute inset-4 grid grid-rows-3 gap-2'>
						<div className='border-2 border-gray-700 rounded' />
						<div className='border-2 border-gray-700 rounded' />
						<div className='border-2 border-gray-700 rounded' />
					</div>

					{/* Ручка */}
					{hasHandle && (
						<div
							className='absolute bg-gradient-to-b from-gray-300 to-gray-600 rounded-full shadow-md'
							style={{
								width: '12px',
								height: '60px',
								right:
									openingSide.includes('лев') || openingSide.includes('Left')
										? '10px'
										: 'auto',
								left:
									openingSide.includes('прав') || openingSide.includes('Right')
										? '10px'
										: 'auto',
								top: '50%',
								transform: 'translateY(-50%)',
							}}
						/>
					)}
				</div>

				{/* Стрелка направления открывания */}
				<div className='absolute -top-10 left-0 right-0 flex items-center justify-center'>
					<div className='bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg shadow-md flex items-center gap-2'>
						<span className='text-lg font-bold'>
							{openingSide.includes('лев') || openingSide.includes('Left')
								? '←'
								: '→'}
						</span>
						<span>{openingType || 'Apertura'}</span>
					</div>
				</div>
			</div>
		)
	}

	// Рендер окна
	const renderWindow = () => {
		const glassType =
			getParamValue(['Стекло', 'Vetro', 'glass']) || 'Однокамерный'
		const openingType =
			getParamValue(['Тип открытия', 'Tipo di apertura', 'opening_type']) ||
			'Поворотное'
		const hasHandle = true // Всегда показываем ручку для окон

		const glassCount = glassType.includes('Однокамерный')
			? 1
			: glassType.includes('Двухкамерный')
			? 2
			: 3

		return (
			<div
				className='relative'
				style={{ width: dimensions.width, height: dimensions.height }}
			>
				{/* Рама окна */}
				<div
					className='absolute inset-0 rounded shadow-lg border-8'
					style={{
						backgroundColor: frameColor,
						borderColor: '#374151',
					}}
				>
					{/* Стекло */}
					<div className='absolute inset-3 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 border-2 border-blue-200'>
						{/* Эффект стеклопакета */}
						{Array.from({ length: glassCount }).map((_, i) => (
							<div
								key={i}
								className='absolute inset-0 border border-blue-300 opacity-30'
								style={{
									transform: `translate(${i * 2}px, ${i * 2}px)`,
								}}
							/>
						))}

						{/* Отражение */}
						<div className='absolute top-0 left-0 w-1/3 h-1/3 bg-white opacity-40 blur-xl' />
					</div>

					{/* Импост (вертикальная перемычка) */}
					<div
						className='absolute top-0 bottom-0 w-2'
						style={{
							left: '50%',
							transform: 'translateX(-50%)',
							backgroundColor: frameColor,
							borderLeft: '1px solid #374151',
							borderRight: '1px solid #374151',
						}}
					/>

					{/* Импост (горизонтальная перемычка) */}
					<div
						className='absolute left-0 right-0 h-2'
						style={{
							top: '50%',
							transform: 'translateY(-50%)',
							backgroundColor: frameColor,
							borderTop: '1px solid #374151',
							borderBottom: '1px solid #374151',
						}}
					/>

					{/* Ручка */}
					{hasHandle && (
						<div
							className='absolute bg-gradient-to-b from-gray-300 to-gray-600 rounded-full shadow-md'
							style={{
								width: '8px',
								height: '40px',
								right: '12px',
								top: '50%',
								transform: 'translateY(-50%)',
							}}
						/>
					)}
				</div>

				{/* Тип открывания */}
				<div className='absolute -top-8 left-0 right-0 flex items-center justify-center'>
					<div className='bg-green-500 text-white text-xs px-2 py-1 rounded'>
						{openingType}
					</div>
				</div>

				{/* Индикатор стеклопакета */}
				<div className='absolute -bottom-8 left-0 right-0 flex items-center justify-center'>
					<div className='bg-blue-500 text-white text-xs px-2 py-1 rounded'>
						{glassCount}-камерный
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className='flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg min-h-[500px]'>
			{/* Заголовок */}
			<div className='mb-6 text-center'>
				<h3 className='text-lg font-semibold text-gray-900 mb-2'>
					Визуализация продукта
				</h3>
				<div className='flex items-center gap-4 justify-center text-sm text-gray-600'>
					<span className='px-2 py-1 bg-white rounded border'>{material}</span>
					<span className='px-2 py-1 bg-white rounded border'>
						{parameters.width} × {parameters.height} мм
					</span>
				</div>
			</div>

			{/* Визуализация */}
			<div className='relative'>
				{categoryName.includes('Двер') ||
				categoryName.includes('Дверь') ||
				categoryName.includes('Door')
					? renderDoor()
					: renderWindow()}
			</div>

			{/* Размеры */}
			<div className='mt-6 grid grid-cols-2 gap-4 text-sm'>
				<div className='text-center'>
					<div className='text-gray-500'>Ширина</div>
					<div className='font-semibold text-gray-900'>{width} мм</div>
				</div>
				<div className='text-center'>
					<div className='text-gray-500'>Высота</div>
					<div className='font-semibold text-gray-900'>{height} мм</div>
				</div>
			</div>

			{/* Материал и цвет */}
			<div className='mt-4 flex items-center gap-4'>
				<div className='flex items-center gap-2'>
					<div
						className='w-6 h-6 rounded border-2 border-gray-300 shadow-sm'
						style={{ backgroundColor: frameColor }}
					/>
					<span className='text-sm text-gray-600'>
						{getParamValue(['Цвет рамы', 'Colore telaio']) || 'Colore'}
					</span>
				</div>
			</div>
		</div>
	)
}
