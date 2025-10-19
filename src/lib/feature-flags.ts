// Система управления функциями (Feature Flags)
import React from 'react'
export const FEATURE_FLAGS = {
	// Новая система параметров
	ADVANCED_PARAMETERS: process.env.NEXT_PUBLIC_ADVANCED_PARAMETERS === 'true',

	// Система предложений пользователей
	USER_SUGGESTIONS: process.env.NEXT_PUBLIC_USER_SUGGESTIONS === 'true',

	// Инфографическая визуализация
	PRODUCT_VISUALIZATION:
		process.env.NEXT_PUBLIC_PRODUCT_VISUALIZATION === 'true',

	// Цветовые квадратики
	COLOR_SQUARES: process.env.NEXT_PUBLIC_COLOR_SQUARES === 'true',

	// Дополнительные заметки
	CUSTOM_NOTES: process.env.NEXT_PUBLIC_CUSTOM_NOTES === 'true',
} as const

// Функция для проверки доступности функции
export const isFeatureEnabled = (
	feature: keyof typeof FEATURE_FLAGS
): boolean => {
	return FEATURE_FLAGS[feature]
}

// Компонент-обертка для условного рендеринга
export const FeatureGate = ({
	feature,
	children,
	fallback = null,
}: {
	feature: keyof typeof FEATURE_FLAGS
	children: React.ReactNode
	fallback?: React.ReactNode
}) => {
	return isFeatureEnabled(feature)
		? React.createElement(React.Fragment, null, children)
		: React.createElement(React.Fragment, null, fallback)
}
