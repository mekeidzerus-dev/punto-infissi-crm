'use client'

import { useState } from 'react'
import { Plus, Check, X, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { logger } from '@/lib/logger'

interface QuickAddValueProps {
	parameterId: string
	parameterName: string
	parameterType: string
	onValueAdded: (newValue: any) => void
}

export function QuickAddValue({
	parameterId,
	parameterName,
	parameterType,
	onValueAdded,
}: QuickAddValueProps) {
	const [isAdding, setIsAdding] = useState(false)
	const [newValue, setNewValue] = useState('')
	const [hexColor, setHexColor] = useState('#FFFFFF')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleAdd = async () => {
		if (!newValue.trim()) return

		setIsSubmitting(true)

		try {
			const response = await fetch('/api/parameter-values/quick-add', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					parameterId,
					value: newValue.trim(),
					valueIt: newValue.trim(),
					hexColor: parameterType === 'COLOR' ? hexColor : null,
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
			logger.error('Error adding value:', error)
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
			<button
				type='button'
				onClick={() => setIsAdding(true)}
				className='w-full mt-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md border border-dashed border-gray-300 hover:border-gray-400 transition-colors flex items-center justify-center gap-2'
			>
				<Plus className='h-4 w-4' />
				<span>Добавить новое значение</span>
			</button>
		)
	}

	return (
		<div className='mt-2 p-3 bg-gray-50 rounded-md border border-gray-200'>
			<div className='space-y-2'>
				<div className='flex items-center gap-2'>
					<Input
						type='text'
						placeholder='Введите значение...'
						value={newValue}
						onChange={e => setNewValue(e.target.value)}
						onKeyDown={e => {
							if (e.key === 'Enter') {
								e.preventDefault()
								handleAdd()
							} else if (e.key === 'Escape') {
								handleCancel()
							}
						}}
						className='flex-1'
						autoFocus
						disabled={isSubmitting}
					/>
					{parameterType === 'COLOR' && (
						<input
							type='color'
							value={hexColor}
							onChange={e => setHexColor(e.target.value)}
							className='w-12 h-10 rounded border border-gray-300 cursor-pointer'
							disabled={isSubmitting}
						/>
					)}
				</div>

				<div className='flex items-center gap-2'>
					<Button
						type='button'
						size='sm'
						onClick={handleAdd}
						disabled={!newValue.trim() || isSubmitting}
						className='bg-green-600 hover:bg-green-700 text-white'
					>
						{isSubmitting ? (
							<Clock className='h-4 w-4 animate-spin' />
						) : (
							<Check className='h-4 w-4' />
						)}
						<span className='ml-1'>Добавить</span>
					</Button>
					<Button
						type='button'
						size='sm'
						variant='outline'
						onClick={handleCancel}
						disabled={isSubmitting}
					>
						<X className='h-4 w-4' />
						<span className='ml-1'>Отмена</span>
					</Button>
				</div>

				<p className='text-xs text-gray-500'>
					<Clock className='h-3 w-3 inline mr-1' />
					Значение будет доступно сразу, с пометкой "⏳ На согласовании"
				</p>
			</div>
		</div>
	)
}
