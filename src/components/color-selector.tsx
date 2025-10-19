'use client'

import React from 'react'
import { FeatureGate } from '@/lib/feature-flags'

interface ColorOption {
	value: string
	name: string
	hex?: string
	ral?: string
}

interface ColorSelectorProps {
	colors: ColorOption[]
	selectedColor: string
	onSelect: (color: string) => void
	disabled?: boolean
}

// Компонент для отображения цветов
export const ColorSelector = ({
	colors,
	selectedColor,
	onSelect,
	disabled,
}: ColorSelectorProps) => {
	return (
		<FeatureGate
			feature='COLOR_SQUARES'
			fallback={
				// Fallback - обычный select
				<select
					value={selectedColor}
					onChange={e => onSelect(e.target.value)}
					disabled={disabled}
					className='w-full p-2 border rounded'
				>
					{colors.map(color => (
						<option key={color.value} value={color.value}>
							{color.name} {color.ral ? `(${color.ral})` : ''}
						</option>
					))}
				</select>
			}
		>
			<div className='grid grid-cols-6 gap-2'>
				{colors.map(color => (
					<div
						key={color.value}
						className={`w-8 h-8 rounded border-2 cursor-pointer transition-all ${
							selectedColor === color.value
								? 'border-blue-500 ring-2 ring-blue-200'
								: 'border-gray-300 hover:border-gray-400'
						} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
						style={{ backgroundColor: color.hex || color.value }}
						onClick={() => !disabled && onSelect(color.value)}
						title={`${color.name}${color.ral ? ` (${color.ral})` : ''}`}
					>
						{/* Индикатор выбора */}
						{selectedColor === color.value && (
							<div className='w-full h-full flex items-center justify-center'>
								<div className='w-3 h-3 bg-white rounded-full shadow-sm'></div>
							</div>
						)}
					</div>
				))}
			</div>

			{/* Информация о выбранном цвете */}
			{selectedColor && (
				<div className='mt-2 text-sm text-gray-600'>
					{colors.find(c => c.value === selectedColor)?.name}
					{colors.find(c => c.value === selectedColor)?.ral &&
						` (${colors.find(c => c.value === selectedColor)?.ral})`}
				</div>
			)}
		</FeatureGate>
	)
}

// Предустановленные цветовые схемы
export const COLOR_PRESETS = {
	// Стандартные цвета рамок
	frameColors: [
		{ value: 'white', name: 'Белый', hex: '#FFFFFF', ral: 'RAL 9010' },
		{ value: 'brown', name: 'Коричневый', hex: '#8B4513', ral: 'RAL 8017' },
		{ value: 'black', name: 'Черный', hex: '#000000', ral: 'RAL 9005' },
		{ value: 'gray', name: 'Серый', hex: '#808080', ral: 'RAL 7040' },
		{ value: 'beige', name: 'Бежевый', hex: '#F5F5DC', ral: 'RAL 1014' },
		{ value: 'anthracite', name: 'Антрацит', hex: '#36454F', ral: 'RAL 7016' },
	],

	// Цвета стекла
	glassColors: [
		{ value: 'clear', name: 'Прозрачное', hex: '#87CEEB' },
		{ value: 'bronze', name: 'Бронзовое', hex: '#CD7F32' },
		{ value: 'gray', name: 'Серое', hex: '#708090' },
		{ value: 'blue', name: 'Синее', hex: '#4169E1' },
		{ value: 'green', name: 'Зеленое', hex: '#228B22' },
	],

	// RAL цвета (расширенная палитра)
	ralColors: [
		{ value: 'ral-9010', name: 'RAL 9010', hex: '#FFFFFF', ral: 'RAL 9010' },
		{ value: 'ral-1014', name: 'RAL 1014', hex: '#F5F5DC', ral: 'RAL 1014' },
		{ value: 'ral-8017', name: 'RAL 8017', hex: '#8B4513', ral: 'RAL 8017' },
		{ value: 'ral-9005', name: 'RAL 9005', hex: '#000000', ral: 'RAL 9005' },
		{ value: 'ral-7040', name: 'RAL 7040', hex: '#808080', ral: 'RAL 7040' },
		{ value: 'ral-7016', name: 'RAL 7016', hex: '#36454F', ral: 'RAL 7016' },
		{ value: 'ral-3000', name: 'RAL 3000', hex: '#CC0605', ral: 'RAL 3000' },
		{ value: 'ral-5002', name: 'RAL 5002', hex: '#1E213D', ral: 'RAL 5002' },
	],
} as const

// Функция для получения цветовой схемы по типу параметра
export const getColorScheme = (parameterType: string): ColorOption[] => {
	switch (parameterType) {
		case 'frameColor':
		case 'color':
			return [...COLOR_PRESETS.frameColors]
		case 'glassColor':
			return [...COLOR_PRESETS.glassColors]
		case 'ralColor':
			return [...COLOR_PRESETS.ralColors]
		default:
			return [...COLOR_PRESETS.frameColors]
	}
}
