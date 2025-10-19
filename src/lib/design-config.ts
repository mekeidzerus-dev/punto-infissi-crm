// Конфигурация дизайна - система переключения между версиями
export type DesignVersion = 'classic' | 'sticker' | 'sticker-v2'

export const DESIGN_CONFIG = {
	// Текущая версия дизайна (можно менять для переключения)
	currentVersion: 'classic' as DesignVersion,

	// Можно добавить переключение через URL параметр или localStorage
	// Для разработки можно использовать: ?design=sticker
	getDesignVersion(): DesignVersion {
		if (typeof window !== 'undefined') {
			// Проверяем URL параметр
			const urlParams = new URLSearchParams(window.location.search)
			const urlDesign = urlParams.get('design') as DesignVersion
			if (
				urlDesign &&
				['classic', 'sticker', 'sticker-v2'].includes(urlDesign)
			) {
				return urlDesign
			}

			// Проверяем localStorage
			const savedDesign = localStorage.getItem(
				'punto-infissi-design'
			) as DesignVersion
			if (
				savedDesign &&
				['classic', 'sticker', 'sticker-v2'].includes(savedDesign)
			) {
				return savedDesign
			}
		}

		return this.currentVersion
	},

	// Функция для переключения дизайна
	setDesignVersion(version: DesignVersion) {
		if (typeof window !== 'undefined') {
			localStorage.setItem('punto-infissi-design', version)
			// Перезагружаем страницу для применения изменений
			window.location.reload()
		}
	},
}

// Типы для компонентов
export interface DesignProps {
	designVersion?: DesignVersion
}

// Утилита для условного рендеринга (перенесена в отдельный файл)
// export function withDesign<T extends DesignProps>(
// 	Component: React.ComponentType<T>,
// 	version: DesignVersion
// ) {
// 	return function DesignWrapper(props: T) {
// 		const currentVersion = DESIGN_CONFIG.getDesignVersion()
//
// 		if (currentVersion === version) {
// 			return <Component {...props} />
// 		}
//
// 		return null
// 	}
// }
