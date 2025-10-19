/**
 * ИСПРАВЛЕНИЕ СТАРЫХ КАТЕГОРИЙ
 * Обновляет старые категории с эмодзи на SVG иконки
 */

const BASE_URL = 'http://localhost:3000'

const fixes = [
	{
		name: 'Двери',
		newIcon:
			'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="4" y="4" width="16" height="16" rx="1"/><circle cx="12" cy="12" r="1.5"/><path d="M12 2v4"/><path d="M12 18v4"/></svg>',
	},
	{
		name: 'Окна',
		newIcon:
			'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="4" y="4" width="16" height="16" rx="1"/><line x1="12" y1="4" x2="12" y2="20"/><line x1="4" y1="12" x2="20" y2="12"/></svg>',
	},
]

async function fixCategories() {
	console.log('🔧 Исправление старых категорий с эмодзи...\n')

	try {
		// Получаем все категории
		const response = await fetch(`${BASE_URL}/api/product-categories`)
		const categories = await response.json()

		for (const fix of fixes) {
			const category = categories.find(c => c.name === fix.name)

			if (category) {
				console.log(`📝 Обновляю категорию "${fix.name}"...`)

				const updateResponse = await fetch(
					`${BASE_URL}/api/product-categories/${category.id}`,
					{
						method: 'PUT',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							name: category.name,
							icon: fix.newIcon,
							description: category.description,
						}),
					}
				)

				if (updateResponse.ok) {
					console.log(`✅ Категория "${fix.name}" обновлена\n`)
				} else {
					const error = await updateResponse.json()
					console.log(
						`❌ Ошибка при обновлении "${fix.name}": ${error.error}\n`
					)
				}
			} else {
				console.log(`⚠️ Категория "${fix.name}" не найдена\n`)
			}
		}

		console.log('✨ Готово!')
	} catch (error) {
		console.error('❌ Ошибка:', error.message)
	}
}

fixCategories()
