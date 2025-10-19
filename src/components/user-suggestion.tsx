'use client'

import React, { useState } from 'react'
import { FeatureGate } from '@/lib/feature-flags'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface UserSuggestionProps {
	parameter: {
		id: string
		name: string
		type: string
	}
	category: {
		id: string
		name: string
	}
	supplier?: {
		id: number
		name: string
	}
	onSuggest: (suggestion: {
		type: 'parameter_value'
		parameterId: string
		categoryId: string
		supplierId?: number
		value: string
		description?: string
	}) => Promise<void>
}

// Компонент "Предложить новое значение"
export const UserSuggestion = ({
	parameter,
	category,
	supplier,
	onSuggest,
}: UserSuggestionProps) => {
	const [newValue, setNewValue] = useState('')
	const [description, setDescription] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isSubmitted, setIsSubmitted] = useState(false)

	const handleSuggest = async () => {
		if (!newValue.trim()) return

		setIsSubmitting(true)
		try {
			await onSuggest({
				type: 'parameter_value',
				parameterId: parameter.id,
				categoryId: category.id,
				supplierId: supplier?.id,
				value: newValue.trim(),
				description: description.trim() || undefined,
			})

			setIsSubmitted(true)
			setNewValue('')
			setDescription('')
		} catch (error) {
			console.error('Error submitting suggestion:', error)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<FeatureGate feature='USER_SUGGESTIONS'>
			<Card className='mt-4'>
				<CardHeader>
					<CardTitle className='text-sm'>Нет нужного варианта?</CardTitle>
				</CardHeader>
				<CardContent>
					{isSubmitted ? (
						<div className='text-center py-4'>
							<div className='text-green-600 mb-2'>✅</div>
							<p className='text-sm text-gray-600'>
								Ваше предложение отправлено администратору на рассмотрение
							</p>
							<Button
								variant='outline'
								size='sm'
								onClick={() => setIsSubmitted(false)}
								className='mt-2'
							>
								Предложить еще
							</Button>
						</div>
					) : (
						<div className='space-y-3'>
							<div>
								<label className='text-sm font-medium text-gray-700'>
									Предложить новое значение для "{parameter.name}"
								</label>
								<Input
									placeholder={`Введите новое значение...`}
									value={newValue}
									onChange={e => setNewValue(e.target.value)}
									className='mt-1'
								/>
							</div>

							<div>
								<label className='text-sm font-medium text-gray-700'>
									Описание (опционально)
								</label>
								<Textarea
									placeholder='Дополнительная информация о предлагаемом значении...'
									value={description}
									onChange={e => setDescription(e.target.value)}
									className='mt-1'
									rows={2}
								/>
							</div>

							<div className='flex gap-2'>
								<Button
									onClick={handleSuggest}
									disabled={!newValue.trim() || isSubmitting}
									size='sm'
									variant='outline'
								>
									{isSubmitting
										? 'Отправка...'
										: '📝 Предложить администратору'}
								</Button>
							</div>

							<p className='text-xs text-gray-500'>
								Ваше предложение будет рассмотрено администратором и может быть
								добавлено в систему
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</FeatureGate>
	)
}

// Компонент для отображения статуса предложений
export const SuggestionStatus = ({ suggestions }: { suggestions: any[] }) => {
	const pendingCount = suggestions.filter(s => s.status === 'pending').length

	if (pendingCount === 0) return null

	return (
		<FeatureGate feature='USER_SUGGESTIONS'>
			<div className='bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4'>
				<div className='flex items-center gap-2'>
					<div className='w-2 h-2 bg-blue-500 rounded-full'></div>
					<span className='text-sm text-blue-700'>
						У вас {pendingCount} предложений на рассмотрении
					</span>
				</div>
			</div>
		</FeatureGate>
	)
}

// API функции для работы с предложениями
export const suggestionAPI = {
	// Создать предложение
	async createSuggestion(suggestion: {
		type: string
		parameterId: string
		categoryId: string
		supplierId?: number
		value: string
		description?: string
	}) {
		const response = await fetch('/api/user-suggestions', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(suggestion),
		})

		if (!response.ok) {
			throw new Error('Failed to create suggestion')
		}

		return response.json()
	},

	// Получить предложения пользователя
	async getUserSuggestions(sessionId: string) {
		const response = await fetch(`/api/user-suggestions?sessionId=${sessionId}`)

		if (!response.ok) {
			throw new Error('Failed to fetch suggestions')
		}

		return response.json()
	},

	// Проверить дублирование
	async checkDuplication(value: string, parameterId: string) {
		const response = await fetch(`/api/user-suggestions/check-duplication`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ value, parameterId }),
		})

		if (!response.ok) {
			throw new Error('Failed to check duplication')
		}

		return response.json()
	},
}
