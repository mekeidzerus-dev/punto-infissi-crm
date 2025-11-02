export type ParameterType =
	| 'SELECT'
	| 'COLOR'
	| 'TEXT'
	| 'NUMBER'
	| 'BOOLEAN'
	| 'DATE'

export interface ParameterTemplate {
	id: string
	name: string
	nameIt: string
	type: ParameterType
	description?: string
	unit?: string
	minValue?: number
	maxValue?: number
	isGlobal: boolean
	isActive: boolean
	isRequired?: boolean
	order?: number
}

export interface ParameterValue {
	id: string
	parameterId: string
	value: string
	valueIt: string
	hexColor?: string
	ralCode?: string
	order: number
}

export interface CategoryParameter {
	id: string
	categoryId: string
	parameterId: string
	isRequired: boolean
	isVisible: boolean
	order: number
	displayName?: string
	displayNameIt?: string
}

export interface Configuration {
	[key: string]: string | number | boolean | string[]
}

