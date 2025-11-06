'use client'

import { AppLayout } from '@/components/app-layout'
import { Card } from '@/components/ui/card'
import { FileText } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function OrdersPage() {
	const { locale } = useLanguage()

	return (
		<AppLayout>
			<div className='space-y-6'>
				<Card className='p-6'>
					<div className='text-center py-12'>
						<FileText className='w-16 h-16 text-gray-400 mx-auto mb-4' />
					<h2 className='text-xl font-semibold text-gray-700 mb-2'>
						{locale === 'ru' ? 'Заказы' : 'Ordini'}
					</h2>
					<p className='text-gray-500'>
						{locale === 'ru' ? 'Скоро будет доступно' : 'Prossimamente disponibile'}
					</p>
					</div>
				</Card>
			</div>
		</AppLayout>
	)
}

