'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { logger } from '@/lib/logger'
import {
	Users,
	FileText,
	Settings,
	GripVertical,
	ChevronDown,
	ChevronRight,
	Tags,
} from 'lucide-react'
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from '@dnd-kit/core'
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import { useLanguage } from '@/contexts/LanguageContext'

interface NavigationItem {
	id: string
	name: string
	href: string
	icon?: React.ComponentType<{ className?: string }>
	children?: NavigationItem[]
}

const getNavigationItems = (t: any): NavigationItem[] => [
	{
		id: 'counterparties',
		name: t('counterparties'),
		href: '/clients',
		icon: Users,
	},
	{ id: 'proposals', name: t('proposals'), href: '/proposals', icon: FileText },
	{ id: 'categories', name: t('categories'), href: '/categories', icon: Tags },
	{ id: 'settings', name: t('settings'), href: '/settings', icon: Settings },
]

interface SortableItemProps {
	item: NavigationItem
	isActive: boolean
	isExpanded: boolean
	onToggleExpand: () => void
}

function SortableItem({
	item,
	isActive,
	isExpanded,
	onToggleExpand,
}: SortableItemProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: item.id,
	})

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	}

	const Icon = item.icon

	return (
		<li ref={setNodeRef} style={style}>
			<Tooltip delayDuration={300}>
				<TooltipTrigger asChild>
					<Link
						href={item.href}
						className={cn(
							'group flex items-center justify-center rounded-lg p-3 transition-colors',
							isActive
								? 'bg-red-50 text-red-600'
								: 'text-gray-600 hover:bg-gray-100 hover:text-red-600'
						)}
					>
						{Icon && (
							<Icon
								className={cn(
									'h-6 w-6 shrink-0',
									isActive
										? 'text-red-600'
										: 'text-gray-500 group-hover:text-red-600'
								)}
								aria-hidden='true'
							/>
						)}
					</Link>
				</TooltipTrigger>
				<TooltipContent
					side='right'
					className='bg-gray-900 text-white border-gray-800'
				>
					<p className='font-medium'>{item.name}</p>
				</TooltipContent>
			</Tooltip>
		</li>
	)
}

export function Sidebar() {
	const { t } = useLanguage()
	const pathname = usePathname()
	const [navigation, setNavigation] = useState<NavigationItem[]>(
		getNavigationItems(t)
	)
	const [expandedItems, setExpandedItems] = useState<Set<string>>(
		new Set(['counterparties'])
	)
	const [isMounted, setIsMounted] = useState(false)

	// Обновляем меню при смене языка
	useEffect(() => {
		setNavigation(getNavigationItems(t))
	}, [t])

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	)

	// Предотвращаем hydration mismatch
	useEffect(() => {
		setIsMounted(true)
	}, [])

	// Загружаем порядок меню из localStorage
	useEffect(() => {
		const savedOrder = localStorage.getItem('modocrm-menu-order')
		if (savedOrder) {
			try {
				const parsed = JSON.parse(savedOrder)
				setNavigation(parsed)
			} catch (e) {
				logger.error('Failed to parse saved menu order', e)
			}
		}
	}, [])

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event

		if (over && active.id !== over.id) {
			setNavigation(items => {
				const oldIndex = items.findIndex(item => item.id === active.id)
				const newIndex = items.findIndex(item => item.id === over.id)
				const newOrder = arrayMove(items, oldIndex, newIndex)

				// Сохраняем новый порядок в localStorage
				localStorage.setItem(
					'modocrm-menu-order',
					JSON.stringify(newOrder)
				)

				return newOrder
			})
		}
	}

	const toggleExpand = (itemId: string) => {
		setExpandedItems(prev => {
			const next = new Set(prev)
			if (next.has(itemId)) {
				next.delete(itemId)
			} else {
				next.add(itemId)
			}
			return next
		})
	}

	// Если не смонтировано, показываем простое меню без DnD
	if (!isMounted) {
		return (
			<TooltipProvider>
				<div className='flex h-full w-20 flex-col'>
					<div className='flex h-16 shrink-0 items-center justify-center'>
						{/* Простое меню без логотипа */}
						<div className='text-2xl font-bold text-red-600'>☰</div>
					</div>
					<nav className='flex flex-1 flex-col px-3 py-4'>
						<ul role='list' className='flex flex-1 flex-col gap-y-2'>
							{getNavigationItems(t).map((item: NavigationItem) => {
								const isActive =
									pathname === item.href || pathname.startsWith(item.href + '/')
								const Icon = item.icon

								return (
									<li key={item.id}>
										<Tooltip delayDuration={300}>
											<TooltipTrigger asChild>
												<Link
													href={item.href}
													className={cn(
														'group flex items-center justify-center rounded-lg p-3 transition-colors',
														isActive
															? 'bg-red-50 text-red-600'
															: 'text-gray-600 hover:bg-gray-100 hover:text-red-600'
													)}
												>
													{Icon && (
														<Icon
															className={cn(
																'h-6 w-6 shrink-0',
																isActive
																	? 'text-red-600'
																	: 'text-gray-500 group-hover:text-red-600'
															)}
															aria-hidden='true'
														/>
													)}
												</Link>
											</TooltipTrigger>
											<TooltipContent
												side='right'
												className='bg-gray-900 text-white border-gray-800'
											>
												<p className='font-medium'>{item.name}</p>
											</TooltipContent>
										</Tooltip>
									</li>
								)
							})}
						</ul>
					</nav>
				</div>
			</TooltipProvider>
		)
	}

	return (
		<TooltipProvider>
			<div className='flex h-full w-20 flex-col'>
				<div className='flex h-16 shrink-0 items-center justify-center'>
					{/* Простое меню без логотипа */}
					<div className='text-2xl font-bold text-red-600'>☰</div>
				</div>

				<nav className='flex flex-1 flex-col px-3 py-4'>
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}
					>
						<SortableContext
							items={navigation.map(item => item.id)}
							strategy={verticalListSortingStrategy}
						>
							<ul role='list' className='flex flex-1 flex-col gap-y-2'>
								{navigation.map(item => {
									const isActive =
										pathname === item.href ||
										pathname.startsWith(item.href + '/')
									return (
										<SortableItem
											key={item.id}
											item={item}
											isActive={isActive}
											isExpanded={expandedItems.has(item.id)}
											onToggleExpand={() => toggleExpand(item.id)}
										/>
									)
								})}
							</ul>
						</SortableContext>
					</DndContext>
				</nav>
			</div>
		</TooltipProvider>
	)
}
