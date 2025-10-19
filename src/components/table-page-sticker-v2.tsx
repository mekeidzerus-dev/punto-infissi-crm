'use client'

import { ReactNode } from 'react'
import { DashboardLayoutStickerV2 } from '@/components/dashboard-layout-sticker-v2'
import { UnifiedNavV2, NavItem } from '@/components/unified-nav-v2'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface TablePageStickerV2Props {
	navItems: NavItem[]
	onAddClick?: () => void
	addButtonText?: string
	searchValue: string
	onSearchChange: (value: string) => void
	searchPlaceholder?: string
	children: ReactNode
}

export function TablePageStickerV2({
	navItems,
	onAddClick,
	addButtonText,
	searchValue,
	onSearchChange,
	searchPlaceholder = 'Поиск...',
	children,
}: TablePageStickerV2Props) {
	return (
		<DashboardLayoutStickerV2 hideTopNav={true}>
			<div className='space-y-4'>
				{/* Объединенная навигация */}
				<UnifiedNavV2
					items={navItems}
					onAddClick={onAddClick}
					addButtonText={addButtonText}
				/>

				{/* Поиск и таблица */}
				<div className='content-sticker-v2'>
					{/* Поиск - компактный */}
					<div className='mb-4'>
						<div className='relative'>
							<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
							<Input
								placeholder={searchPlaceholder}
								value={searchValue}
								onChange={e => onSearchChange(e.target.value)}
								className='pl-10 bg-gray-50 border-gray-200 rounded-xl'
							/>
						</div>
					</div>

					{/* Контент (таблица или другое) */}
					{children}
				</div>
			</div>
		</DashboardLayoutStickerV2>
	)
}
