/**
 * Универсальные селекторы для E2E тестов
 * Поддерживают множественные варианты с fallback
 */

import { Locator, Page } from '@playwright/test'

/**
 * Получает селектор для таблицы с множественными вариантами
 */
export function getTableSelector(page: Page): Locator {
	// Пробуем разные варианты селекторов таблицы
	return (
		page.locator('table').first() ||
		page.locator('[role="table"]').first() ||
		page.locator('.data-table').first() ||
		page.locator('[data-testid="table"]').first() ||
		page.locator('.table').first()
	)
}

/**
 * Получает селектор для строк таблицы
 */
export function getTableRowsSelector(page: Page): Locator {
	return (
		page.locator('table tbody tr') ||
		page.locator('[role="row"]') ||
		page.locator('.table-row') ||
		page.locator('[data-testid="table-row"]')
	)
}

/**
 * Получает селектор для списка (не таблица)
 */
export function getListSelector(page: Page): Locator {
	return (
		page.locator('[role="list"]').first() ||
		page.locator('.list').first() ||
		page.locator('[data-testid="list"]').first() ||
		page.locator('ul, ol').first()
	)
}

/**
 * Получает селектор для кнопки добавления
 */
export function getAddButtonSelector(page: Page): Locator {
	return page
		.locator('button:has-text("Добавить"), button:has-text("Add"), button:has-text("+"), button:has-text("Создать"), button:has-text("Create"), button:has-text("Новый"), button:has-text("New")')
		.first()
}

/**
 * Получает селектор для кнопки редактирования
 */
export function getEditButtonSelector(page: Page): Locator {
	return page
		.locator('button:has-text("Редактировать"), button:has-text("Edit"), button[aria-label*="edit"], button[aria-label*="Edit"]')
		.first()
}

/**
 * Получает селектор для кнопки удаления
 */
export function getDeleteButtonSelector(page: Page): Locator {
	return page
		.locator('button:has-text("Удалить"), button:has-text("Delete"), button[aria-label*="delete"], button[aria-label*="Delete"]')
		.first()
}

/**
 * Получает селектор для поля поиска
 */
export function getSearchInputSelector(page: Page): Locator {
	return (
		page.locator('input[type="search"]').first() ||
		page.locator('input[placeholder*="Поиск"], input[placeholder*="Search"]').first() ||
		page.locator('[data-testid="search"]').first() ||
		page.locator('.search-input').first()
	)
}

/**
 * Получает селектор для модального окна/диалога
 */
export function getDialogSelector(page: Page): Locator {
	return (
		page.locator('[role="dialog"]').first() ||
		page.locator('.dialog').first() ||
		page.locator('.modal').first() ||
		page.locator('[data-testid="dialog"]').first()
	)
}

/**
 * Получает селектор для формы
 */
export function getFormSelector(page: Page): Locator {
	return (
		page.locator('form').first() ||
		page.locator('[role="form"]').first() ||
		page.locator('[data-testid="form"]').first()
	)
}

/**
 * Получает селектор для кнопки закрытия диалога
 */
export function getCloseDialogButtonSelector(page: Page): Locator {
	return page
		.locator('button:has-text("Отмена"), button:has-text("Cancel"), button[aria-label="Close"], button:has-text("✕"), button:has-text("×")')
		.first()
}

/**
 * Получает селектор для кнопки сохранения
 */
export function getSaveButtonSelector(page: Page): Locator {
	return page
		.locator('button:has-text("Сохранить"), button:has-text("Save"), button[type="submit"]:has-text("Сохранить"), button[type="submit"]:has-text("Save")')
		.first()
}

/**
 * Проверяет, видима ли таблица на странице (с множественными вариантами)
 */
export async function isTableVisible(page: Page, timeout = 5000): Promise<boolean> {
	try {
		const table = getTableSelector(page)
		await table.waitFor({ state: 'visible', timeout })
		return true
	} catch {
		// Пробуем альтернативные варианты
		try {
			const list = getListSelector(page)
			await list.waitFor({ state: 'visible', timeout })
			return true
		} catch {
			return false
		}
	}
}

/**
 * Получает количество строк в таблице
 */
export async function getTableRowCount(page: Page): Promise<number> {
	const rows = getTableRowsSelector(page)
	return await rows.count()
}



