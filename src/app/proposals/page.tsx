'use client'

import { useState, useEffect } from 'react'
import { DashboardLayoutStickerV2 } from '@/components/dashboard-layout-sticker-v2'
import { UnifiedNavV2 } from '@/components/unified-nav-v2'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
	vatAmount: number | string
	total: number | string
	createdAt: string
	proposalDate?: string
	responsibleManager?: string
	notes?: string
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
			const data = await response.json()
			setProposals(data)
		} catch (error) {
			console.error('Error fetching proposals:', error)
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
				console.error('Error saving proposal:', error)
				alert(t('errorOccurred') + ': ' + (error.error || 'Unknown error'))
			}
		} catch (error) {
			console.error('Error saving proposal:', error)
			alert(t('errorOccurred'))
		}
	}

	const handleEdit = async (proposal: ProposalDocumentView) => {
		try {
			console.log('📝 Loading proposal for edit:', proposal.id)

			// Загружаем полные данные предложения с API
			const response = await fetch(`/api/proposals/${proposal.id}`)
			if (response.ok) {
				const apiData = await response.json()
				console.log('✅ Loaded proposal data:', apiData)

				// Нормализуем данные: преобразуем Decimal (строки) в numbers
				const normalizedProposal = {
					...apiData,
					clientId: Number(apiData.clientId),
					subtotal: Number(apiData.subtotal || 0),
					discount: Number(apiData.discount || 0),
					vatAmount: Number(apiData.vatAmount || 0),
					total: Number(apiData.total || 0),
					vatRate: Number(apiData.vatRate || 22),
					groups:
						apiData.groups?.map((group: any) => ({
							...group,
							subtotal: Number(group.subtotal || 0),
							discount: Number(group.discount || 0),
							total: Number(group.total || 0),
							positions:
								group.positions?.map((pos: any) => ({
									...pos,
									unitPrice: Number(pos.unitPrice || 0),
									quantity: Number(pos.quantity || 1),
									discount: Number(pos.discount || 0),
									vatRate: Number(pos.vatRate || 22),
									vatAmount: Number(pos.vatAmount || 0),
									total: Number(pos.total || 0),
								})) || [],
						})) || [],
				}

				console.log('✅ Normalized proposal:', normalizedProposal)
				setEditingProposal(normalizedProposal)
				setShowForm(true)
			} else {
				console.error('❌ Error loading proposal for edit')
				alert(t('errorOccurred'))
			}
		} catch (error) {
			console.error('❌ Error loading proposal:', error)
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
				console.error('Error deleting proposal:', error)
				alert(t('errorOccurred') + ': ' + (error.error || 'Unknown error'))
			}
		} catch (error) {
			console.error('Error deleting proposal:', error)
			alert(t('errorOccurred'))
		}
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'draft':
				return 'bg-gray-100 text-gray-800'
			case 'sent':
				return 'bg-blue-100 text-blue-800'
			case 'confirmed':
				return 'bg-green-100 text-green-800'
			case 'expired':
				return 'bg-red-100 text-red-800'
			default:
				return 'bg-gray-100 text-gray-800'
		}
	}

	const getStatusText = (status: string) => {
		switch (status) {
			case 'draft':
				return t('draft')
			case 'sent':
				return t('sent')
			case 'confirmed':
				return t('confirmed')
			case 'expired':
				return t('expired')
			default:
				return status
		}
	}

	const filteredProposals = multiSearch(proposals, searchTerm, [
		'number',
		'status',
	])

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
			name: t('orders'),
			href: '/orders',
			icon: FileText,
			count: 0,
		},
	]

	return (
		<DashboardLayoutStickerV2>
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
													className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
														proposal.status
													)}`}
												>
													{getStatusText(proposal.status)}
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
		</DashboardLayoutStickerV2>
	)
}
