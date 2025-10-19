'use client'

import { Check, Clock, X } from 'lucide-react'

interface ApprovalStatusBadgeProps {
	status: string
	size?: 'sm' | 'md'
	showText?: boolean
}

export function ApprovalStatusBadge({
	status,
	size = 'sm',
	showText = true,
}: ApprovalStatusBadgeProps) {
	const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
	const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

	if (status === 'approved') {
		return showText ? (
			<span
				className={`inline-flex items-center gap-1 text-green-600 ${textSize}`}
			>
				<Check className={iconSize} />
				<span className='sr-only'>Одобрено</span>
			</span>
		) : (
			<Check className={`${iconSize} text-green-600`} />
		)
	}

	if (status === 'pending') {
		return (
			<span
				className={`inline-flex items-center gap-1 text-amber-600 ${textSize}`}
				title='На согласовании'
			>
				<Clock className={iconSize} />
				{showText && <span>На согласовании</span>}
			</span>
		)
	}

	if (status === 'rejected') {
		return showText ? (
			<span
				className={`inline-flex items-center gap-1 text-red-600 ${textSize}`}
				title='Отклонено'
			>
				<X className={iconSize} />
				<span>Отклонено</span>
			</span>
		) : (
			<X className={`${iconSize} text-red-600`} />
		)
	}

	return null
}
