'use client'

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { UserMenu } from './user-menu'

const publicPaths = ['/', '/auth/signin', '/auth/signup']

export function Header() {
	const { data: session } = useSession()
	const pathname = usePathname()

	// Не показываем header на публичных страницах
	if (publicPaths.includes(pathname) || pathname?.startsWith('/auth/invite/')) {
		return null
	}

	if (!session) {
		return null
	}

	return (
		<header className='border-b bg-white'>
			<div className='container mx-auto px-4 py-3 flex items-center justify-between'>
				<Link href='/clients' className='text-xl font-bold text-red-600'>
					MODOCRM
				</Link>
				<nav className='flex items-center gap-4'>
					<Link href='/clients' className='text-sm hover:text-red-600'>
						Clients
					</Link>
					<Link href='/proposals' className='text-sm hover:text-red-600'>
						Proposals
					</Link>
					<Link href='/settings' className='text-sm hover:text-red-600'>
						Settings
					</Link>
					<UserMenu />
				</nav>
			</div>
		</header>
	)
}

