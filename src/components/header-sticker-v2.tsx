'use client'

import { Bell, Search, User, Settings } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'

export function HeaderStickerV2() {
	return (
		<header className='sticker-header-v2 px-8 py-6'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center space-x-8'>
					<div className='relative'>
						<Label htmlFor='global-search-compact' className='sr-only'>
							Поиск по всей системе...
						</Label>
						<Search className='absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400' />
						<Input
							id='global-search-compact'
							name='globalSearch'
							aria-label='Поиск по всей системе...'
							placeholder='Поиск по всей системе...'
							className='pl-12 w-96 bg-gradient-to-r from-gray-50 to-white border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-base py-3'
						/>
					</div>
				</div>

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

					<div className='flex items-center space-x-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl px-4 py-3 border border-gray-200'>
						<div className='w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center'>
							<User className='h-4 w-4 text-white' />
						</div>
						<div className='flex flex-col'>
							<Badge
								variant='secondary'
								className='bg-white border border-gray-200 text-gray-700 font-medium'
							>
								Администратор
							</Badge>
							<span className='text-xs text-gray-500 mt-1'>Онлайн</span>
						</div>
					</div>
				</div>
			</div>
		</header>
	)
}
