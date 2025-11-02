'use client'

import { useState } from 'react'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLanguage } from '@/contexts/LanguageContext'
import { logger } from '@/lib/logger'

interface ParameterValueAddDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	parameterId: string
	parameterName: string
	parameterType:
		| 'SELECT'
		| 'COLOR'
		| 'TEXT'
		| 'NUMBER'
		| 'BOOLEAN'
		| 'MULTI_SELECT'
		| 'DATE'
		| 'RANGE'
	onValueAdded: (newValue: {
		id: string
		value: string
		valueIt?: string
		displayName?: string
		hexColor?: string
		ralCode?: string
	}) => void
}

export function ParameterValueAddDialog({
	open,
	onOpenChange,
	parameterId,
	parameterName,
	parameterType,
	onValueAdded,
}: ParameterValueAddDialogProps) {
	const { locale } = useLanguage()
	const [value, setValue] = useState('')
	const [valueIt, setValueIt] = useState('')
	const [hexColor, setHexColor] = useState('#FFFFFF')
	const [ralCode, setRalCode] = useState('')
	const [isSaving, setIsSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const isColorType = parameterType === 'COLOR'

	// Сброс формы при открытии
	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			// Сброс формы при закрытии
			setValue('')
			setValueIt('')
			setHexColor('#FFFFFF')
			setRalCode('')
			setError(null)
		}
		onOpenChange(newOpen)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)

		// Валидация: основное значение обязательно
		if (!value.trim()) {
			setError(
				locale === 'ru'
					? 'Значение обязательно для заполнения'
					: 'Il valore è obbligatorio'
			)
			return
		}

		setIsSaving(true)

		try {
			const requestBody: any = {
				parameterId,
				value: value.trim(),
				valueIt: valueIt.trim() || value.trim(), // Если перевод не указан, используем основное значение
				displayName: value.trim(),
			}

			// Для COLOR типа добавляем цвет и RAL код
			if (isColorType) {
				requestBody.hexColor = hexColor || '#FFFFFF'
				if (ralCode.trim()) {
					requestBody.ralCode = ralCode.trim()
				}
			}

			const response = await fetch('/api/parameter-values', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(requestBody),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(
					errorData.error ||
						(locale === 'ru'
							? 'Ошибка при добавлении значения'
							: "Errore durante l'aggiunta del valore")
				)
			}

			const newValue = await response.json()

			logger.info(
				`✅ Added value "${newValue.value}" to parameter ${parameterName}`
			)

			// Передаем новое значение в родительский компонент
			onValueAdded(newValue)

			// Закрываем окно и сбрасываем форму
			handleOpenChange(false)
		} catch (err: any) {
			logger.error('❌ Error adding parameter value:', err)
			setError(
				err.message ||
					(locale === 'ru'
						? 'Ошибка при добавлении значения'
						: "Errore durante l'aggiunta del valore")
			)
		} finally {
			setIsSaving(false)
		}
	}

	const displayName =
		locale === 'ru'
			? `Добавить значение для "${parameterName}"`
			: `Aggiungi valore per "${parameterName}"`

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>{displayName}</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className='space-y-4'>
					{/* Основное значение */}
					<div className='space-y-2'>
						<Label htmlFor='value'>
							{locale === 'ru' ? 'Значение' : 'Valore'} *
						</Label>
						<Input
							id='value'
							type='text'
							value={value}
							onChange={e => setValue(e.target.value)}
							placeholder={
								locale === 'ru' ? 'Введите значение' : 'Inserisci il valore'
							}
							required
							disabled={isSaving}
							autoFocus
						/>
					</div>

					{/* Перевод значения */}
					<div className='space-y-2'>
						<Label htmlFor='valueIt'>
							{locale === 'ru' ? 'Перевод (итальянский)' : 'Traduzione (russo)'}
						</Label>
						<Input
							id='valueIt'
							type='text'
							value={valueIt}
							onChange={e => setValueIt(e.target.value)}
							placeholder={
								locale === 'ru'
									? 'Введите перевод (опционально)'
									: 'Inserisci la traduzione (opzionale)'
							}
							disabled={isSaving}
						/>
					</div>

					{/* Поля для COLOR типа */}
					{isColorType && (
						<>
							<div className='space-y-2'>
								<Label htmlFor='hexColor'>
									{locale === 'ru' ? 'HEX Цвет' : 'Colore HEX'}
								</Label>
								<div className='flex items-center gap-2'>
									<input
										type='color'
										value={hexColor}
										onChange={e => setHexColor(e.target.value)}
										className='w-16 h-10 border rounded cursor-pointer'
										disabled={isSaving}
									/>
									<Input
										type='text'
										value={hexColor}
										onChange={e => setHexColor(e.target.value)}
										placeholder='#FFFFFF'
										pattern='^#[0-9A-Fa-f]{6}$'
										disabled={isSaving}
										className='flex-1'
									/>
								</div>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='ralCode'>
									{locale === 'ru' ? 'RAL Код' : 'Codice RAL'}
								</Label>
								<Input
									id='ralCode'
									type='text'
									value={ralCode}
									onChange={e => setRalCode(e.target.value)}
									placeholder='RAL 9010'
									disabled={isSaving}
								/>
							</div>
						</>
					)}

					{/* Ошибка */}
					{error && (
						<div className='p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm'>
							{error}
						</div>
					)}

					{/* Кнопки */}
					<div className='flex justify-end gap-3 pt-4 border-t'>
						<Button
							type='button'
							variant='outline'
							onClick={() => handleOpenChange(false)}
							disabled={isSaving}
						>
							{locale === 'ru' ? 'Отмена' : 'Annulla'}
						</Button>
						<Button
							type='submit'
							disabled={isSaving || !value.trim()}
							className='bg-green-600 hover:bg-green-700 text-white'
						>
							{isSaving
								? locale === 'ru'
									? 'Сохранение...'
									: 'Salvataggio...'
								: locale === 'ru'
								? 'Добавить'
								: 'Aggiungi'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}
