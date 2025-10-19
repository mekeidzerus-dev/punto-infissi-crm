'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'
import { HeaderWithLogoV2 } from './header-with-logo-v2'
import { TopNavStickerV2 } from './top-nav-sticker-v2'
import { TopNavItem } from './top-nav'

interface DashboardLayoutStickerV2Props {
	children: React.ReactNode
	hideTopNav?: boolean // Опция для скрытия топ-навигации
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

export function DashboardLayoutStickerV2({
	children,
	hideTopNav = false,
}: DashboardLayoutStickerV2Props) {
	const pathname = usePathname()

	// Определяем какой раздел активен
	const currentSection = pathname.split('/')[1] || ''
	const topNavItems = topNavConfig[currentSection] || []

	return (
		<div
			className='layout-wrapper'
			data-design='sticker-v2'
			suppressHydrationWarning
		>
			<div className='header-full'>
				<HeaderWithLogoV2 />
			</div>
			<div className='layout-grid'>
				<div className='sidebar'>
					<Sidebar />
				</div>
				<div className='main-content'>
					{!hideTopNav && topNavItems.length > 0 && (
						<div className='top-nav'>
							<TopNavStickerV2 items={topNavItems} />
						</div>
					)}
					<div className='main'>
						<main className='container overflow-y-auto p-6 bg-transparent'>
							{children}
						</main>
					</div>
				</div>
			</div>
		</div>
	)
}
