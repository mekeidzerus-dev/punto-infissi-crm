'use client'

import { toast } from 'sonner'

export function showSupplierInactiveToast(title: string, description: string) {
	toast.warning(title, {
		description,
		duration: 5000,
		position: 'top-center',
		style: {
			background: '#fef3c7',
			border: '1px solid #f59e0b',
			color: '#92400e',
		},
	})
}
