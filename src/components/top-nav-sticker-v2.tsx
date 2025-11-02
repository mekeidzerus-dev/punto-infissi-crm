'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
export interface TopNavItem {
	id: string
	name: string
	href: string
}

interface TopNavStickerV2Props {
	items: TopNavItem[]
}

export function TopNavStickerV2({ items }: TopNavStickerV2Props) {
	const pathname = usePathname()

	if (items.length === 0) {
		return null
	}

	return (
		<div className='sticker-top-nav-v2'>
			<div className='px-8'>
				<nav className='flex space-x-2' aria-label='Tabs'>
					{items.map((item, index) => {
						const isActive = pathname === item.href
						return (
							<div key={item.id} className='flex items-center'>
								<Link
									href={item.href}
									className={cn(
										'nav-item-v2 relative whitespace-nowrap py-4 px-8 text-sm font-semibold transition-all duration-300 rounded-t-2xl',
										isActive
											? 'text-gray-900 bg-gradient-to-b from-gray-50 to-white border-t-2 border-l-2 border-r-2 border-gray-200 shadow-lg'
											: 'text-gray-500 hover:text-gray-700 hover:bg-gradient-to-b from-gray-100 to-gray-50 hover:shadow-md'
									)}
								>
									{item.name}
								</Link>
								{index < items.length - 1 && (
									<div className='w-px h-8 bg-gradient-to-b from-transparent via-gray-200 to-transparent mx-2'></div>
								)}
							</div>
						)
					})}
				</nav>
			</div>
		</div>
	)
}
