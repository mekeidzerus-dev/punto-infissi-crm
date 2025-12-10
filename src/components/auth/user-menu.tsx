'use client'

import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	User,
	LogOut,
	Settings,
	Key,
	Bell,
	HelpCircle,
	Shield,
	Mail,
	Building2,
	Clock,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export function UserMenu() {
	const { data: session } = useSession()
	const router = useRouter()
	const { locale } = useLanguage()
	const [open, setOpen] = useState(false)

	if (!session?.user) {
		return null
	}

	const roleLabels: Record<string, { ru: string; it: string }> = {
		admin: { ru: 'Администратор', it: 'Amministratore' },
		user: { ru: 'Пользователь', it: 'Utente' },
	}

	const roleLabel = session.user.role
		? roleLabels[session.user.role]?.[locale] || session.user.role
		: locale === 'ru' ? 'Пользователь' : 'Utente'

	const handleMenuItemClick = (path: string) => {
		setOpen(false)
		router.push(path)
	}

	const handleSignOut = async () => {
		setOpen(false)
		await signOut({ callbackUrl: '/auth/signin' })
	}

	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger asChild>
				<button
					type='button'
					className='hover:bg-gray-100 rounded-xl p-2 transition-all duration-200 flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
					aria-label={locale === 'ru' ? 'Меню пользователя' : 'Menu utente'}
					aria-expanded={open}
				>
					<div className='w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-medium'>
						{session.user.name?.[0]?.toUpperCase() ||
							session.user.email?.[0]?.toUpperCase() ||
							'U'}
					</div>
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent 
				align='end' 
				side='bottom'
				className='w-72 z-[9999]'
				sideOffset={8}
				onCloseAutoFocus={(e) => e.preventDefault()}
			>
				<DropdownMenuLabel className='px-3 py-2'>
					<div className='flex flex-col space-y-1'>
						<div className='flex items-center gap-2'>
							<div className='w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-medium'>
								{session.user.name?.[0]?.toUpperCase() ||
									session.user.email?.[0]?.toUpperCase() ||
									'U'}
							</div>
							<div className='flex-1 min-w-0'>
								<p className='text-sm font-semibold text-gray-900 truncate'>
									{session.user.name || 'User'}
								</p>
								<p className='text-xs text-gray-500 truncate'>{session.user.email}</p>
							</div>
						</div>
						{session.user.role && (
							<div className='flex items-center gap-1 mt-1'>
								<Shield className='h-3 w-3 text-red-600' />
								<p className='text-xs text-red-600 font-medium'>{roleLabel}</p>
							</div>
						)}
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				
				{/* Основной функционал профиля */}
				<DropdownMenuItem 
					onClick={() => handleMenuItemClick('/profile')}
					className='cursor-pointer px-3 py-2'
				>
					<User className='h-4 w-4 mr-2' />
					<span>{locale === 'ru' ? 'Мой профиль' : 'Il mio profilo'}</span>
				</DropdownMenuItem>
				
				<DropdownMenuItem 
					onClick={() => handleMenuItemClick('/settings')}
					className='cursor-pointer px-3 py-2'
				>
					<Settings className='h-4 w-4 mr-2' />
					<span>{locale === 'ru' ? 'Настройки' : 'Impostazioni'}</span>
				</DropdownMenuItem>
				
				<DropdownMenuSeparator />
				
				{/* Безопасность и пароль */}
				{session.user.role === 'admin' && (
					<DropdownMenuItem 
						onClick={() => handleMenuItemClick('/settings?tab=security')}
						className='cursor-pointer px-3 py-2'
					>
						<Shield className='h-4 w-4 mr-2' />
						<span>{locale === 'ru' ? 'Безопасность' : 'Sicurezza'}</span>
					</DropdownMenuItem>
				)}
				
				<DropdownMenuItem 
					onClick={() => handleMenuItemClick('/settings?tab=password')}
					className='cursor-pointer px-3 py-2'
				>
					<Key className='h-4 w-4 mr-2' />
					<span>{locale === 'ru' ? 'Сменить пароль' : 'Cambia password'}</span>
				</DropdownMenuItem>
				
				<DropdownMenuSeparator />
				
				{/* Уведомления и помощь */}
				<DropdownMenuItem 
					onClick={() => handleMenuItemClick('/settings?tab=notifications')}
					className='cursor-pointer px-3 py-2'
				>
					<Bell className='h-4 w-4 mr-2' />
					<span>{locale === 'ru' ? 'Уведомления' : 'Notifiche'}</span>
				</DropdownMenuItem>
				
				<DropdownMenuItem 
					onClick={() => handleMenuItemClick('/help')}
					className='cursor-pointer px-3 py-2'
				>
					<HelpCircle className='h-4 w-4 mr-2' />
					<span>{locale === 'ru' ? 'Помощь и поддержка' : 'Aiuto e supporto'}</span>
				</DropdownMenuItem>
				
				<DropdownMenuSeparator />
				
				{/* Выход */}
				<DropdownMenuItem
					onClick={handleSignOut}
					className='text-red-600 focus:text-red-600 cursor-pointer px-3 py-2'
				>
					<LogOut className='h-4 w-4 mr-2' />
					<span className='font-medium'>{locale === 'ru' ? 'Выйти' : 'Esci'}</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

