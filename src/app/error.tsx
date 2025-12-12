'use client'

import { useEffect } from 'react'

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		// Если ошибка связана с загрузкой chunk - перезагружаем страницу
		const isChunkError =
			error.message?.includes('chunk') ||
			error.message?.includes('ChunkLoadError') ||
			error.name === 'ChunkLoadError' ||
			error.stack?.includes('chunk')

		if (isChunkError) {
			console.error('Chunk loading error detected, reloading page...', error)
			// Перезагружаем страницу чтобы загрузить новую версию
			setTimeout(() => {
				window.location.reload()
			}, 500)
		}
	}, [error])

	// Если это ошибка chunk - показываем сообщение о перезагрузке
	const isChunkError =
		error.message?.includes('chunk') ||
		error.message?.includes('ChunkLoadError') ||
		error.name === 'ChunkLoadError'

	if (isChunkError) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gray-50'>
				<div className='text-center'>
					<h1 className='text-4xl font-bold text-gray-900 mb-4'>
						Обновление приложения
					</h1>
					<p className='text-xl text-gray-600 mb-8'>
						Загружается новая версия приложения...
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50'>
			<div className='text-center'>
				<h1 className='text-4xl font-bold text-gray-900 mb-4'>Ошибка</h1>
				<p className='text-xl text-gray-600 mb-8'>
					Произошла ошибка при загрузке приложения
				</p>
				<button
					onClick={() => {
						reset()
						window.location.reload()
					}}
					className='inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
				>
					Перезагрузить страницу
				</button>
			</div>
		</div>
	)
}
