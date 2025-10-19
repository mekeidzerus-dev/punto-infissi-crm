'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export interface TopNavItem {
	id: string
	name: string
	href: string
}

interface TopNavProps {
	items: TopNavItem[]
}

export function TopNav({ items }: TopNavProps) {
	const pathname = usePathname()

	if (items.length === 0) {
		return null
	}

	return (
		<div className='border-b border-gray-200 bg-white'>
			<div className='px-6'>
				<nav className='flex space-x-8' aria-label='Tabs'>
					{items.map(item => {
						const isActive = pathname === item.href
						return (
							<Link
								key={item.id}
								href={item.href}
								className={cn(
									'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors',
									isActive
										? 'border-red-600 text-red-600'
										: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
								)}
							>
								{item.name}
							</Link>
						)
					})}
				</nav>
			</div>
		</div>
	)
}
