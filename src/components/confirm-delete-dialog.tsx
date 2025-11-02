'use client'

import React from 'react'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface ConfirmDeleteDialogProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: () => void
	title: string
	itemName: string
	itemType?: string
	warningMessage?: string
	isLoading?: boolean
}

export function ConfirmDeleteDialog({
	isOpen,
	onClose,
	onConfirm,
	title,
	itemName,
	itemType = 'элемент',
	warningMessage,
	isLoading = false,
}: ConfirmDeleteDialogProps) {
	const { t, locale } = useLanguage()

	const handleConfirm = () => {
		onConfirm()
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='max-w-md'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2 text-red-600'>
						<AlertTriangle className='h-5 w-5' />
						{title}
					</DialogTitle>
				</DialogHeader>

				<div className='space-y-4'>
					{/* Основное сообщение */}
					<div className='text-gray-700'>
						<p>
							{locale === 'ru'
								? `Вы уверены, что хотите удалить ${itemType} "${itemName}"?`
								: `Sei sicuro di voler eliminare ${itemType} "${itemName}"?`}
						</p>
					</div>

					{/* Предупреждение */}
					{warningMessage && (
						<div className='bg-red-50 border border-red-200 rounded-lg p-3'>
							<p className='text-red-700 text-sm font-medium'>
								{warningMessage}
							</p>
						</div>
					)}

					{/* Кнопки */}
					<div className='flex gap-3 justify-end pt-4'>
						<Button
							variant='outline'
							onClick={onClose}
							disabled={isLoading}
							className='border-gray-300 text-gray-700 hover:bg-gray-50'
						>
							{locale === 'ru' ? 'Отмена' : 'Annulla'}
						</Button>
						<Button
							variant='destructive'
							onClick={handleConfirm}
							disabled={isLoading}
							className='bg-red-600 hover:bg-red-700 text-white'
						>
							<Trash2 className='h-4 w-4 mr-2' />
							{isLoading
								? locale === 'ru'
									? 'Удаление...'
									: 'Eliminazione...'
								: locale === 'ru'
								? 'Удалить'
								: 'Elimina'}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
