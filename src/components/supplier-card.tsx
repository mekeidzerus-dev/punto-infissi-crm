import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
	Building2,
	MapPin,
	ShoppingCart,
	Truck,
	Settings,
	Edit,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'

interface Supplier {
	id: string | number
	name: string
	rating: number
	address: string
	minOrderAmount: number
	deliveryDays: number
	parametersCount?: number
	status: 'active' | 'inactive'
}

interface SupplierCardProps {
	supplier: Supplier
	isSelected?: boolean
	isInactive?: boolean
	onClick?: () => void
	onEdit?: (supplier: Supplier) => void
	showEditButton?: boolean
	className?: string
}

export function SupplierCard({
	supplier,
	isSelected = false,
	isInactive = false,
	onClick,
	onEdit,
	showEditButton = true,
	className,
}: SupplierCardProps) {
	const { t } = useLanguage()

	return (
		<Card
			className={cn(
				'text-card-foreground flex flex-col gap-6 py-6 shadow-sm transition-all duration-200 group relative rounded-md aspect-square',
				isInactive
					? 'cursor-not-allowed opacity-60 bg-gray-50 border-2 border-gray-300'
					: 'cursor-pointer hover:shadow-lg border-2',
				isSelected
					? 'border-blue-500 bg-blue-50'
					: 'border-gray-200 hover:border-blue-300 bg-white',
				className
			)}
			onClick={onClick}
		>
			<CardContent className='p-3 h-full flex flex-col items-center justify-center text-center gap-1.5'>
				{/* Статус поставщика - абсолютное позиционирование */}
				<div className='absolute top-2 left-2'>
					{supplier.status === 'active' && (
						<div className='bg-green-500 text-white px-2 py-1 rounded-full flex items-center gap-1.5 text-xs font-medium shadow-sm'>
							<div className='w-2 h-2 bg-white rounded-full'></div>
							<span>{t('active')}</span>
						</div>
					)}
					{supplier.status === 'inactive' && (
						<div className='bg-red-500 text-white px-2 py-1 rounded-full flex items-center gap-1.5 text-xs font-medium shadow-sm'>
							<div className='w-2 h-2 bg-white rounded-full'></div>
							<span>{t('inactive')}</span>
						</div>
					)}
				</div>

				{/* Кнопка редактирования - абсолютное позиционирование */}
				{showEditButton && (
					<div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'>
						<Button
							variant='ghost'
							size='icon-sm'
							className='h-5 w-5 p-0 hover:bg-blue-100'
							onClick={e => {
								e.stopPropagation()
								onEdit?.(supplier)
							}}
						>
							<Edit className='h-2.5 w-2.5 text-blue-600' />
						</Button>
					</div>
				)}

				{/* Логотип поставщика */}
				<div className='mb-1'>
					<div className='w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center'>
						<Building2 className='h-6 w-6 text-gray-600' />
					</div>
				</div>

				{/* Название поставщика */}
				<h4 className='font-medium text-gray-900 text-xs sm:text-sm line-clamp-2 min-h-[1.5rem] flex items-center'>
					{supplier.name}
				</h4>

				{/* Компактный список информации */}
				<div className='space-y-1 text-xs mb-1.5'>
					<div className='flex items-center gap-2'>
						<span className='text-yellow-500'>⭐</span>
						<span className='font-medium'>{supplier.rating}</span>
						<span className='text-gray-400'>•</span>
						<MapPin className='h-3 w-3 text-gray-400' />
						<span className='text-gray-500'>
							{supplier.address
								? supplier.address.split(',').slice(-2, -1)[0]?.trim() ||
								  'Город не указан'
								: 'Город не указан'}
						</span>
					</div>
					<div className='flex items-center gap-2'>
						<ShoppingCart className='h-3 w-3 text-green-600' />
						<span className='text-gray-500'>
							MIN €{supplier.minOrderAmount}
						</span>
						<span className='text-gray-400'>•</span>
						<Truck className='h-3 w-3 text-blue-600' />
						<span className='text-gray-500'>
							{supplier.deliveryDays} giorni
						</span>
					</div>
				</div>

				{/* Количество параметров - внизу */}
				<div className='w-full mt-auto'>
					<div className='bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700 rounded-md flex items-center justify-center gap-1 cursor-help'>
						<Settings className='h-3 w-3' />
						<span>{supplier.parametersCount || 'N/A'}</span>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
