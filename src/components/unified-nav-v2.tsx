'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export interface NavItem {
	id: string
	name: string
	href: string
	icon?: React.ComponentType<{ className?: string }>
	count?: number
}

interface UnifiedNavV2Props {
	items: NavItem[]
	onAddClick?: () => void
	addButtonText?: string
}

export function UnifiedNavV2({
	items,
	onAddClick,
	addButtonText = 'Добавить',
}: UnifiedNavV2Props) {
	const pathname = usePathname()

	return (
		<div className='unified-nav-v2'>
			<nav className='unified-nav-items'>
				{items.map((item, index) => {
					const isActive =
						pathname === item.href || pathname.startsWith(item.href + '/')
					const Icon = item.icon

					return (
						<div key={item.id} className='flex items-center'>
							<Link
								href={item.href}
								className={`nav-item-unified ${isActive ? 'active' : ''}`}
							>
								<div className='flex items-center gap-2'>
									{Icon && <Icon className='h-4 w-4' />}
									<span>{item.name}</span>
									{isActive && item.count !== undefined && (
										<span className='nav-count'>({item.count})</span>
									)}
								</div>
							</Link>
							{index < items.length - 1 && <div className='nav-divider'></div>}
						</div>
					)
				})}
			</nav>

			{onAddClick && (
				<Button
					onClick={onAddClick}
					className='bg-green-600 hover:bg-green-700 text-white'
					size='sm'
				>
					<Plus className='h-4 w-4 mr-1' />
					{addButtonText}
				</Button>
			)}
		</div>
	)
}
