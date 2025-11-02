export interface ProposalPosition {
	id?: string
	categoryId: string
	categoryNameRu?: string
	categoryNameIt?: string
	supplierCategoryId: string
	supplierShortNameRu?: string
	supplierShortNameIt?: string
	supplier?: { name: string }
	modelValueRu?: string
	modelValueIt?: string
	parameters: Array<{
		id: string
		name: string
		nameIt: string
		type: 'SELECT' | 'COLOR' | 'TEXT' | 'NUMBER'
		valueRu: string
		valueIt: string
		unit?: string
		order: number
	}>
	configuration: Record<string, unknown>
	customNotes?: string
	unitPrice: number
	quantity: number
	discount: number
	vatRate: number
	vatAmount: number
	total: number
	description?: string
}

export interface ProposalGroup {
	id?: string
	name: string
	description?: string
	positions: ProposalPosition[]
}

export interface ProposalDocument {
	id?: string
	number?: string
	proposalDate?: string
	validUntil?: string
	clientId: number
	responsibleManager?: string
	status?: string
	groups: ProposalGroup[]
	vatRate: number
	subtotal: number
	discount: number
	vatAmount: number
	total: number
	notes?: string
}

export interface ProposalFormProps {
	proposal?: ProposalDocument
	onSave: (proposal: ProposalDocument) => void
	onCancel: () => void
	onPreview?: () => void
}

