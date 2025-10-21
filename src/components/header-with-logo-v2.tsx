'use client'

import { Bell, Search, User, Settings, Image } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LogoUpdater } from '@/components/logo-updater'
import { LanguageSwitcher } from '@/components/language-switcher'
import { useLanguage } from '@/contexts/LanguageContext'
import { useRouter } from 'next/navigation'

export function HeaderWithLogoV2() {
	const { t } = useLanguage()
	const router = useRouter()

	const handleLogoClick = () => {
		router.push('/settings')
	}
	return (
		<header className='sticker-header-with-logo-v2 px-8 py-6'>
			<div className='flex items-center justify-between'>
				{/* Левая часть с логотипом и поиском */}
				<div className='flex items-center space-x-8'>
					{/* Логотип компании */}
					<div className='flex items-center'>
						{/* Кастомный логотип */}
						<img
							className='company-logo h-14 w-auto object-contain'
							alt='Логотип компании'
							style={{ display: 'none' }}
						/>
						{/* Дефолтный логотип */}
						<div
							className='default-logo flex items-center justify-center h-14 w-20 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 cursor-pointer group'
							onClick={handleLogoClick}
							title={t('clickToUploadLogo')}
						>
							<div className='text-center'>
								<Image className='h-5 w-5 text-gray-400 mx-auto mb-1 group-hover:text-gray-500 transition-colors' />
								<span className='text-xs text-gray-500 font-medium group-hover:text-gray-600 transition-colors'>
									{t('logoPlaceholder')}
								</span>
							</div>
						</div>
					</div>

					{/* Поиск */}
					<div className='relative'>
						<Search className='absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400' />
						<Input
							placeholder={t('searchSystem')}
							className='pl-12 w-96 bg-gradient-to-r from-gray-50 to-white border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-base py-3'
						/>
					</div>
				</div>

				{/* Правая часть с уведомлениями и пользователем */}
				<div className='flex items-center space-x-6'>
					<Button
						variant='ghost'
						size='sm'
						className='relative hover:bg-gray-100 rounded-xl p-3 transition-all duration-200'
					>
						<Bell className='h-5 w-5 text-gray-600' />
						<div className='absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center'>
							<span className='text-xs text-white font-bold'>3</span>
						</div>
					</Button>

					<Button
						variant='ghost'
						size='sm'
						className='hover:bg-gray-100 rounded-xl p-3 transition-all duration-200'
					>
						<Settings className='h-5 w-5 text-gray-600' />
					</Button>

					{/* Переключатель языка */}
					<LanguageSwitcher />

					{/* Профиль - только иконка */}
					<Button
						variant='ghost'
						size='sm'
						className='hover:bg-gray-100 rounded-xl p-3 transition-all duration-200'
					>
						<User className='h-5 w-5 text-gray-600' />
					</Button>
				</div>
			</div>

			<LogoUpdater />
		</header>
	)
}
