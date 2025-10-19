'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Check, X, Search, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { FEATURE_FLAGS } from '@/lib/feature-flags'

interface Suggestion {
	id: string
	type: 'NEW_VALUE' | 'NEW_PARAMETER'
	suggestedValue: string
	suggestedValueIt?: string
	description?: string
	status: 'PENDING' | 'APPROVED' | 'REJECTED'
	parameter?: {
		id: string
		name: string
		nameIt: string
		type: string
	}
	rejectionReason?: string
	createdAt: string
	reviewedAt?: string
}

export function UserSuggestionsAdmin() {
	const { locale } = useLanguage()
	const [suggestions, setSuggestions] = useState<Suggestion[]>([])
	const [loading, setLoading] = useState(true)
	const [filter, setFilter] = useState<
		'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
	>('PENDING')
	const [searchTerm, setSearchTerm] = useState('')
	const [rejectingId, setRejectingId] = useState<string | null>(null)
	const [rejectionReason, setRejectionReason] = useState('')

	// Проверка feature flag
	if (!FEATURE_FLAGS.USER_SUGGESTIONS) {
		return (
			<div className='p-8 text-center border-2 border-dashed rounded'>
				<p className='text-gray-500'>
					Функция предложений пользователей отключена
				</p>
				<p className='text-sm text-gray-400 mt-2'>
					Включите USER_SUGGESTIONS=true в .env.local
				</p>
			</div>
		)
	}

	useEffect(() => {
		fetchSuggestions()
	}, [])

	const fetchSuggestions = async () => {
		setLoading(true)
		try {
			const response = await fetch('/api/user-suggestions')
			if (!response.ok) {
				console.error('Error fetching suggestions:', response.status)
				setSuggestions([])
				return
			}
			const data = await response.json()
			// Убедимся, что data - это массив
			setSuggestions(Array.isArray(data) ? data : [])
		} catch (error) {
			console.error('Error fetching suggestions:', error)
			setSuggestions([])
		} finally {
			setLoading(false)
		}
	}

	const handleApprove = async (suggestionId: string) => {
		if (!confirm('Одобрить предложение? Значение будет добавлено в параметр.'))
			return

		try {
			const response = await fetch(
				`/api/user-suggestions/${suggestionId}/approve`,
				{
					method: 'PUT',
				}
			)

			if (response.ok) {
				await fetchSuggestions()
				alert('Предложение одобрено и значение добавлено!')
			} else {
				const error = await response.json()
				alert(error.error || 'Ошибка при одобрении')
			}
		} catch (error) {
			console.error('Error approving suggestion:', error)
			alert('Ошибка при одобрении')
		}
	}

	const handleReject = async (suggestionId: string) => {
		try {
			const response = await fetch(
				`/api/user-suggestions/${suggestionId}/reject`,
				{
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						rejectionReason: rejectionReason || null,
					}),
				}
			)

			if (response.ok) {
				await fetchSuggestions()
				setRejectingId(null)
				setRejectionReason('')
				alert('Предложение отклонено')
			} else {
				const error = await response.json()
				alert(error.error || 'Ошибка при отклонении')
			}
		} catch (error) {
			console.error('Error rejecting suggestion:', error)
			alert('Ошибка при отклонении')
		}
	}

	const filteredSuggestions = suggestions
		.filter(s => {
			if (filter !== 'ALL' && s.status !== filter) return false
			if (searchTerm) {
				const search = searchTerm.toLowerCase()
				return (
					s.suggestedValue.toLowerCase().includes(search) ||
					s.parameter?.name.toLowerCase().includes(search)
				)
			}
			return true
		})
		.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		)

	const stats = {
		pending: suggestions.filter(s => s.status === 'PENDING').length,
		approved: suggestions.filter(s => s.status === 'APPROVED').length,
		rejected: suggestions.filter(s => s.status === 'REJECTED').length,
	}

	if (loading) {
		return <div className='p-8 text-center'>Загрузка...</div>
	}

	return (
		<div className='space-y-4'>
			<div className='flex items-center justify-between'>
				<h2 className='text-xl font-semibold'>
					Предложения пользователей / User suggestions
				</h2>
			</div>

			{/* Статистика */}
			<div className='grid grid-cols-3 gap-4'>
				<Card className='p-4'>
					<div className='flex items-center justify-between'>
						<div>
							<div className='text-2xl font-bold text-yellow-600'>
								{stats.pending}
							</div>
							<div className='text-sm text-gray-600'>Ожидают / Pending</div>
						</div>
						<Clock className='h-8 w-8 text-yellow-600' />
					</div>
				</Card>
				<Card className='p-4'>
					<div className='flex items-center justify-between'>
						<div>
							<div className='text-2xl font-bold text-green-600'>
								{stats.approved}
							</div>
							<div className='text-sm text-gray-600'>Одобрено / Approved</div>
						</div>
						<CheckCircle className='h-8 w-8 text-green-600' />
					</div>
				</Card>
				<Card className='p-4'>
					<div className='flex items-center justify-between'>
						<div>
							<div className='text-2xl font-bold text-red-600'>
								{stats.rejected}
							</div>
							<div className='text-sm text-gray-600'>Отклонено / Rejected</div>
						</div>
						<XCircle className='h-8 w-8 text-red-600' />
					</div>
				</Card>
			</div>

			{/* Фильтры */}
			<div className='flex gap-4'>
				<div className='relative flex-1'>
					<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
					<Input
						placeholder='Поиск по значению или параметру...'
						value={searchTerm}
						onChange={e => setSearchTerm(e.target.value)}
						className='pl-10'
					/>
				</div>
				<div className='flex gap-2'>
					{(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(status => (
						<Button
							key={status}
							variant={filter === status ? 'default' : 'outline'}
							size='sm'
							onClick={() => setFilter(status)}
							className={
								filter === status
									? status === 'PENDING'
										? 'bg-yellow-600'
										: status === 'APPROVED'
										? 'bg-green-600'
										: status === 'REJECTED'
										? 'bg-red-600'
										: ''
									: ''
							}
						>
							{status === 'ALL'
								? 'Все'
								: status === 'PENDING'
								? 'Ожидают'
								: status === 'APPROVED'
								? 'Одобрено'
								: 'Отклонено'}
						</Button>
					))}
				</div>
			</div>

			{/* Список предложений */}
			<div className='space-y-3'>
				{filteredSuggestions.length === 0 ? (
					<div className='p-8 text-center border-2 border-dashed rounded text-gray-500'>
						<p>Нет предложений</p>
					</div>
				) : (
					filteredSuggestions.map(suggestion => (
						<Card
							key={suggestion.id}
							className={`p-4 ${
								suggestion.status === 'PENDING'
									? 'border-l-4 border-l-yellow-500'
									: suggestion.status === 'APPROVED'
									? 'border-l-4 border-l-green-500'
									: 'border-l-4 border-l-red-500'
							}`}
						>
							<div className='space-y-3'>
								{/* Заголовок */}
								<div className='flex items-start justify-between'>
									<div className='flex-1'>
										<div className='flex items-center gap-2'>
											<span className='font-semibold text-lg'>
												{suggestion.suggestedValue}
											</span>
											{suggestion.suggestedValueIt && (
												<span className='text-gray-500'>
													/ {suggestion.suggestedValueIt}
												</span>
											)}
											<span
												className={`px-2 py-0.5 text-xs rounded ${
													suggestion.status === 'PENDING'
														? 'bg-yellow-100 text-yellow-700'
														: suggestion.status === 'APPROVED'
														? 'bg-green-100 text-green-700'
														: 'bg-red-100 text-red-700'
												}`}
											>
												{suggestion.status}
											</span>
										</div>

										{suggestion.parameter && (
											<div className='text-sm text-gray-600 mt-1'>
												Параметр:{' '}
												<span className='font-medium'>
													{locale === 'ru'
														? suggestion.parameter.name
														: suggestion.parameter.nameIt}
												</span>
												<span className='ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded'>
													{suggestion.parameter.type}
												</span>
											</div>
										)}

										{suggestion.description && (
											<div className='text-sm text-gray-600 mt-2 italic'>
												💬 {suggestion.description}
											</div>
										)}

										<div className='text-xs text-gray-400 mt-2'>
											Создано:{' '}
											{new Date(suggestion.createdAt).toLocaleString('ru-RU')}
											{suggestion.reviewedAt && (
												<>
													{' '}
													• Рассмотрено:{' '}
													{new Date(suggestion.reviewedAt).toLocaleString(
														'ru-RU'
													)}
												</>
											)}
										</div>

										{suggestion.rejectionReason && (
											<div className='mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700'>
												❌ Причина отклонения: {suggestion.rejectionReason}
											</div>
										)}
									</div>

									{/* Действия для PENDING */}
									{suggestion.status === 'PENDING' && (
										<div className='flex gap-2'>
											<Button
												size='sm'
												onClick={() => handleApprove(suggestion.id)}
												className='bg-green-600 hover:bg-green-700 text-white'
											>
												<Check className='h-4 w-4 mr-1' />
												Одобрить
											</Button>
											<Button
												variant='outline'
												size='sm'
												onClick={() => setRejectingId(suggestion.id)}
												className='border-red-300 text-red-600 hover:bg-red-50'
											>
												<X className='h-4 w-4 mr-1' />
												Отклонить
											</Button>
										</div>
									)}
								</div>

								{/* Форма отклонения */}
								{rejectingId === suggestion.id && (
									<div className='pt-3 border-t space-y-3'>
										<div>
											<label className='block text-sm font-medium mb-1'>
												Причина отклонения (опционально)
											</label>
											<Textarea
												value={rejectionReason}
												onChange={e => setRejectionReason(e.target.value)}
												placeholder='Укажите причину отклонения...'
												rows={2}
											/>
										</div>
										<div className='flex gap-2 justify-end'>
											<Button
												variant='outline'
												size='sm'
												onClick={() => {
													setRejectingId(null)
													setRejectionReason('')
												}}
											>
												Отмена
											</Button>
											<Button
												size='sm'
												onClick={() => handleReject(suggestion.id)}
												className='bg-red-600 hover:bg-red-700 text-white'
											>
												Подтвердить отклонение
											</Button>
										</div>
									</div>
								)}
							</div>
						</Card>
					))
				)}
			</div>
		</div>
	)
}
