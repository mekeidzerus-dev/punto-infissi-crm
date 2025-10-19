'use client'

import DashboardStickerV2 from '@/components/dashboard-sticker-v2'
import { DashboardLayoutStickerV2 } from '@/components/dashboard-layout-sticker-v2'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Package, ShoppingCart, DollarSign } from 'lucide-react'

interface StatItem {
	title: string
	value: string
	change: string
	icon: React.ComponentType<{ className?: string }>
	color: string
}

export default function Dashboard() {
	return <DashboardStickerV2 />
}

// Старый классический дизайн (не используется)
function DashboardClassic() {
	// Моковые данные для демонстрации
	const stats = [
		{
			title: 'Всего клиентов',
			value: '124',
			change: '+12%',
			icon: Users,
			color: 'text-blue-600',
		},
		{
			title: 'Продуктов в каталоге',
			value: '45',
			change: '+3',
			icon: Package,
			color: 'text-green-600',
		},
		{
			title: 'Активные заказы',
			value: '23',
			change: '+5%',
			icon: ShoppingCart,
			color: 'text-orange-600',
		},
		{
			title: 'Общая выручка',
			value: '₽2,450,000',
			change: '+18%',
			icon: DollarSign,
			color: 'text-red-600',
		},
	]

	const recentOrders = [
		{
			id: 'ORD-001',
			client: 'Иванов И.И.',
			amount: '₽125,000',
			status: 'В производстве',
		},
		{
			id: 'ORD-002',
			client: 'Петрова А.С.',
			amount: '₽89,500',
			status: 'Черновик',
		},
		{
			id: 'ORD-003',
			client: 'Сидоров В.П.',
			amount: '₽234,000',
			status: 'Отправлено',
		},
	]

	return (
		<DashboardLayoutStickerV2>
			<div className='space-y-6'>
				<div>
					<h1 className='text-3xl font-bold text-gray-900'>
						Панель управления
					</h1>
					<p className='text-gray-600'>Добро пожаловать в PUNTO INFISSI CRM</p>
				</div>

				{/* Статистика */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
					{stats.map(stat => (
						<Card key={stat.title}>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>
									{stat.title}
								</CardTitle>
								{(() => {
									const Icon = stat.icon
									return Icon ? (
										<Icon className={`h-4 w-4 ${stat.color}`} />
									) : null
								})()}
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{stat.value}</div>
								<p className='text-xs text-green-600'>
									{stat.change} с прошлого месяца
								</p>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Последние заказы */}
				<Card>
					<CardHeader>
						<CardTitle>Последние заказы</CardTitle>
						<CardDescription>Недавние заказы и их статус</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='space-y-4'>
							{recentOrders.map(order => (
								<div
									key={order.id}
									className='flex items-center justify-between p-4 border rounded-lg'
								>
									<div className='flex items-center space-x-4'>
										<div>
											<p className='font-medium'>{order.id}</p>
											<p className='text-sm text-gray-600'>{order.client}</p>
										</div>
									</div>
									<div className='flex items-center space-x-4'>
										<p className='font-medium'>{order.amount}</p>
										<Badge
											variant={
												order.status === 'В производстве'
													? 'default'
													: order.status === 'Отправлено'
													? 'secondary'
													: 'outline'
											}
										>
											{order.status}
										</Badge>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Быстрые действия */}
				<Card>
					<CardHeader>
						<CardTitle>Быстрые действия</CardTitle>
						<CardDescription>Часто используемые функции</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
							<Card className='cursor-pointer hover:bg-gray-50 transition-colors'>
								<CardContent className='p-6'>
									<div className='flex items-center space-x-3'>
										<Users className='h-8 w-8 text-blue-600' />
										<div>
											<h3 className='font-medium'>Новый клиент</h3>
											<p className='text-sm text-gray-600'>Добавить клиента</p>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className='cursor-pointer hover:bg-gray-50 transition-colors'>
								<CardContent className='p-6'>
									<div className='flex items-center space-x-3'>
										<ShoppingCart className='h-8 w-8 text-green-600' />
										<div>
											<h3 className='font-medium'>Новый заказ</h3>
											<p className='text-sm text-gray-600'>Создать заказ</p>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className='cursor-pointer hover:bg-gray-50 transition-colors'>
								<CardContent className='p-6'>
									<div className='flex items-center space-x-3'>
										<Package className='h-8 w-8 text-orange-600' />
										<div>
											<h3 className='font-medium'>Каталог</h3>
											<p className='text-sm text-gray-600'>
												Управление продуктами
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</CardContent>
				</Card>
			</div>
		</DashboardLayoutStickerV2>
	)
}
