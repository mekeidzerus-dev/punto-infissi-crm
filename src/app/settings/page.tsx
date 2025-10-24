'use client'

import { useState } from 'react'
import { DashboardLayoutStickerV2 } from '@/components/dashboard-layout-sticker-v2'
import { SettingsNav } from '@/components/settings-nav'
import { GeneralSettings } from '@/components/general-settings'
import { DictionariesSection } from '@/components/dictionaries-section'

export default function SettingsPage() {
	const [activeTab, setActiveTab] = useState<'general' | 'dictionaries'>('general')

	return (
		<DashboardLayoutStickerV2 hideTopNav={true}>
			<div className='space-y-6'>
				{/* Панель навигации */}
				<SettingsNav activeTab={activeTab} onTabChange={setActiveTab} />

				{/* Контент в зависимости от выбранной вкладки */}
				{activeTab === 'general' && <GeneralSettings />}
				{activeTab === 'dictionaries' && <DictionariesSection />}
			</div>
		</DashboardLayoutStickerV2>
	)
}