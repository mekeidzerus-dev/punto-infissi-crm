export interface Supplier {
	id: number
	name: string
	shortName?: string
	shortNameIt?: string
	phone: string
	email?: string
	address?: string
	partitaIVA?: string
	legalAddress?: string
	contactPerson?: string
	paymentTerms?: string
	deliveryDays?: number
	minOrderAmount?: number
	rating: number
	status: string
	notes?: string
	logo?: string
}

export interface SupplierCategory {
	id: string
	supplierId: number
	categoryId: string
	parameters: Record<string, unknown>
	isActive: boolean
}

