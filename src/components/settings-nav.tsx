'use client'

import { Button } from '@/components/ui/button'
import { Settings, Database } from 'lucide-react'

interface SettingsNavProps {
	activeTab: 'general' | 'dictionaries'
	onTabChange: (tab: 'general' | 'dictionaries') => void
}

export function SettingsNav({ activeTab, onTabChange }: SettingsNavProps) {
	return (
		<div className='settings-nav'>
			<nav className='settings-nav-items'>
				<Button
					variant={activeTab === 'general' ? 'default' : 'ghost'}
					onClick={() => onTabChange('general')}
					className='settings-nav-item'
				>
					<div className='flex items-center gap-2'>
						<Settings className='h-4 w-4' />
						<span>Общие настройки</span>
					</div>
				</Button>

				<div className='settings-nav-divider'></div>

				<Button
					variant={activeTab === 'dictionaries' ? 'default' : 'ghost'}
					onClick={() => onTabChange('dictionaries')}
					className='settings-nav-item'
				>
					<div className='flex items-center gap-2'>
						<Database className='h-4 w-4' />
						<span>Справочники</span>
					</div>
				</Button>
			</nav>
		</div>
	)
}
