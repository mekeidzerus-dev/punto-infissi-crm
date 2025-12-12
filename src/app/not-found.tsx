export default function NotFound() {
	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50'>
			<div className='text-center'>
				<h1 className='text-4xl font-bold text-gray-900 mb-4'>404</h1>
				<p className='text-xl text-gray-600 mb-8'>Страница не найдена</p>
				<a
					href='/clients'
					className='inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
				>
					Вернуться на главную
				</a>
			</div>
		</div>
	)
}
