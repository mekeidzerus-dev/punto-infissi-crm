'use client'

import { useRouter } from 'next/navigation'

export default function Home() {
	const router = useRouter()

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50'>
			<div className='text-center'>
				<h1 className='text-4xl font-bold text-red-600 mb-4'>
					PUNTO INFISSI CRM
				</h1>
				<p className='text-gray-600 mb-8'>
					Система управления продажами окон и дверей
				</p>
				<div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6'>
					🧪 <strong>ТЕСТОВАЯ ВЕРСИЯ</strong> - Изменения только на staging!
				</div>
				<button
					onClick={() => router.push('/dashboard')}
					className='bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors'
				>
					Перейти в систему
				</button>
			</div>
		</div>
	)
}
