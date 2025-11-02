'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
	BookOpen,
	ChevronDown,
	ChevronUp,
	Tag,
	Building2,
	Percent,
	Globe,
	Users,
	Package,
	Database,
} from 'lucide-react'
import { DictionariesManager } from '@/components/dictionaries-manager'
import { VATRatesManager } from '@/components/vat-rates-manager'
import { StatusManager } from '@/components/status-manager'
import { useLanguage } from '@/contexts/LanguageContext'

interface DictionaryItem {
	id: string
	name: string
	nameIt: string
	icon: React.ReactNode
	description: string
	descriptionIt: string
	component: React.ComponentType
	count?: number
}

export function DictionariesSection() {
	const { t } = useLanguage()
	const [expandedItems, setExpandedItems] = useState<Set<string>>(
		new Set(['statuses'])
	)

	const dictionaries: DictionaryItem[] = [
		{
			id: 'statuses',
			name: 'Статусы',
			nameIt: 'Stati',
			icon: <Tag className='h-5 w-5' />,
			description: 'Управление статусами заказов',
			descriptionIt: 'Gestione stati ordini',
			component: StatusManager,
		},
		{
			id: 'vat',
			name: 'Ставки НДС',
			nameIt: 'Aliquote IVA',
			icon: <Percent className='h-5 w-5' />,
			description: 'Управление налоговыми ставками',
			descriptionIt: 'Gestione aliquote fiscali',
			component: VATRatesManager,
		},
		{
			id: 'dictionaries',
			name: 'Словари',
			nameIt: 'Dizionari',
			icon: <BookOpen className='h-5 w-5' />,
			description: 'Системные словари и справочники',
			descriptionIt: 'Dizionari e riferimenti di sistema',
			component: DictionariesManager,
		},
	]

	const toggleExpanded = (id: string) => {
		const newExpanded = new Set(expandedItems)
		if (newExpanded.has(id)) {
			newExpanded.delete(id)
		} else {
			newExpanded.add(id)
		}
		setExpandedItems(newExpanded)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<Database className='h-6 w-6 text-blue-600' />
					<span>Справочники / Dizionari</span>
					<Badge variant='secondary' className='ml-auto'>
						{dictionaries.length}
					</Badge>
				</CardTitle>
			</CardHeader>
			<CardContent className='space-y-4'>
				{dictionaries.map(dict => {
					const isExpanded = expandedItems.has(dict.id)
					const Component = dict.component

					return (
						<Collapsible
							key={dict.id}
							open={isExpanded}
							onOpenChange={() => toggleExpanded(dict.id)}
						>
							<CollapsibleTrigger asChild>
								<Button
									variant='ghost'
									className='w-full justify-between p-4 h-auto'
								>
									<div className='flex items-center gap-3'>
										<div className='text-blue-600'>{dict.icon}</div>
										<div className='text-left'>
											<div className='font-medium'>{dict.name}</div>
											<div className='text-sm text-gray-500'>
												{dict.description}
											</div>
										</div>
									</div>
									<div className='flex items-center gap-2'>
										{dict.count && (
											<Badge variant='outline' className='text-xs'>
												{dict.count}
											</Badge>
										)}
										{isExpanded ? (
											<ChevronUp className='h-4 w-4' />
										) : (
											<ChevronDown className='h-4 w-4' />
										)}
									</div>
								</Button>
							</CollapsibleTrigger>
							<CollapsibleContent className='px-4 pb-4'>
								<div className='bg-gray-50 rounded-lg p-4'>
									<Component />
								</div>
							</CollapsibleContent>
						</Collapsible>
					)
				})}
			</CardContent>
		</Card>
	)
}
