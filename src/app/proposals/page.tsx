'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/app-layout'
import { UnifiedNavV2 } from '@/components/unified-nav-v2'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { logger } from '@/lib/logger'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { ProposalFormV3 } from '@/components/proposal-form-v3'
import { ProposalPDFPreview } from '@/components/proposal-pdf-preview'
import { FileText, Plus, Edit, Trash2, Eye, Download } from 'lucide-react'
import { multiSearch } from '@/lib/multi-search'
import { highlightText } from '@/lib/highlight-text'
import { useLanguage } from '@/contexts/LanguageContext'
import { pluralizeGroups } from '@/lib/i18n'

interface Client {
	id: number
	firstName?: string
	lastName?: string
	companyName?: string
	phone: string
	email?: string
}

interface ProposalDocumentView {
	id: string
	number: string
	clientId: number
	client: Client
	status: string
	type: string
	subtotal: number | string // Decimal приходит как строка
	discount: number | string
	vatRate: number | string
	vatAmount: number | string
	total: number | string
	createdAt: string
	proposalDate?: string
	responsibleManager?: string
	notes?: string
	statusRef?: {
		id: number
		name: string
		nameRu: string
		nameIt: string
		color: string
	} | null
	groups: Array<{
		id: string
		name: string
		positions: Array<{
			id: string
			description: string
			unitPrice: number | string
			quantity: number
			total: number | string
		}>
	}>
}

