'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ProductVisualizationProps {
	configuration: Record<string, any>
	parameters: Array<{
		id: string
		name: string
		type: string
		group?: string
	}>
	className?: string
}

interface VisualizationLayer {
	id: string
	name: string
	type: 'material' | 'color' | 'size' | 'detail' | 'base'
	parameterId?: string
	visible: boolean
	style: React.CSSProperties
	svg?: string
}

export function ProductVisualization({
	configuration,
	parameters,
	className,
}: ProductVisualizationProps) {
	const [layers, setLayers] = useState<VisualizationLayer[]>([])
	const [selectedLayer, setSelectedLayer] = useState<string | null>(null)

	// Инициализация слоев при загрузке
	useEffect(() => {
		const initialLayers: VisualizationLayer[] = [
			// Базовый слой - контур двери
			{
				id: 'base-door',
				name: 'Контур двери',
				type: 'base',
				visible: true,
				style: {
					width: '100%',
					height: '100%',
					border: '3px solid #374151',
					borderRadius: '8px',
					backgroundColor: '#f3f4f6',
				},
			},
			// Слои материалов
			{
				id: 'material-mdf',
				name: 'МДФ',
				type: 'material',
				visible: false,
				style: {
					width: '100%',
					height: '100%',
					background: 'linear-gradient(45deg, #d1d5db 0%, #9ca3af 100%)',
					borderRadius: '4px',
				},
			},
			{
				id: 'material-wood',
				name: 'Дерево',
				type: 'material',
				visible: false,
				style: {
					width: '100%',
					height: '100%',
					background: 'linear-gradient(45deg, #8B4513 0%, #A0522D 100%)',
					borderRadius: '4px',
				},
			},
			{
				id: 'material-metal',
				name: 'Металл',
				type: 'material',
				visible: false,
				style: {
					width: '100%',
					height: '100%',
					background: 'linear-gradient(45deg, #6b7280 0%, #4b5563 100%)',
					borderRadius: '4px',
				},
			},
			// Слои цветов
			{
				id: 'color-white',
				name: 'Белый',
				type: 'color',
				visible: false,
				style: {
					width: '100%',
					height: '100%',
					backgroundColor: '#ffffff',
					borderRadius: '4px',
					opacity: 0.8,
				},
			},
			{
				id: 'color-brown',
				name: 'Коричневый',
				type: 'color',
				visible: false,
				style: {
					width: '100%',
					height: '100%',
					backgroundColor: '#8B4513',
					borderRadius: '4px',
					opacity: 0.8,
				},
			},
			{
				id: 'color-black',
				name: 'Черный',
				type: 'color',
				visible: false,
				style: {
					width: '100%',
					height: '100%',
					backgroundColor: '#000000',
					borderRadius: '4px',
					opacity: 0.8,
				},
			},
			// Слои деталей
			{
				id: 'detail-handle',
				name: 'Ручка',
				type: 'detail',
				visible: true,
				style: {
					position: 'absolute',
					right: '12px',
					top: '50%',
					transform: 'translateY(-50%)',
					width: '12px',
					height: '12px',
					backgroundColor: '#6b7280',
					borderRadius: '50%',
					border: '2px solid #374151',
				},
			},
			{
				id: 'detail-glass',
				name: 'Стекло',
				type: 'detail',
				visible: false,
				style: {
					position: 'absolute',
					top: '20%',
					left: '50%',
					transform: 'translateX(-50%)',
					width: '60%',
					height: '40%',
					backgroundColor: 'rgba(147, 197, 253, 0.3)',
					border: '2px solid #3b82f6',
					borderRadius: '4px',
				},
			},
		]

		setLayers(initialLayers)
	}, [])

	// Обновление видимости слоев на основе конфигурации
	useEffect(() => {
		setLayers(prevLayers => {
			return prevLayers.map(layer => {
				let visible = layer.visible

				// Проверяем параметры материала
				if (layer.type === 'material') {
					const materialValue = configuration['material'] || ''
					visible = layer.name.toLowerCase() === materialValue.toLowerCase()
				}

				// Проверяем параметры цвета
				if (layer.type === 'color') {
					const colorValue = configuration['color'] || ''
					visible = layer.name.toLowerCase() === colorValue.toLowerCase()
				}

				// Проверяем параметры деталей
				if (layer.type === 'detail') {
					if (layer.id === 'detail-glass') {
						visible =
							configuration['glass'] === true ||
							configuration['glass'] === 'true'
					}
				}

				return { ...layer, visible }
			})
		})
	}, [configuration])

	// Обновление размеров на основе конфигурации
	const doorWidth = configuration.width
		? Math.min(configuration.width / 10, 120)
		: 80
	const doorHeight = configuration.height
		? Math.min(configuration.height / 10, 240)
		: 200

	const toggleLayer = (layerId: string) => {
		setLayers(prevLayers =>
			prevLayers.map(layer =>
				layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
			)
		)
	}

	const assignParameterToLayer = (layerId: string, parameterId: string) => {
		setLayers(prevLayers =>
			prevLayers.map(layer =>
				layer.id === layerId ? { ...layer, parameterId } : layer
			)
		)
	}

	return (
		<div className={cn('bg-gray-50 rounded-lg p-3', className)}>
			{/* Заголовок */}
			<div className='mb-3'>
				<h4 className='text-sm font-medium text-gray-700 mb-2'>
					Визуализация двери
				</h4>

				{/* Панель управления слоями */}
				<div className='flex flex-wrap gap-1 mb-2'>
					{layers.map(layer => (
						<button
							key={layer.id}
							onClick={() => toggleLayer(layer.id)}
							className={`px-2 py-1 text-xs rounded border transition-colors ${
								layer.visible
									? 'bg-blue-100 border-blue-300 text-blue-700'
									: 'bg-gray-100 border-gray-300 text-gray-500'
							}`}
						>
							{layer.name}
						</button>
					))}
				</div>
			</div>

			{/* Область визуализации */}
			<div className='bg-white border rounded-lg p-3 flex items-center justify-center min-h-[160px]'>
				<div
					className='relative'
					style={{
						width: `${doorWidth}px`,
						height: `${doorHeight}px`,
					}}
				>
					{/* Рендерим все видимые слои */}
					{layers
						.filter(layer => layer.visible)
						.map(layer => (
							<div
								key={layer.id}
								className='absolute inset-0'
								style={layer.style}
							/>
						))}
				</div>
			</div>

			{/* Информация о параметрах */}
			<div className='mt-2 text-xs text-gray-500'>
				<div>
					Размеры: {doorWidth}×{doorHeight}px
				</div>
				<div>Активных слоев: {layers.filter(l => l.visible).length}</div>
			</div>
		</div>
	)
}
