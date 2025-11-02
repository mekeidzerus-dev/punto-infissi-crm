// Система управления функциями (Feature Flags)
import React from 'react'
export const FEATURE_FLAGS = {
	// Цветовые квадратики
	COLOR_SQUARES: process.env.NEXT_PUBLIC_COLOR_SQUARES === 'true',
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
