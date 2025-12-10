'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Printer, X } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { ProductVisualizer } from '@/components/product-visualizer'
import { logger } from '@/lib/logger'

interface Client {
	firstName?: string
	lastName?: string
	companyName?: string
	phone: string
	email?: string
	address?: string
	codiceFiscale?: string
	partitaIVA?: string
}

interface ProposalPosition {
	description?: string
	configuration?: any
	categoryId?: string
	unitPrice: number | string
	quantity: number
	discount: number
	vatRate: number | string
	vatAmount: number | string
	total: number | string
}

interface ProposalGroup {
	name: string
	description?: string
	positions: ProposalPosition[]
	subtotal: number | string
	discount: number | string
	total: number | string
}

interface ProposalDocument {
	id: string
	number: string
	proposalDate?: string
	responsibleManager?: string
	client: Client
	groups: ProposalGroup[]
	subtotal: number | string
	discount: number | string
	vatAmount: number | string
	total: number | string
	notes?: string
}

interface ProposalPDFPreviewProps {
	proposal: ProposalDocument | any // Принимаем любой тип предложения
	onClose: () => void
}

export function ProposalPDFPreview({
	proposal,
	onClose,
}: ProposalPDFPreviewProps) {
	const { t, locale } = useLanguage()
	const [companyLogo, setCompanyLogo] = useState<string>('')
	const [companyData, setCompanyData] = useState({
		name: '',
		phone: '',
		email: '',
		address: '',
	})

	useEffect(() => {
		const fetchCompanyData = async () => {
			try {
				const response = await fetch('/api/organization')
				if (response.ok) {
					const org = await response.json()
					if (org) {
						// Загружаем логотип компании
						if (org.logoUrl) {
							setCompanyLogo(org.logoUrl)
						}
						// Загружаем данные компании из БД
						setCompanyData({
							name: org.name || '',
							phone: org.phone || '',
							email: org.email || '',
							address: org.address || '',
						})
					}
				} else {
					// Если API вернул ошибку, используем localStorage
					logger.warn('API organization returned error, using localStorage fallback')
				}
			} catch (error) {
				logger.error('Error fetching company data:', error || undefined)
				// Fallback на localStorage если API не работает
				const logoPath = localStorage.getItem('modocrm-logo-path')
				if (logoPath) setCompanyLogo(logoPath)

				const savedName = localStorage.getItem('company-name')
				const savedPhone = localStorage.getItem('company-phone')
				const savedEmail = localStorage.getItem('company-email')
				const savedAddress = localStorage.getItem('company-address')

				setCompanyData({
					name: savedName || '',
					phone: savedPhone || '',
					email: savedEmail || '',
					address: savedAddress || '',
				})
			}
		}

		fetchCompanyData()
	}, [])

	const handleDownload = async () => {
		try {
			// Динамически импортируем html2canvas и jsPDF
			const html2canvasModule = await import('html2canvas')
			const html2canvas = html2canvasModule.default || html2canvasModule
			const jsPDFModule = await import('jspdf')
			const { jsPDF } = jsPDFModule

			// Находим элемент с содержимым PDF
			const element = document.getElementById('pdf-content')
			if (!element) {
				logger.error('PDF content element not found')
				return
			}

			// Создаем canvas из HTML
			const canvas = await html2canvas(element, {
				scale: 2,
				useCORS: true,
				logging: false,
				backgroundColor: '#ffffff',
			})

			// Создаем PDF
			const imgData = canvas.toDataURL('image/png')
			const pdf = new jsPDF('p', 'mm', 'a4')
			const imgWidth = 210 // A4 width in mm
			const pageHeight = 297 // A4 height in mm
			const imgHeight = (canvas.height * imgWidth) / canvas.width
			let heightLeft = imgHeight

			let position = 0

			// Добавляем первую страницу
			pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
			heightLeft -= pageHeight

			// Добавляем дополнительные страницы если нужно
			while (heightLeft >= 0) {
				position = heightLeft - imgHeight
				pdf.addPage()
				pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
				heightLeft -= pageHeight
			}

			// Скачиваем PDF
			pdf.save(`Preventivo_${proposal.number}.pdf`)
		} catch (error) {
			logger.error('Error generating PDF:', error || undefined)
			// Fallback на window.print если генерация не удалась
			window.print()
		}
	}

	const handlePrint = () => {
		// Вызываем печать
		window.print()
	}

	const formatDate = (dateString?: string) => {
		if (!dateString)
			return new Date().toLocaleDateString(locale === 'it' ? 'it-IT' : 'ru-RU')
		return new Date(dateString).toLocaleDateString(
			locale === 'it' ? 'it-IT' : 'ru-RU'
		)
	}

	const clientName =
		proposal.client.companyName ||
		`${proposal.client.firstName} ${proposal.client.lastName}`

	const subtotalBeforeVat =
		Number(proposal.subtotal) - Number(proposal.discount)
	const hasVat = Number(proposal.vatAmount) > 0

	return (
		<div className='fixed inset-0 z-50 bg-white overflow-auto'>
			{/* Панель управления (не печатается) */}
			<div className='sticky top-0 z-10 bg-white border-b shadow-sm print:hidden'>
				<div className='container mx-auto px-6 py-4'>
					<div className='flex items-center justify-between'>
						<h2 className='text-xl font-semibold'>
							{t('previewPDF')} - {proposal.number}
						</h2>
						<div className='flex items-center gap-3'>
							<Button onClick={handleDownload} variant='default'>
								<Download className='w-4 h-4 mr-2' />
								Scarica PDF
							</Button>
							<Button onClick={handlePrint} variant='outline'>
								<Printer className='w-4 h-4 mr-2' />
								Stampa
							</Button>
							<Button onClick={onClose} variant='outline'>
								<X className='w-4 h-4 mr-2' />
								{t('close')}
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* PDF Документ */}
			<div className='container mx-auto px-6 py-8 max-w-5xl'>
				<div className='bg-white border shadow-lg p-12' id='pdf-content'>
					{/* Шапка документа */}
					<div className='flex justify-between items-start mb-8'>
						{/* Логотип и данные компании */}
						<div className='flex-1'>
							{companyLogo ? (
								<img
									src={companyLogo}
									alt='Company Logo'
									className='h-12 w-auto mb-4'
									style={{ imageRendering: 'crisp-edges' }}
								/>
							) : (
								<div className='text-4xl font-bold text-red-600 mb-4'>P</div>
							)}
							<div className='text-sm space-y-1'>
								<div className='font-bold text-lg'>{companyData.name}</div>
								<div>{companyData.address}</div>
								<div>
									{t('phone')}: {companyData.phone}
								</div>
								<div>
									{t('email')}: {companyData.email}
								</div>
							</div>
						</div>

						{/* Данные клиента */}
						<div className='flex-1 text-right'>
							<div className='text-sm space-y-1'>
								<div className='font-bold text-lg mb-2'>{t('client')}:</div>
								<div className='font-semibold'>{clientName}</div>
								{proposal.client.address && (
									<div>{proposal.client.address}</div>
								)}
								<div>
									{t('phone')}: {proposal.client.phone}
								</div>
								{proposal.client.email && (
									<div>
										{t('email')}: {proposal.client.email}
									</div>
								)}
								{proposal.client.codiceFiscale && (
									<div>
										{t('codiceFiscale')}: {proposal.client.codiceFiscale}
									</div>
								)}
								{proposal.client.partitaIVA && (
									<div>
										{t('partitaIVA')}: {proposal.client.partitaIVA}
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Заголовок документа */}
					<div className='text-center mb-8'>
						<h1 className='text-3xl font-bold text-gray-900 mb-2'>
							{locale === 'it' ? 'PREVENTIVO' : 'ПРЕДЛОЖЕНИЕ'}
						</h1>
						<div className='text-lg text-gray-600'>№ {proposal.number}</div>
						<div className='text-sm text-gray-500'>
							{t('date')}: {formatDate(proposal.proposalDate)}
						</div>
						{proposal.responsibleManager && (
							<div className='text-sm text-gray-500'>
								{t('responsibleManager')}: {proposal.responsibleManager}
							</div>
						)}
					</div>

					{/* Товары по группам */}
					<div className='mb-8'>
						{proposal.groups.map((group: any, groupIndex: number) => (
							<div key={groupIndex} className='mb-6'>
								<div className='bg-gray-100 p-3 mb-3 rounded flex justify-between items-center'>
									<div>
										<h3 className='font-bold text-lg'>{group.name}</h3>
										{group.description && (
											<p className='text-sm text-gray-600'>
												{group.description}
											</p>
										)}
									</div>
									<div className='text-right'>
										<div className='text-sm text-gray-600'>Totale gruppo:</div>
										<div className='font-bold text-lg'>
											€{Number(group.total).toFixed(2)}
										</div>
									</div>
								</div>

								<table className='w-full text-sm border-collapse'>
									<thead>
										<tr className='border-b-2 border-gray-300'>
											<th className='text-left py-2 px-2'>#</th>
											<th className='text-left py-2 px-2'>
												{t('description')}
											</th>
											<th className='text-center py-2 px-2'>{t('quantity')}</th>
											<th className='text-right py-2 px-2'>{t('price')}</th>
											<th className='text-center py-2 px-2'>{t('discount')}</th>
											<th className='text-center py-2 px-2'>{t('vat')}</th>
											<th className='text-right py-2 px-2'>{t('total')}</th>
										</tr>
									</thead>
									<tbody>
										{group.positions.map(
											(position: any, positionIndex: number) => (
												<tr
													key={positionIndex}
													className='border-b border-gray-200'
												>
													<td className='py-3 px-2 align-top'>
														{positionIndex + 1}
													</td>
													<td className='py-3 px-2'>
														{/* Визуализация товара */}
														{position.configuration &&
															position.configuration.parameters && (
																<div
																	className='mb-2 bg-gray-50 p-2 rounded border border-gray-200 inline-block'
																	style={{ maxWidth: '200px' }}
																>
																	<ProductVisualizer
																		categoryName={
																			position.categoryId ===
																			'cmgshxr7w0000shad72lziav8'
																				? 'Двери'
																				: position.categoryId ===
																				  'cmgshxr7w0001shad5ufmwdab'
																				? 'Окна'
																				: 'Продукт'
																		}
																		parameters={
																			position.configuration.parameters
																		}
																	/>
																</div>
															)}
														{/* Описание */}
														<div className='text-sm'>
															{position.description}
														</div>
													</td>
													<td className='text-center py-3 px-2 align-top'>
														{position.quantity}
													</td>
													<td className='text-right py-3 px-2 align-top'>
														€{Number(position.unitPrice).toFixed(2)}
													</td>
													<td className='text-center py-3 px-2 align-top'>
														{position.discount}%
													</td>
													<td className='text-center py-3 px-2 align-top'>
														{Number(position.vatRate).toFixed(0)}%
													</td>
													<td className='text-right py-3 px-2 font-medium align-top'>
														€{Number(position.total).toFixed(2)}
													</td>
												</tr>
											)
										)}
									</tbody>
								</table>

								{/* Разделительная линия после группы */}
								<div className='mt-4 mb-4 border-t-2 border-gray-300 bg-gray-50 h-1' />
							</div>
						))}
					</div>

					{/* Итоги */}
					<div className='flex justify-end mb-8'>
						<div className='w-96 space-y-2 text-sm'>
							<div className='flex justify-between'>
								<span className='text-gray-600'>{t('subtotal')}:</span>
								<span className='font-medium'>
									€{Number(proposal.subtotal).toFixed(2)}
								</span>
							</div>
							{Number(proposal.discount) > 0 && (
								<div className='flex justify-between'>
									<span className='text-gray-600'>{t('totalDiscount')}:</span>
									<span className='font-medium text-red-600'>
										-€{Number(proposal.discount).toFixed(2)}
									</span>
								</div>
							)}
							<div className='border-t pt-2' />
							<div className='flex justify-between'>
								<span className='font-medium'>{t('subtotalBeforeVat')}:</span>
								<span className='font-semibold'>
									€{subtotalBeforeVat.toFixed(2)}
								</span>
							</div>
							{hasVat ? (
								<div className='flex justify-between'>
									<span className='text-gray-600'>{t('totalVat')}:</span>
									<span className='font-medium text-blue-600'>
										+€{Number(proposal.vatAmount).toFixed(2)}
									</span>
								</div>
							) : (
								<div className='flex justify-between'>
									<span className='text-gray-600'>{t('totalVat')}:</span>
									<span className='font-medium text-amber-600'>
										{t('vatNotIncluded')}
									</span>
								</div>
							)}
							<div className='border-t-2 border-gray-300 pt-2' />
							<div
								className={`flex justify-between items-center px-4 py-3 rounded -mx-4 ${
									!hasVat ? 'bg-amber-100' : 'bg-green-50'
								}`}
							>
								<span
									className={`text-lg font-bold ${
										!hasVat ? 'text-amber-900' : 'text-green-900'
									}`}
								>
									{hasVat
										? t('totalWithVat')
										: `${t('totalWithoutVat')} (senza IVA)`}
									:
								</span>
								<span
									className={`text-2xl font-bold ${
										!hasVat ? 'text-amber-700' : 'text-green-600'
									}`}
								>
									€{Number(proposal.total).toFixed(2)}
								</span>
							</div>

							{/* Предупреждение о НДС */}
							{!hasVat && (
								<div className='mt-3 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800'>
									<strong>⚠️ {t('important')}:</strong>{' '}
									{t('vatWillBeCalculatedLater')}
								</div>
							)}
						</div>
					</div>

					{/* Примечания */}
					{proposal.notes && (
						<div className='mb-8'>
							<h3 className='font-bold text-sm mb-2'>{t('notes')}:</h3>
							<div className='text-sm text-gray-700 whitespace-pre-wrap'>
								{proposal.notes}
							</div>
						</div>
					)}

					{/* Подпись клиента */}
					<div className='mt-12 pt-8 border-t'>
						<div className='grid grid-cols-2 gap-8'>
							<div>
								<div className='text-sm font-medium mb-2'>
									{t('clientSignature')}:
								</div>
								<div className='border-b border-gray-400 h-16 mb-2' />
								<div className='text-xs text-gray-500'>{clientName}</div>
							</div>
							<div>
								<div className='text-sm font-medium mb-2'>
									{t('signatureDate')}:
								</div>
								<div className='border-b border-gray-400 h-16 mb-2' />
								<div className='text-xs text-gray-500'>__ / __ / ____</div>
							</div>
						</div>
					</div>

					{/* Футер */}
					<div className='mt-8 pt-4 border-t text-xs text-gray-500 text-center'>
						<p>
							{companyData.name} - {companyData.address}
						</p>
						<p>
							{t('phone')}: {companyData.phone} | {t('email')}:{' '}
							{companyData.email}
						</p>
					</div>
				</div>
			</div>

			{/* Print Styles */}
			<style jsx global>{`
				@media print {
					@page {
						margin: 5mm;
						size: A4;
					}
					body {
						margin: 0;
						padding: 0;
						print-color-adjust: exact;
						-webkit-print-color-adjust: exact;
					}
					.print\\:hidden {
						display: none !important;
					}
					#pdf-content {
						box-shadow: none;
						border: none;
					}
					img {
						image-rendering: -webkit-optimize-contrast;
						image-rendering: crisp-edges;
						max-width: 100%;
						height: auto;
					}
					svg {
						vector-effect: non-scaling-stroke;
					}
				}
			`}</style>
		</div>
	)
}