export default function ProposalsPage() {
	const { t, locale } = useLanguage()
	const [proposals, setProposals] = useState<ProposalDocumentView[]>([])
	const [searchTerm, setSearchTerm] = useState('')
	const [showForm, setShowForm] = useState(false)
	const [showPdfPreview, setShowPdfPreview] = useState(false)
	const [editingProposal, setEditingProposal] = useState<
		ProposalDocumentView | undefined
	>()
	const [previewingProposal, setPreviewingProposal] = useState<
		ProposalDocumentView | undefined
	>()
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		fetchProposals()
	}, [])

	const fetchProposals = async () => {
		try {
			setIsLoading(true)
			const response = await fetch('/api/proposals')
			
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}))
				logger.error('Error fetching proposals:', {
					status: response.status,
					error: errorData.error || errorData.details || 'Unknown error',
				})
				setProposals([]) // Устанавливаем пустой массив при ошибке
				return
			}
			
			const data = await response.json()
			
			// Убеждаемся, что data - массив
			if (Array.isArray(data)) {
				setProposals(data)
			} else {
				logger.error('Invalid data format from API:', data)
				setProposals([])
			}
		} catch (error) {
			logger.error('Error fetching proposals:', error || undefined)
			setProposals([]) // Устанавливаем пустой массив при ошибке
		} finally {
			setIsLoading(false)
		}
	}

	const handleSaveProposal = async (proposalData: any) => {
		try {
			const url = editingProposal
				? `/api/proposals/${editingProposal.id}`
				: '/api/proposals'
			const method = editingProposal ? 'PUT' : 'POST'

			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(proposalData),
			})

			if (response.ok) {
				await fetchProposals()
				setShowForm(false)
				setEditingProposal(undefined)
			} else {
				const error = await response.json()
				logger.error('Error saving proposal:', error || undefined)
				const errorMessage = error.details || error.error || 'Unknown error'
				alert(
					locale === 'ru'
						? `Ошибка: ${errorMessage}`
						: `Errore: ${errorMessage}`
				)
			}
		} catch (error) {
			logger.error('Error saving proposal:', error || undefined)
			alert(t('errorOccurred'))
		}
	}

	const handleEdit = async (proposal: ProposalDocumentView) => {
		try {
			logger.info(`📝 Loading proposal for edit: ${proposal.id}`)

			// Загружаем полные данные предложения с API
			const response = await fetch(`/api/proposals/${proposal.id}`)
			if (response.ok) {
				const apiData = await response.json()
				logger.info('✅ Loaded proposal data')

				// Нормализуем данные: преобразуем Decimal (строки) в numbers
				const normalizedProposal = {
					...apiData,
					clientId: Number(apiData.clientId),
					subtotal: Number(apiData.subtotal || 0),
					discount: Number(apiData.discount || 0),
					vatAmount: Number(apiData.vatAmount || 0),
					total: Number(apiData.total || 0),
					vatRate: Number(apiData.vatRate || 0),
					groups:
						apiData.groups?.map((group: any) => ({
							...group,
							subtotal: Number(group.subtotal || 0),
							discount: Number(group.discount || 0),
							total: Number(group.total || 0),
							positions:
								group.positions?.map((pos: any) => {
									// Извлекаем метаданные из configuration._metadata если они есть
									const config = pos.configuration || {}
									const metadata = config._metadata || {}

									return {
										...pos,
										unitPrice: Number(pos.unitPrice || 0),
										quantity: Number(pos.quantity || 1),
										discount: Number(pos.discount || 0),
										vatRate: Number(pos.vatRate || 0),
										vatAmount: Number(pos.vatAmount || 0),
										total: Number(pos.total || 0),
										// Восстанавливаем поля локализации из metadata
										categoryNameRu:
											metadata.categoryNameRu || pos.category?.name || '',
										categoryNameIt:
											metadata.categoryNameIt || pos.category?.name || '',
										supplierShortNameRu:
											metadata.supplierShortNameRu ||
											pos.supplierCategory?.supplier?.shortName ||
											null,
										supplierShortNameIt:
											metadata.supplierShortNameIt ||
											pos.supplierCategory?.supplier?.shortNameIt ||
											null,
										supplier: {
											name:
												metadata.supplierFullName ||
												pos.supplierCategory?.supplier?.name ||
												'',
										},
										modelValueRu: metadata.modelValueRu || '',
										modelValueIt: metadata.modelValueIt || '',
										parameters: metadata.parameters || [],
										customNotes: metadata.customNotes || null,
									}
								}) || [],
						})) || [],
				}

				logger.info('✅ Normalized proposal')
				setEditingProposal(normalizedProposal)
				setShowForm(true)
			} else {
				logger.error('❌ Error loading proposal for edit')
				alert(t('errorOccurred'))
			}
		} catch (error) {
			logger.error('❌ Error loading proposal:', error || undefined)
			alert(t('errorOccurred'))
		}
	}

	const handlePreview = (proposal: ProposalDocumentView) => {
		setPreviewingProposal(proposal)
		setShowPdfPreview(true)
	}

	const handleDelete = async (proposalId: string) => {
		if (!confirm(t('confirmDelete'))) {
			return
		}

		try {
			const response = await fetch(`/api/proposals/${proposalId}`, {
				method: 'DELETE',
			})

			if (response.ok) {
				await fetchProposals()
			} else {
				const error = await response.json()
				logger.error('Error deleting proposal:', error || undefined)
				alert(t('errorOccurred') + ': ' + (error.error || 'Unknown error'))
			}
		} catch (error) {
			logger.error('Error deleting proposal:', error || undefined)
			alert(t('errorOccurred'))
		}
	}

	const getStatusColorStyle = (proposal: ProposalDocumentView): React.CSSProperties | undefined => {
		// Используем новый статус из БД, если есть
		if (proposal.statusRef?.color) {
			const hexOpacity = '33' // 20% прозрачности в HEX
			return {
				backgroundColor: `${proposal.statusRef.color}${hexOpacity}`,
				color: proposal.statusRef.color,
				borderColor: proposal.statusRef.color,
			}
		}
		return undefined
	}

	const getStatusColorClass = (proposal: ProposalDocumentView): string => {
		// Fallback на старые статусы (только классы)
		const legacyColorMap: Record<string, string> = {
			draft: 'bg-gray-100 text-gray-800',
			sent: 'bg-blue-100 text-blue-800',
			confirmed: 'bg-green-100 text-green-800',
			expired: 'bg-red-100 text-red-800',
		}
		return legacyColorMap[proposal.status] || 'bg-gray-100 text-gray-800'
	}

	const getStatusText = (proposal: ProposalDocumentView) => {
		// Используем новый статус из БД, если есть
		if (proposal.statusRef) {
			return locale === 'ru'
				? proposal.statusRef.nameRu
				: proposal.statusRef.nameIt
		}
		// Fallback на старые статусы
		const legacyTextMap: Record<string, string> = {
			draft: t('draft'),
			sent: t('sent'),
			confirmed: t('confirmed'),
			expired: t('expired'),
		}
		return legacyTextMap[proposal.status] || proposal.status
	}

	// Убеждаемся, что proposals - массив перед вызовом multiSearch
	const safeProposals = Array.isArray(proposals) ? proposals : []
	const filteredProposals = multiSearch(
		safeProposals as unknown as Array<Record<string, unknown>>,
		searchTerm,
		['number', 'status'] as (keyof Record<string, unknown>)[]
	) as unknown as ProposalDocumentView[]

	const navItems = [
		{
			id: 'proposals',
			name: t('proposals'),
			href: '/proposals',
			icon: FileText,
			count: proposals.length,
		},
		{
			id: 'orders',
			name: locale === 'ru' ? 'Заказы' : 'Ordini',
			href: '/orders',
			icon: FileText,
			count: 0,
		},
	]

	return (
		<AppLayout>
			<div className='space-y-6'>
				{/* Заголовок с навигацией */}
				<UnifiedNavV2
					items={navItems}
					onAddClick={() => setShowForm(true)}
					addButtonText={t('newProposal')}
				/>

				{/* Поиск */}
				<Card className='p-4'>
					<div className='flex items-center space-x-4'>
						<div className='flex-1'>
							<Input
								placeholder={t('searchPlaceholder')}
								value={searchTerm}
								onChange={e => setSearchTerm(e.target.value)}
							/>
						</div>
					</div>
				</Card>

				{/* Список предложений */}
				<Card className='p-6'>
					{isLoading ? (
						<div className='text-center py-8'>
							<div className='text-gray-500'>{t('loading')}...</div>
						</div>
					) : filteredProposals.length === 0 ? (
						<div className='text-center py-8'>
							<FileText className='w-12 h-12 text-gray-400 mx-auto mb-4' />
							<div className='text-gray-500 mb-4'>
								{searchTerm ? t('noDataFound') : t('noProposals')}
							</div>
							{!searchTerm && (
								<Button onClick={() => setShowForm(true)}>
									<Plus className='w-4 h-4 mr-2' />
									{t('newProposal')}
								</Button>
							)}
						</div>
					) : (
						<div className='overflow-x-auto'>
							<table className='w-full'>
								<thead>
									<tr className='border-b'>
										<th className='text-left py-3 px-4 font-medium'>
											{t('proposalNumber')}
										</th>
										<th className='text-left py-3 px-4 font-medium'>
											{t('client')}
										</th>
										<th className='text-left py-3 px-4 font-medium'>
											{t('status')}
										</th>
										<th className='text-left py-3 px-4 font-medium'>
											{t('groups')}
										</th>
										<th className='text-right py-3 px-4 font-medium'>
											{t('amount')}
										</th>
										<th className='text-left py-3 px-4 font-medium'>
											{t('date')}
										</th>
										<th className='text-center py-3 px-4 font-medium'>
											{t('actions')}
										</th>
									</tr>
								</thead>
								<tbody>
									{filteredProposals.map(proposal => (
										<tr key={proposal.id} className='border-b hover:bg-gray-50'>
											<td className='py-3 px-4'>
												{highlightText(proposal.number, searchTerm)}
											</td>
											<td className='py-3 px-4'>
												<div>
													<div className='font-medium'>
														{highlightText(
															proposal.client.companyName ||
																`${proposal.client.firstName} ${proposal.client.lastName}`,
															searchTerm
														)}
													</div>
													<div className='text-sm text-gray-600'>
														{highlightText(proposal.client.phone, searchTerm)}
													</div>
												</div>
											</td>
											<td className='py-3 px-4'>
												<span
													className={`px-2 py-1 rounded-full text-xs font-medium border ${
														!proposal.statusRef?.color ? getStatusColorClass(proposal) : ''
													}`}
													style={getStatusColorStyle(proposal)}
												>
													{getStatusText(proposal)}
												</span>
											</td>
											<td className='py-3 px-4'>
												<div className='text-sm'>
													{proposal.groups.length}{' '}
													{pluralizeGroups(proposal.groups.length, locale)}
												</div>
											</td>
											<td className='py-3 px-4 text-right font-medium'>
												€{Number(proposal.total).toFixed(2)}
											</td>
											<td className='py-3 px-4 text-sm text-gray-600'>
												{new Date(proposal.createdAt).toLocaleDateString(
													'ru-RU'
												)}
											</td>
											<td className='py-3 px-4'>
												<div className='flex items-center justify-center space-x-2'>
													<Button
														variant='outline'
														size='sm'
														onClick={() => handleEdit(proposal)}
													>
														<Edit className='w-4 h-4' />
													</Button>
													<Button
														variant='outline'
														size='sm'
														onClick={() => handlePreview(proposal)}
														title={t('preview')}
													>
														<Eye className='w-4 h-4' />
													</Button>
													<Button
														variant='outline'
														size='sm'
														onClick={() => handleDelete(proposal.id)}
														className='text-red-600 hover:bg-red-50'
													>
														<Trash2 className='w-4 h-4' />
													</Button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</Card>
			</div>

			{/* Форма предложения */}
			<Dialog open={showForm} onOpenChange={setShowForm}>
				<DialogContent className='max-w-7xl max-h-[90vh] overflow-y-auto'>
					<DialogHeader>
						<DialogTitle>
							{editingProposal
								? t('edit') + ' ' + t('proposals')
								: t('newProposal')}
						</DialogTitle>
					</DialogHeader>
					<ProposalFormV3
						proposal={editingProposal}
						onSave={handleSaveProposal}
						onCancel={() => {
							setShowForm(false)
							setEditingProposal(undefined)
						}}
						onPreview={
							editingProposal
								? () => {
										setShowForm(false)
										handlePreview(editingProposal)
								  }
								: undefined
						}
					/>
				</DialogContent>
			</Dialog>

			{/* PDF Preview */}
			{showPdfPreview && previewingProposal && (
				<ProposalPDFPreview
					proposal={previewingProposal}
					onClose={() => {
						setShowPdfPreview(false)
						setPreviewingProposal(undefined)
					}}
				/>
			)}
		</AppLayout>
	)
}
