'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'
import { HeaderWithLogoV2 } from './header-with-logo-v2'
import { TopNavStickerV2, type TopNavItem } from './top-nav-sticker-v2'
import { useLanguage } from '@/contexts/LanguageContext'

interface AppLayoutProps {
	children: React.ReactNode
	hideTopNav?: boolean
}

function getTopNavConfig(t: ReturnType<typeof useLanguage>['t']): Record<string, TopNavItem[]> {
	return {
		clients: [
			{ id: 'clients', name: t('clients'), href: '/clients' },
			{ id: 'suppliers', name: t('suppliers'), href: '/suppliers' },
			{ id: 'partners', name: t('partners'), href: '/partners' },
			{ id: 'installers', name: t('installers'), href: '/installers' },
		],
	}
}

export function AppLayout({ children, hideTopNav = false }: AppLayoutProps) {
	const pathname = usePathname()
	const { t } = useLanguage()

	const currentSection = pathname.split('/')[1] || ''
	const topNavItems = getTopNavConfig(t)[currentSection] || []

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
