'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Edit, Trash2, Check, X, Save } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { hexToRAL } from '@/lib/hex-to-ral'
import { logger } from '@/lib/logger'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'

interface ParameterValue {
	id: string
	value: string
	valueIt?: string
	hexColor?: string
	ralCode?: string
	createdBy?: string
	order: number
	isActive: boolean
}

interface ParameterValuesManagerProps {
	parameterId: string
	parameterName: string
	parameterType: string
	open: boolean
	onClose: () => void
	onValuesChanged: () => void
}

export function ParameterValuesManager({
	parameterId,
	parameterName,
	parameterType,
	open,
	onClose,
	onValuesChanged,
}: ParameterValuesManagerProps) {
	const { locale } = useLanguage()
	const [values, setValues] = useState<ParameterValue[]>([])
	const [loading, setLoading] = useState(false)
	const [editingId, setEditingId] = useState<string | null>(null)
	const [editValue, setEditValue] = useState('')
	const [editValueIt, setEditValueIt] = useState('')
	const [editHexColor, setEditHexColor] = useState('#FFFFFF')
	const [isAdding, setIsAdding] = useState(false)

	useEffect(() => {
		if (open) {
			fetchValues()
		}
	}, [open, parameterId])

	const fetchValues = async () => {
		setLoading(true)
		try {
			const response = await fetch(`/api/parameters/${parameterId}/values`)
			if (response.ok) {
				const data = await response.json()
				setValues(data)
				logger.info(
					`✅ Loaded ${data.length} values for parameter ${parameterId}`
				)
			} else {
				setValues([])
			}
		} catch (error) {
			logger.error('Error fetching values:', error)
			setValues([])
		} finally {
			setLoading(false)
		}
	}

	const handleAdd = async () => {
		// Проверяем что заполнено основное поле для текущего языка
		const primaryValue = locale === 'it' ? editValueIt.trim() : editValue.trim()
		if (!primaryValue) return

		// Если не заполнено второе поле, копируем из первого
		const ruValue = editValue.trim() || editValueIt.trim()
		const itValue = editValueIt.trim() || editValue.trim()

		// Автоматически определяем RAL код для цветов
		let ralCode = null
		if (parameterType === 'COLOR') {
			ralCode = hexToRAL(editHexColor)
		}

		try {
			const response = await fetch('/api/parameter-values/quick-add', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					parameterId,
					value: ruValue,
					valueIt: itValue,
					hexColor: parameterType === 'COLOR' ? editHexColor : null,
					ralCode: ralCode,
					createdBy: 'admin',
				}),
			})

			if (response.ok) {
				setEditValue('')
				setEditValueIt('')
				setEditHexColor('#FFFFFF')
				setIsAdding(false)
				await fetchValues()
				onValuesChanged()
			}
		} catch (error) {
			logger.error('Error adding value:', error)
		}
	}

	const handleEdit = async (valueId: string) => {
		// Проверяем что заполнено основное поле для текущего языка
		const primaryValue = locale === 'it' ? editValueIt.trim() : editValue.trim()
		if (!primaryValue) return

		// Если не заполнено второе поле, копируем из первого
		const ruValue = editValue.trim() || editValueIt.trim()
		const itValue = editValueIt.trim() || editValue.trim()

		try {
			const response = await fetch(`/api/parameter-values/${valueId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					value: ruValue,
					valueIt: itValue,
					hexColor: parameterType === 'COLOR' ? editHexColor : null,
				}),
			})

			if (response.ok) {
				setEditingId(null)
				setEditValue('')
				setEditValueIt('')
				setEditHexColor('#FFFFFF')
				await fetchValues()
				onValuesChanged()
			}
		} catch (error) {
			logger.error('Error editing value:', error)
		}
	}

	const handleDelete = async (valueId: string) => {
		if (!confirm('Удалить это значение?')) return

		try {
			const response = await fetch(`/api/parameter-values/${valueId}`, {
				method: 'DELETE',
			})

			if (response.ok) {
				await fetchValues()
				onValuesChanged()
			}
		} catch (error) {
			logger.error('Error deleting value:', error)
		}
	}

	const startEditing = (val: ParameterValue) => {
		setEditingId(val.id)
		setEditValue(val.value)
		setEditValueIt(val.valueIt || '')
		setEditHexColor(val.hexColor || '#FFFFFF')
		setIsAdding(false)
	}

	const cancelEditing = () => {
		setEditingId(null)
		setEditValue('')
		setEditValueIt('')
		setEditHexColor('#FFFFFF')
	}

	const startAdding = () => {
		setIsAdding(true)
		setEditingId(null)
		setEditValue('')
		setEditValueIt('')
		setEditHexColor('#FFFFFF')
	}

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className='max-w-3xl max-h-[80vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>Управление значениями: {parameterName}</DialogTitle>
				</DialogHeader>

				<div className='space-y-4'>
					{/* Кнопка добавления */}
					<Button
						onClick={startAdding}
						disabled={isAdding}
						className='bg-green-600 hover:bg-green-700'
					>
						<Plus className='h-4 w-4 mr-2' />
						Добавить значение
					</Button>

					{/* Форма добавления */}
					{isAdding && (
						<div className='p-4 bg-green-50 rounded-md border border-green-200'>
							<div className='space-y-3'>
								<div className='grid grid-cols-2 gap-3'>
									{locale === 'it' ? (
										<>
											<div>
												<label className='text-sm font-medium mb-1 block'>
													Valore (IT): *
												</label>
												<Input
													value={editValueIt}
													onChange={e => setEditValueIt(e.target.value)}
													placeholder='Valore...'
													autoFocus
												/>
											</div>
											<div>
												<label className='text-sm font-medium mb-1 block'>
													Значение (RU):
												</label>
												<Input
													value={editValue}
													onChange={e => setEditValue(e.target.value)}
													placeholder='Введите значение...'
												/>
											</div>
										</>
									) : (
										<>
											<div>
												<label className='text-sm font-medium mb-1 block'>
													Значение (RU): *
												</label>
												<Input
													value={editValue}
													onChange={e => setEditValue(e.target.value)}
													placeholder='Введите значение...'
													autoFocus
												/>
											</div>
											<div>
												<label className='text-sm font-medium mb-1 block'>
													Valore (IT):
												</label>
												<Input
													value={editValueIt}
													onChange={e => setEditValueIt(e.target.value)}
													placeholder='Valore...'
												/>
											</div>
										</>
									)}
								</div>

								{parameterType === 'COLOR' && (
									<div className='space-y-2'>
										<label className='text-sm font-medium mb-1 block'>
											{locale === 'it' ? 'Colore (HEX):' : 'Цвет (HEX):'}
										</label>
										<div className='flex gap-2'>
											<input
												type='color'
												value={editHexColor}
												onChange={e => setEditHexColor(e.target.value)}
												className='w-12 h-10 rounded border cursor-pointer'
											/>
											<Input
												value={editHexColor}
												onChange={e => setEditHexColor(e.target.value)}
												placeholder='#FFFFFF'
												className='flex-1'
											/>
										</div>
										{editHexColor && hexToRAL(editHexColor) && (
											<div className='text-sm bg-blue-50 border border-blue-200 rounded px-3 py-2'>
												<span className='text-gray-600'>
													{locale === 'it' ? 'Codice RAL:' : 'Код RAL:'}{' '}
												</span>
												<span className='font-semibold text-blue-700'>
													{hexToRAL(editHexColor)}
												</span>
											</div>
										)}
									</div>
								)}

								<div className='flex gap-2'>
									<Button
										onClick={handleAdd}
										className='bg-green-600 hover:bg-green-700'
									>
										<Check className='h-4 w-4 mr-1' />
										Добавить
									</Button>
									<Button onClick={() => setIsAdding(false)} variant='outline'>
										<X className='h-4 w-4 mr-1' />
										Отмена
									</Button>
								</div>
							</div>
						</div>
					)}

					{/* Таблица значений */}
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className='w-12'>#</TableHead>
								{parameterType === 'COLOR' && (
									<>
										<TableHead className='w-16'>
											{locale === 'it' ? 'Colore' : 'Цвет'}
										</TableHead>
										<TableHead className='w-24'>RAL</TableHead>
									</>
								)}
								{locale === 'it' ? (
									<>
										<TableHead>Valore (IT)</TableHead>
										<TableHead>Значение (RU)</TableHead>
									</>
								) : (
									<>
										<TableHead>Значение (RU)</TableHead>
										<TableHead>Valore (IT)</TableHead>
									</>
								)}
								<TableHead className='w-32'>
									{locale === 'it' ? 'Stato' : 'Статус'}
								</TableHead>
								<TableHead className='w-32'>
									{locale === 'it' ? 'Azioni' : 'Действия'}
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{values.map((val, idx) => (
								<TableRow key={val.id}>
									<TableCell>{idx + 1}</TableCell>
									{parameterType === 'COLOR' && (
										<>
											<TableCell>
												{editingId === val.id ? (
													<input
														type='color'
														value={editHexColor}
														onChange={e => setEditHexColor(e.target.value)}
														className='w-10 h-10 rounded border cursor-pointer'
													/>
												) : (
													<div
														className='w-10 h-10 rounded border'
														style={{ backgroundColor: val.hexColor }}
													/>
												)}
											</TableCell>
											<TableCell>
												<span className='text-xs font-mono text-gray-600'>
													{val.ralCode || '-'}
												</span>
											</TableCell>
										</>
									)}
									{locale === 'it' ? (
										<>
											<TableCell>
												{editingId === val.id ? (
													<Input
														value={editValueIt}
														onChange={e => setEditValueIt(e.target.value)}
														className='h-8'
													/>
												) : (
													val.valueIt || '-'
												)}
											</TableCell>
											<TableCell>
												{editingId === val.id ? (
													<Input
														value={editValue}
														onChange={e => setEditValue(e.target.value)}
														className='h-8'
													/>
												) : (
													val.value
												)}
											</TableCell>
										</>
									) : (
										<>
											<TableCell>
												{editingId === val.id ? (
													<Input
														value={editValue}
														onChange={e => setEditValue(e.target.value)}
														className='h-8'
													/>
												) : (
													val.value
												)}
											</TableCell>
											<TableCell>
												{editingId === val.id ? (
													<Input
														value={editValueIt}
														onChange={e => setEditValueIt(e.target.value)}
														className='h-8'
													/>
												) : (
													val.valueIt || '-'
												)}
											</TableCell>
										</>
									)}
									<TableCell>
										{editingId === val.id ? (
											<div className='flex gap-1'>
												<Button
													size='sm'
													onClick={() => handleEdit(val.id)}
													className='bg-green-600 hover:bg-green-700 h-7'
												>
													<Save className='h-3 w-3' />
												</Button>
												<Button
													size='sm'
													variant='outline'
													onClick={cancelEditing}
													className='h-7'
												>
													<X className='h-3 w-3' />
												</Button>
											</div>
										) : (
											<div className='flex gap-1'>
												<Button
													size='sm'
													variant='outline'
													onClick={() => startEditing(val)}
													className='h-7'
												>
													<Edit className='h-3 w-3' />
												</Button>
												<Button
													size='sm'
													variant='outline'
													onClick={() => handleDelete(val.id)}
													className='text-red-600 hover:text-red-700 h-7'
												>
													<Trash2 className='h-3 w-3' />
												</Button>
											</div>
										)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>

					{values.length === 0 && !loading && (
						<div className='text-center py-8 text-gray-500'>
							Нет значений. Нажмите "Добавить значение" для создания.
						</div>
					)}
				</div>

				<DialogFooter>
					<Button onClick={onClose} variant='outline'>
						Закрыть
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
