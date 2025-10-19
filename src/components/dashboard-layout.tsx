'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { TopNav, TopNavItem } from './top-nav'

interface DashboardLayoutProps {
	children: React.ReactNode
}

// Конфигурация топ-навигации для разных разделов
const topNavConfig: Record<string, TopNavItem[]> = {
	clients: [
		{ id: 'clients', name: 'Клиенты', href: '/clients' },
		{ id: 'suppliers', name: 'Поставщики', href: '/suppliers' },
		{ id: 'partners', name: 'Партнеры', href: '/partners' },
		{ id: 'installers', name: 'Монтажники', href: '/installers' },
	],
	suppliers: [
		{ id: 'clients', name: 'Клиенты', href: '/clients' },
		{ id: 'suppliers', name: 'Поставщики', href: '/suppliers' },
		{ id: 'partners', name: 'Партнеры', href: '/partners' },
		{ id: 'installers', name: 'Монтажники', href: '/installers' },
	],
	partners: [
		{ id: 'clients', name: 'Клиенты', href: '/clients' },
		{ id: 'suppliers', name: 'Поставщики', href: '/suppliers' },
		{ id: 'partners', name: 'Партнеры', href: '/partners' },
		{ id: 'installers', name: 'Монтажники', href: '/installers' },
	],
	installers: [
		{ id: 'clients', name: 'Клиенты', href: '/clients' },
		{ id: 'suppliers', name: 'Поставщики', href: '/suppliers' },
		{ id: 'partners', name: 'Партнеры', href: '/partners' },
		{ id: 'installers', name: 'Монтажники', href: '/installers' },
	],
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
	const pathname = usePathname()

	// Определяем какой раздел активен
	const currentSection = pathname.split('/')[1] || ''
	const topNavItems = topNavConfig[currentSection] || []

	return (
		<div className='flex h-screen bg-gray-50'>
			<Sidebar />
			<div className='flex flex-1 flex-col overflow-hidden'>
				<Header />
				<TopNav items={topNavItems} />
				<main className='flex-1 overflow-y-auto p-6'>{children}</main>
			</div>
		</div>
	)
}
