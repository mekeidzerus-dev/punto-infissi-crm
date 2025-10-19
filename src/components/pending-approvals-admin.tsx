'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, X, Clock, AlertCircle } from 'lucide-react'
import { ApprovalStatusBadge } from './approval-status-badge'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useLanguage } from '@/contexts/LanguageContext'

interface PendingParameter {
	id: string
	name: string
	nameIt?: string
	type: string
	createdBy: string
	createdAt: string
	approvalStatus: string
}

interface PendingValue {
	id: string
	value: string
	valueIt?: string
	hexColor?: string
	parameter: {
		name: string
		nameIt?: string
		type: string
	}
	createdBy: string
	createdAt: string
	approvalStatus: string
}

export function PendingApprovalsAdmin() {
	const { locale } = useLanguage()
	const [parameters, setParameters] = useState<PendingParameter[]>([])
	const [values, setValues] = useState<PendingValue[]>([])
	const [loading, setLoading] = useState(true)
	const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
	const [selectedValue, setSelectedValue] = useState<PendingValue | null>(null)
	const [rejectionReason, setRejectionReason] = useState('')

	useEffect(() => {
		fetchPending()
	}, [])

	const fetchPending = async () => {
		setLoading(true)
		try {
			const response = await fetch('/api/admin/pending-approvals')
			if (response.ok) {
				const data = await response.json()
				setParameters(data.parameters || [])
				setValues(data.values || [])
			}
		} catch (error) {
			console.error('Error fetching pending approvals:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleApprove = async (valueId: string) => {
		try {
			const response = await fetch('/api/admin/approve-value', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					valueId,
					approvedBy: 'admin',
				}),
			})

			if (response.ok) {
				// Обновляем список
				await fetchPending()
			}
		} catch (error) {
			console.error('Error approving value:', error)
		}
	}

	const handleReject = async () => {
		if (!selectedValue) return

		try {
			const response = await fetch('/api/admin/reject-value', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					valueId: selectedValue.id,
					rejectedBy: 'admin',
					rejectionReason: rejectionReason || 'Отклонено администратором',
				}),
			})

			if (response.ok) {
				setRejectDialogOpen(false)
				setSelectedValue(null)
				setRejectionReason('')
				// Обновляем список
				await fetchPending()
			}
		} catch (error) {
			console.error('Error rejecting value:', error)
		}
	}

	const openRejectDialog = (value: PendingValue) => {
		setSelectedValue(value)
		setRejectDialogOpen(true)
	}

	if (loading) {
		return (
			<Card className='p-6'>
				<div className='flex items-center gap-2 text-gray-500'>
					<Clock className='h-5 w-5 animate-spin' />
					<span>Загрузка...</span>
				</div>
			</Card>
		)
	}

	const totalPending = parameters.length + values.length

	if (totalPending === 0) {
		return (
			<Card className='p-6'>
				<div className='flex items-center gap-2 text-gray-500'>
					<Check className='h-5 w-5 text-green-600' />
					<span>Нет элементов, ожидающих согласования</span>
				</div>
			</Card>
		)
	}

	return (
		<div className='space-y-4'>
			{/* Заголовок */}
			<div className='flex items-center justify-between'>
				<h3 className='text-lg font-semibold flex items-center gap-2'>
					<Clock className='h-5 w-5 text-amber-600' />
					Параметры на согласовании
					<span className='text-sm font-normal text-gray-500'>
						({totalPending})
					</span>
				</h3>
			</div>

			{/* Параметры на согласовании */}
			{parameters.length > 0 && (
				<Card className='p-4'>
					<h4 className='font-medium mb-3 flex items-center gap-2'>
						<AlertCircle className='h-4 w-4' />
						Новые параметры ({parameters.length})
					</h4>
					<div className='space-y-2'>
						{parameters.map(param => (
							<div
								key={param.id}
								className='flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-md'
							>
								<div className='flex-1'>
									<div className='font-medium flex items-center gap-2'>
										{locale === 'ru' ? param.name : param.nameIt || param.name}
										<span className='text-xs text-gray-500'>
											({param.type})
										</span>
										<ApprovalStatusBadge status={param.approvalStatus} />
									</div>
									<div className='text-sm text-gray-600'>
										Создано: {param.createdBy} •{' '}
										{new Date(param.createdAt).toLocaleString(locale)}
									</div>
								</div>
								<div className='flex gap-2'>
									<Button
										size='sm'
										className='bg-green-600 hover:bg-green-700'
										onClick={() => handleApprove(param.id)}
									>
										<Check className='h-4 w-4' />
										<span className='ml-1'>Одобрить</span>
									</Button>
									<Button
										size='sm'
										variant='outline'
										className='text-red-600 hover:text-red-700 border-red-300'
										onClick={() => openRejectDialog(param as any)}
									>
										<X className='h-4 w-4' />
										<span className='ml-1'>Отклонить</span>
									</Button>
								</div>
							</div>
						))}
					</div>
				</Card>
			)}

			{/* Значения на согласовании */}
			{values.length > 0 && (
				<Card className='p-4'>
					<h4 className='font-medium mb-3 flex items-center gap-2'>
						<AlertCircle className='h-4 w-4' />
						Новые значения параметров ({values.length})
					</h4>
					<div className='space-y-2'>
						{values.map(val => (
							<div
								key={val.id}
								className='flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-md'
							>
								<div className='flex-1'>
									<div className='font-medium flex items-center gap-2'>
										<span className='text-gray-600'>
											{locale === 'ru'
												? val.parameter.name
												: val.parameter.nameIt || val.parameter.name}{' '}
											→
										</span>
										<span className='text-gray-900'>{val.value}</span>
										{val.hexColor && (
											<div
												className='w-6 h-6 rounded border border-gray-300'
												style={{ backgroundColor: val.hexColor }}
											/>
										)}
										<ApprovalStatusBadge status={val.approvalStatus} />
									</div>
									<div className='text-sm text-gray-600'>
										Создано: {val.createdBy} •{' '}
										{new Date(val.createdAt).toLocaleString(locale)}
									</div>
								</div>
								<div className='flex gap-2'>
									<Button
										size='sm'
										className='bg-green-600 hover:bg-green-700'
										onClick={() => handleApprove(val.id)}
									>
										<Check className='h-4 w-4' />
										<span className='ml-1'>Одобрить</span>
									</Button>
									<Button
										size='sm'
										variant='outline'
										className='text-red-600 hover:text-red-700 border-red-300'
										onClick={() => openRejectDialog(val)}
									>
										<X className='h-4 w-4' />
										<span className='ml-1'>Отклонить</span>
									</Button>
								</div>
							</div>
						))}
					</div>
				</Card>
			)}

			{/* Диалог отклонения */}
			<Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Отклонить значение</DialogTitle>
					</DialogHeader>
					<div className='space-y-4'>
						<div>
							<p className='text-sm text-gray-600 mb-2'>
								Вы собираетесь отклонить:
							</p>
							<p className='font-medium'>
								{selectedValue?.parameter.name} →{' '}
								<span className='text-blue-600'>{selectedValue?.value}</span>
							</p>
						</div>
						<div>
							<label className='text-sm font-medium mb-2 block'>
								Причина отклонения (необязательно):
							</label>
							<Textarea
								value={rejectionReason}
								onChange={e => setRejectionReason(e.target.value)}
								placeholder='Укажите причину отклонения...'
								rows={3}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => {
								setRejectDialogOpen(false)
								setSelectedValue(null)
								setRejectionReason('')
							}}
						>
							Отмена
						</Button>
						<Button
							className='bg-red-600 hover:bg-red-700'
							onClick={handleReject}
						>
							<X className='h-4 w-4 mr-1' />
							Отклонить
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
