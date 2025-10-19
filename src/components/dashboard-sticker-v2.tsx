'use client'

import { DashboardLayoutStickerV2 } from '@/components/dashboard-layout-sticker-v2'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
	Users,
	Package,
	ShoppingCart,
	DollarSign,
	Plus,
	TrendingUp,
	ArrowUpRight,
	Clock,
	CheckCircle,
} from 'lucide-react'

interface StatItem {
	title: string
	value: string
	change: string
	icon: React.ComponentType<{ className?: string }>
	color: string
	trend: 'up' | 'down'
	accentLabel?: string
	accentColor?: string
}

export default function DashboardStickerV2() {
	// Моковые данные для демонстрации
	const stats = [
		{
			title: 'Всего клиентов',
			value: '124',
			change: '+12%',
			icon: Users,
			color: 'text-gray-600',
			trend: 'up' as const,
			accentLabel: 'Новые',
			accentColor: 'green',
		},
		{
			title: 'Продуктов в каталоге',
			value: '45',
			change: '+3',
			icon: Package,
			color: 'text-gray-600',
			trend: 'up' as const,
			accentLabel: 'Активные',
			accentColor: 'green',
		},
		{
			title: 'Активные заказы',
			value: '23',
			change: '+5%',
			icon: ShoppingCart,
			color: 'text-gray-600',
			trend: 'up' as const,
			accentLabel: 'В работе',
			accentColor: 'red',
		},
		{
			title: 'Общая выручка',
			value: '₽2,450,000',
			change: '+18%',
			icon: DollarSign,
			color: 'text-gray-600',
			trend: 'up' as const,
			accentLabel: 'Рост',
			accentColor: 'green',
		},
	]

	const recentOrders = [
		{
			id: 'ORD-001',
			client: 'Иванов И.И.',
			amount: '₽125,000',
			status: 'production',
			statusText: 'В производстве',
			accentLabel: 'Срочно',
		},
		{
			id: 'ORD-002',
			client: 'Петрова А.С.',
			amount: '₽89,500',
			status: 'draft',
			statusText: 'Черновик',
			accentLabel: 'Черновик',
		},
		{
			id: 'ORD-003',
			client: 'Сидоров В.П.',
			amount: '₽234,000',
			status: 'sent',
			statusText: 'Отправлено',
			accentLabel: 'Готово',
		},
	]

	const quickActions = [
		{
			title: 'Новый клиент',
			description: 'Добавить клиента',
			icon: Users,
			color: 'text-gray-600',
			accentLabel: 'Быстро',
			accentColor: 'green',
		},
		{
			title: 'Новый заказ',
			description: 'Создать заказ',
			icon: ShoppingCart,
			color: 'text-gray-600',
			accentLabel: 'Популярно',
			accentColor: 'green',
		},
		{
			title: 'Каталог',
			description: 'Управление продуктами',
			icon: Package,
			color: 'text-gray-600',
			accentLabel: 'Обновлено',
			accentColor: 'red',
		},
	]

	return (
		<DashboardLayoutStickerV2>
			<div className='sticker-spacing-lg-v2 text-hierarchy-v2'>
				{/* Статистика - отдельные стикеры v2 */}
				<div className='stats-grid-v2'>
					{stats.map(stat => (
						<div key={stat.title} className='stat-sticker-v2'>
							{stat.accentLabel && (
								<div className={`accent-label ${stat.accentColor}`}>
									{stat.accentLabel}
								</div>
							)}
							<div className='flex items-center justify-between'>
								<h3 className='text-xs font-medium text-gray-600 uppercase tracking-wide'>
									{stat.title}
								</h3>
								{(() => {
									const Icon = stat.icon
									return Icon ? (
										<Icon className={`h-5 w-5 ${stat.color}`} />
									) : null
								})()}
							</div>
							<div className='text-2xl font-bold text-gray-900'>
								{stat.value}
							</div>
							<div className='flex items-center text-xs'>
								<TrendingUp className='h-3 w-3 text-green-600 mr-1' />
								<span className='text-green-600 font-medium'>
									{stat.change}
								</span>
							</div>
						</div>
					))}
				</div>

				{/* Последние заказы */}
				<div className='content-sticker-v2'>
					<div className='flex items-center justify-between mb-6'>
						<div>
							<h2 className='text-xl font-bold text-gray-900'>
								Последние заказы
							</h2>
							<p className='text-gray-600 mt-1 text-sm'>
								Недавние заказы и их статус
							</p>
						</div>
						<Button className='bg-green-600 hover:bg-green-700 text-white'>
							<Plus className='h-4 w-4 mr-2' />
							Новый заказ
						</Button>
					</div>

					<div className='space-y-4'>
						{recentOrders.map((order, index) => (
							<div key={order.id}>
								<div className='flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100'>
									<div className='flex items-center space-x-4'>
										<div className='flex items-center'>
											<span className={`status-dot-v2 ${order.status}`}></span>
											<div>
												<p className='font-bold text-gray-900'>{order.id}</p>
												<p className='text-gray-600 text-sm'>{order.client}</p>
											</div>
										</div>
									</div>
									<div className='flex items-center space-x-4'>
										<p className='font-bold text-gray-900'>{order.amount}</p>
										<div className='flex items-center space-x-2'>
											{order.status === 'production' && (
												<Clock className='h-4 w-4 text-blue-600' />
											)}
											{order.status === 'sent' && (
												<CheckCircle className='h-4 w-4 text-green-600' />
											)}
											<Badge
												variant='secondary'
												className='bg-white border border-gray-200 text-gray-700 font-medium px-2 py-1 text-xs'
											>
												{order.statusText}
											</Badge>
										</div>
									</div>
								</div>
								{index < recentOrders.length - 1 && (
									<div className='sticker-divider-v2'></div>
								)}
							</div>
						))}
					</div>
				</div>

				{/* Быстрые действия */}
				<div className='content-sticker-v2'>
					<div className='mb-6'>
						<h2 className='text-xl font-bold text-gray-900'>
							Быстрые действия
						</h2>
						<p className='text-gray-600 mt-1 text-sm'>
							Часто используемые функции
						</p>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-3 sticker-spacing-v2'>
						{quickActions.map(action => (
							<div
								key={action.title}
								className='sticker-card-v2 p-5 cursor-pointer interactive-element relative'
							>
								{action.accentLabel && (
									<div className={`accent-label ${action.accentColor}`}>
										{action.accentLabel}
									</div>
								)}
								<div className='flex items-center space-x-4'>
									{(() => {
										const Icon = action.icon
										return Icon ? (
											<Icon className={`h-8 w-8 ${action.color}`} />
										) : null
									})()}
									<div>
										<h3 className='font-bold text-gray-900 text-lg mb-1'>
											{action.title}
										</h3>
										<p className='text-gray-600 text-sm'>
											{action.description}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</DashboardLayoutStickerV2>
	)
}
