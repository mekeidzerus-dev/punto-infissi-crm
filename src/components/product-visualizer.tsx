'use client'

import { useEffect, useState } from 'react'

interface ProductVisualizerProps {
	categoryName: string
	parameters: Record<string, any>
}

export function ProductVisualizer({
	categoryName,
	parameters,
}: ProductVisualizerProps) {
	const [dimensions, setDimensions] = useState({ width: 300, height: 400 })

	useEffect(() => {
		// Масштабируем размеры для отображения
		const width = parameters.width || 1000
		const height = parameters.height || 2000
		const scale = Math.min(300 / width, 400 / height)
		setDimensions({
			width: width * scale,
			height: height * scale,
		})
	}, [parameters.width, parameters.height])

	// Получаем цвет из параметра
	const getColor = () => {
		const colorParam = parameters.color || ''
		if (colorParam.includes('Белый') || colorParam.includes('9010'))
			return '#F5F5F5'
		if (colorParam.includes('Серый') || colorParam.includes('7011'))
			return '#525252'
		if (colorParam.includes('Красный') || colorParam.includes('3003'))
			return '#DC2626'
		if (colorParam.includes('Коричневый')) return '#78350F'
		return '#D1D5DB' // По умолчанию серый
	}

	// Получаем материал
	const getMaterial = () => {
		const material = parameters.material || ''
		if (material.includes('ПВХ')) return 'PVC'
		if (material.includes('Алюминий')) return 'AL'
		if (material.includes('Дерево')) return 'WOOD'
		return material
	}

	const color = getColor()
	const material = getMaterial()

	// Рендер двери
	const renderDoor = () => {
		const opening = parameters.opening || 'Внутрь-влево'
		const hasHandle = parameters.handle && parameters.handle !== 'Без ручки'
		const hasLock = parameters.lock && parameters.lock !== 'Без замка'

		return (
			<div
				className='relative'
				style={{ width: dimensions.width, height: dimensions.height }}
			>
				{/* Основа двери */}
				<div
					className='absolute inset-0 rounded-lg shadow-lg border-4'
					style={{
						backgroundColor: color,
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
								right: opening.includes('влево') ? '10px' : 'auto',
								left: opening.includes('вправо') ? '10px' : 'auto',
								top: '50%',
								transform: 'translateY(-50%)',
							}}
						/>
					)}

					{/* Замок */}
					{hasLock && (
						<div
							className='absolute bg-gray-800 rounded shadow'
							style={{
								width: '20px',
								height: '8px',
								right: opening.includes('влево') ? '8px' : 'auto',
								left: opening.includes('вправо') ? '8px' : 'auto',
								top: '50%',
								transform: 'translateY(-20px)',
							}}
						/>
					)}
				</div>

				{/* Стрелка направления открывания */}
				<div className='absolute -top-8 left-0 right-0 flex items-center justify-center'>
					<div className='bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1'>
						{opening.includes('влево') ? '←' : '→'}
						{opening.includes('Внутрь') ? ' Внутрь' : ' Наружу'}
					</div>
				</div>
			</div>
		)
	}

	// Рендер окна
	const renderWindow = () => {
		const glassType = parameters.glass || 'Однокамерный'
		const openingType = parameters.opening || 'Поворотное'
		const hasHandle = parameters.handle && parameters.handle !== 'Без ручки'

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
						backgroundColor: color,
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
							backgroundColor: color,
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
							backgroundColor: color,
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
					<div className='font-semibold text-gray-900'>
						{parameters.width} мм
					</div>
				</div>
				<div className='text-center'>
					<div className='text-gray-500'>Высота</div>
					<div className='font-semibold text-gray-900'>
						{parameters.height} мм
					</div>
				</div>
			</div>

			{/* Материал и цвет */}
			<div className='mt-4 flex items-center gap-4'>
				<div className='flex items-center gap-2'>
					<div
						className='w-6 h-6 rounded border-2 border-gray-300 shadow-sm'
						style={{ backgroundColor: color }}
					/>
					<span className='text-sm text-gray-600'>{parameters.color}</span>
				</div>
			</div>
		</div>
	)
}
