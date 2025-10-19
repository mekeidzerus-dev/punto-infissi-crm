import { useState, useMemo } from 'react'

export type SortDirection = 'asc' | 'desc' | null

export interface SortConfig<T> {
	key: keyof T | null
	direction: SortDirection
}

export function useSorting<T>(items: T[], initialKey: keyof T | null = null) {
	const [sortConfig, setSortConfig] = useState<SortConfig<T>>({
		key: initialKey,
		direction: 'asc',
	})

	const sortedItems = useMemo(() => {
		if (!sortConfig.key || !sortConfig.direction) {
			return items
		}

		return [...items].sort((a, b) => {
			const aValue = a[sortConfig.key as keyof T]
			const bValue = b[sortConfig.key as keyof T]

			// Обработка строк
			if (typeof aValue === 'string' && typeof bValue === 'string') {
				return sortConfig.direction === 'asc'
					? aValue.localeCompare(bValue, 'ru')
					: bValue.localeCompare(aValue, 'ru')
			}

			// Обработка чисел
			if (typeof aValue === 'number' && typeof bValue === 'number') {
				return sortConfig.direction === 'asc'
					? aValue - bValue
					: bValue - aValue
			}

			// Обработка дат (если это строка в формате ISO или дата)
			const aDate = new Date(aValue as any)
			const bDate = new Date(bValue as any)
			if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
				return sortConfig.direction === 'asc'
					? aDate.getTime() - bDate.getTime()
					: bDate.getTime() - aDate.getTime()
			}

			return 0
		})
	}, [items, sortConfig])

	const requestSort = (key: keyof T) => {
		let direction: SortDirection = 'asc'

		if (sortConfig.key === key) {
			if (sortConfig.direction === 'asc') {
				direction = 'desc'
			} else if (sortConfig.direction === 'desc') {
				direction = null
			}
		}

		setSortConfig({ key, direction })
	}

	const getSortIcon = (key: keyof T) => {
		if (sortConfig.key !== key) {
			return '↕️'
		}
		if (sortConfig.direction === 'asc') {
			return '↑'
		}
		if (sortConfig.direction === 'desc') {
			return '↓'
		}
		return '↕️'
	}

	return {
		sortedItems,
		sortConfig,
		requestSort,
		getSortIcon,
	}
}
