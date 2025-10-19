'use client'

import { useState } from 'react'
import { Plus, Check, X, List } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { hexToRAL } from '@/lib/hex-to-ral'

interface InlineAddSelectValueProps {
	parameterId: string
	parameterName: string
	parameterType: string
	onValueAdded: (newValue: any) => void
	onShowAllValues?: () => void
}

export function InlineAddSelectValue({
	parameterId,
	parameterName,
	parameterType,
	onValueAdded,
	onShowAllValues,
}: InlineAddSelectValueProps) {
	const [isAdding, setIsAdding] = useState(false)
	const [newValue, setNewValue] = useState('')
	const [hexColor, setHexColor] = useState('#FFFFFF')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleAdd = async () => {
		if (!newValue.trim()) return

		setIsSubmitting(true)

		// Автоматически определяем RAL код для цветов
		let ralCode = null
		if (parameterType === 'COLOR') {
			ralCode = hexToRAL(hexColor)
		}

		try {
			const response = await fetch('/api/parameter-values/quick-add', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					parameterId,
					value: newValue.trim(),
					valueIt: newValue.trim(),
					hexColor: parameterType === 'COLOR' ? hexColor : null,
					ralCode: ralCode,
					createdBy: 'admin', // TODO: получать из сессии пользователя
				}),
			})

			if (response.ok) {
				const createdValue = await response.json()
				onValueAdded(createdValue)
				setNewValue('')
				setHexColor('#FFFFFF')
				setIsAdding(false)
			} else {
				const error = await response.json()
				alert(error.error || 'Ошибка при добавлении значения')
			}
		} catch (error) {
			console.error('Error adding value:', error)
			alert('Ошибка при добавлении значения')
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleCancel = () => {
		setNewValue('')
		setHexColor('#FFFFFF')
		setIsAdding(false)
	}

	if (!isAdding) {
		return (
			<div className='border-t border-gray-200'>
				{/* Кнопка "Показать весь список" */}
				{onShowAllValues && (
					<div
						onClick={e => {
							e.preventDefault()
							e.stopPropagation()
							onShowAllValues()
						}}
						className='px-2 py-2 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer flex items-center gap-2'
					>
						<List className='h-4 w-4' />
						<span>Показать весь список...</span>
					</div>
				)}

				{/* Кнопка добавления */}
				<div
					onClick={e => {
						e.preventDefault()
						e.stopPropagation()
						setIsAdding(true)
					}}
					className='px-2 py-2 text-sm text-blue-600 hover:bg-blue-50 cursor-pointer flex items-center gap-2'
				>
					<Plus className='h-4 w-4' />
					<span>Добавить новое значение...</span>
				</div>
			</div>
		)
	}

	return (
		<div
			onClick={e => {
				e.preventDefault()
				e.stopPropagation()
			}}
			className='px-2 py-2 bg-gray-50 border-t border-gray-200'
		>
			<div className='space-y-2'>
				<div className='space-y-2'>
					<div className='flex items-center gap-2'>
						<Input
							type='text'
							placeholder='Введите значение...'
							value={newValue}
							onChange={e => setNewValue(e.target.value)}
							onKeyDown={e => {
								e.stopPropagation()
								if (e.key === 'Enter') {
									e.preventDefault()
									handleAdd()
								} else if (e.key === 'Escape') {
									e.preventDefault()
									handleCancel()
								}
							}}
							className='flex-1 h-8 text-sm'
							autoFocus
							disabled={isSubmitting}
						/>
						{parameterType === 'COLOR' && (
							<input
								type='color'
								value={hexColor}
								onChange={e => setHexColor(e.target.value)}
								className='w-8 h-8 rounded border border-gray-300 cursor-pointer'
								disabled={isSubmitting}
							/>
						)}
					</div>
					{parameterType === 'COLOR' && hexColor && (
						<div className='text-xs text-gray-600 flex items-center gap-2'>
							<span>HEX: {hexColor.toUpperCase()}</span>
							{hexToRAL(hexColor) && (
								<>
									<span>•</span>
									<span className='font-medium text-blue-600'>
										RAL: {hexToRAL(hexColor)}
									</span>
								</>
							)}
						</div>
					)}
				</div>

				<div className='flex items-center gap-2'>
					<Button
						type='button'
						size='sm'
						onClick={e => {
							e.preventDefault()
							e.stopPropagation()
							handleAdd()
						}}
						disabled={!newValue.trim() || isSubmitting}
						className='bg-green-600 hover:bg-green-700 text-white h-7 text-xs'
					>
						<Check className='h-3 w-3 mr-1' />
						Добавить
					</Button>
					<Button
						type='button'
						size='sm'
						variant='outline'
						onClick={e => {
							e.preventDefault()
							e.stopPropagation()
							handleCancel()
						}}
						disabled={isSubmitting}
						className='h-7 text-xs'
					>
						<X className='h-3 w-3 mr-1' />
						Отмена
					</Button>
				</div>
			</div>
		</div>
	)
}
