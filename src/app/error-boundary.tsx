'use client'

import { useEffect } from 'react'

export default function ErrorBoundary({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		// Если ошибка связана с загрузкой chunk - перезагружаем страницу
		if (
			error.message?.includes('chunk') ||
			error.message?.includes('ChunkLoadError') ||
			error.name === 'ChunkLoadError'
		) {
			console.error('Chunk loading error, reloading page...', error)
			setTimeout(() => {
				window.location.reload()
			}, 1000)
		}
	}, [error])

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50'>
			<div className='text-center'>
				<h1 className='text-4xl font-bold text-gray-900 mb-4'>Ошибка загрузки</h1>
				<p className='text-xl text-gray-600 mb-8'>
					Произошла ошибка при загрузке приложения. Перезагружаем страницу...
				</p>
				<button
					onClick={() => window.location.reload()}
					className='inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
				>
					Перезагрузить страницу
				</button>
			</div>
		</div>
	)
}
