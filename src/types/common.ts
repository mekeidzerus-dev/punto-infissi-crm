export interface VATRate {
	id: string
	name: string
	percentage: number
	isDefault: boolean
}

export interface ProductCategory {
	id: string
	name: string
	icon: string
	description?: string
	isActive: boolean
	createdAt?: string
	updatedAt?: string
}

