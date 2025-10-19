'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog'
import { Plus, Save, X } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

// Предустановленные иконки в стиле ultra-thin
const DEFAULT_ICONS = [
	{
		name: 'Serramenti',
		icon: '🪟',
		description: 'Finestre e porte finestre',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<rect x="4" y="4" width="16" height="16" rx="1"/>
			<line x1="12" y1="4" x2="12" y2="20"/>
			<line x1="4" y1="12" x2="20" y2="12"/>
		</svg>`,
	},
	{
		name: 'Cassonetti',
		icon: '📦',
		description: 'Cassonetti per avvolgibili',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<rect x="3" y="4" width="18" height="12" rx="1"/>
			<line x1="9" y1="20" x2="15" y2="20"/>
			<line x1="12" y1="16" x2="12" y2="20"/>
		</svg>`,
	},
	{
		name: 'Avvolgibile',
		icon: '🪟',
		description: 'Tende avvolgibili',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<rect x="3" y="4" width="18" height="16" rx="1"/>
			<line x1="3" y1="8" x2="21" y2="8"/>
			<line x1="3" y1="12" x2="21" y2="12"/>
			<line x1="3" y1="16" x2="21" y2="16"/>
		</svg>`,
	},
	{
		name: 'Scuri',
		icon: '🪟',
		description: 'Scuri e persiane',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<rect x="3" y="4" width="18" height="16" rx="1"/>
			<line x1="3" y1="6" x2="21" y2="6"/>
			<line x1="3" y1="10" x2="21" y2="10"/>
			<line x1="3" y1="14" x2="21" y2="14"/>
			<line x1="3" y1="18" x2="21" y2="18"/>
		</svg>`,
	},
	{
		name: 'Tende',
		icon: '🪟',
		description: 'Tende e tendaggi',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<rect x="3" y="4" width="18" height="16" rx="1"/>
			<path d="M3 8h18"/>
			<path d="M3 12h18"/>
			<path d="M3 16h18"/>
		</svg>`,
	},
	{
		name: 'Zanzariere',
		icon: '🦟',
		description: 'Zanzariere e reti',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<rect x="3" y="4" width="18" height="16" rx="1"/>
			<line x1="7" y1="6" x2="7" y2="18"/>
			<line x1="11" y1="6" x2="11" y2="18"/>
			<line x1="15" y1="6" x2="15" y2="18"/>
			<line x1="19" y1="6" x2="19" y2="18"/>
			<line x1="3" y1="8" x2="21" y2="8"/>
			<line x1="3" y1="12" x2="21" y2="12"/>
			<line x1="3" y1="16" x2="21" y2="16"/>
		</svg>`,
	},
	{
		name: 'Blindati e Portoncini',
		icon: '🚪',
		description: 'Porte blindate e portoncini',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<rect x="4" y="4" width="16" height="16" rx="1"/>
			<circle cx="12" cy="12" r="1.5"/>
			<path d="M12 2v4"/>
			<path d="M12 18v4"/>
		</svg>`,
	},
	{
		name: 'Falso Telaio',
		icon: '🪟',
		description: 'Falsi telai e strutture',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<rect x="3" y="3" width="18" height="18" rx="1"/>
			<rect x="7" y="7" width="10" height="10" rx="0.5"/>
			<rect x="10" y="10" width="4" height="4" rx="0.5"/>
		</svg>`,
	},
	{
		name: 'Porte Interne',
		icon: '🚪',
		description: 'Porte interne e divisorie',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<rect x="4" y="4" width="16" height="16" rx="1"/>
			<circle cx="12" cy="12" r="1.5"/>
			<path d="M12 2v4"/>
		</svg>`,
	},
	{
		name: 'Pergole',
		icon: '🏗️',
		description: 'Pergole e strutture esterne',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<rect x="3" y="9" width="18" height="10" rx="1"/>
			<line x1="7" y1="3" x2="7" y2="9"/>
			<line x1="17" y1="3" x2="17" y2="9"/>
			<line x1="3" y1="11" x2="21" y2="11"/>
			<line x1="3" y1="15" x2="21" y2="15"/>
		</svg>`,
	},
	{
		name: 'Accessori',
		icon: '📦',
		description: 'Accessori e componenti',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<rect x="4" y="4" width="16" height="16" rx="1"/>
			<path d="M10 10h4v4h-4z"/>
			<path d="M10 2v4"/>
			<path d="M14 2v4"/>
			<path d="M10 18v4"/>
			<path d="M14 18v4"/>
		</svg>`,
	},
	{
		name: 'Servizi / Attività',
		icon: '🔧',
		description: 'Servizi e attività',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<path d="M15.5 6.5a1 1 0 0 0 0 1.4l1.4 1.4a1 1 0 0 0 1.4 0l3.5-3.5a5 5 0 0 1-6.5 6.5l-6 6a1.5 1.5 0 0 1-2-2l6-6a5 5 0 0 1 6.5-6.5l-3.5 3.5z"/>
		</svg>`,
	},
	{
		name: 'Vetrate',
		icon: '🪟',
		description: 'Vetrate e cristalli',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<rect x="4" y="4" width="16" height="16" rx="1"/>
			<line x1="4" y1="8" x2="20" y2="8"/>
			<line x1="4" y1="12" x2="20" y2="12"/>
			<line x1="4" y1="16" x2="20" y2="16"/>
			<line x1="8" y1="4" x2="8" y2="20"/>
			<line x1="12" y1="4" x2="12" y2="20"/>
			<line x1="16" y1="4" x2="16" y2="20"/>
		</svg>`,
	},
	{
		name: 'Cancelli',
		icon: '🚪',
		description: 'Cancelli e recinzioni',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<rect x="4" y="4" width="16" height="16" rx="1"/>
			<line x1="8" y1="4" x2="8" y2="20"/>
			<line x1="12" y1="4" x2="12" y2="20"/>
			<line x1="16" y1="4" x2="16" y2="20"/>
			<line x1="4" y1="8" x2="20" y2="8"/>
			<line x1="4" y1="12" x2="20" y2="12"/>
			<line x1="4" y1="16" x2="20" y2="16"/>
		</svg>`,
	},
	{
		name: 'Tetti',
		icon: '🏠',
		description: 'Tetti e coperture',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<path d="M3 12l9-9 9 9"/>
			<path d="M5 12v8h14v-8"/>
			<line x1="9" y1="12" x2="9" y2="20"/>
			<line x1="15" y1="12" x2="15" y2="20"/>
		</svg>`,
	},
	{
		name: 'Pavimenti',
		icon: '🏗️',
		description: 'Pavimenti e rivestimenti',
		svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
			<rect x="2" y="8" width="20" height="12" rx="1"/>
			<line x1="6" y1="8" x2="6" y2="20"/>
			<line x1="10" y1="8" x2="10" y2="20"/>
			<line x1="14" y1="8" x2="14" y2="20"/>
			<line x1="18" y1="8" x2="18" y2="20"/>
			<line x1="2" y1="12" x2="22" y2="12"/>
			<line x1="2" y1="16" x2="22" y2="16"/>
		</svg>`,
	},
]

interface AddCategoryModalProps {
	isOpen: boolean
	onClose: () => void
	onSave: (category: {
		name: string
		icon: string
		description?: string
	}) => void
	initialData?: {
		name: string
		icon: string
		description?: string
	}
}

export function AddCategoryModal({
	isOpen,
	onClose,
	onSave,
	initialData,
}: AddCategoryModalProps) {
	const { t } = useLanguage()
	const [formData, setFormData] = useState({
		name: initialData?.name || '',
		icon: initialData?.icon || '',
		description: initialData?.description || '',
	})
	const [selectedIcon, setSelectedIcon] = useState(initialData?.icon || '')

	const handleSave = () => {
		if (!formData.name.trim()) {
			alert('Nome categoria è obbligatorio')
			return
		}

		if (!selectedIcon) {
			alert("Seleziona un'icona")
			return
		}

		onSave({
			name: formData.name,
			icon: selectedIcon,
			description: formData.description,
		})

		// Reset form
		setFormData({ name: '', icon: '', description: '' })
		setSelectedIcon('')
		onClose()
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2'>
						<Plus className='h-5 w-5' />
						{initialData ? 'Modifica Categoria' : 'Aggiungi Nuova Categoria'}
					</DialogTitle>
					<DialogDescription>
						{initialData
							? 'Modifica i dettagli della categoria esistente'
							: 'Crea una nuova categoria di prodotti con icona personalizzata'}
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-6 py-4'>
					{/* Nome categoria */}
					<div>
						<Label htmlFor='categoryName'>Nome Categoria *</Label>
						<Input
							id='categoryName'
							value={formData.name}
							onChange={e =>
								setFormData(prev => ({ ...prev, name: e.target.value }))
							}
							placeholder='Es: Serramenti, Cassonetti, Avvolgibile...'
							className='mt-1'
						/>
					</div>

					{/* Descrizione */}
					<div>
						<Label htmlFor='categoryDescription'>Descrizione</Label>
						<Textarea
							id='categoryDescription'
							value={formData.description}
							onChange={e =>
								setFormData(prev => ({ ...prev, description: e.target.value }))
							}
							placeholder='Descrizione opzionale della categoria...'
							className='mt-1'
							rows={3}
						/>
					</div>

					{/* Selezione icona */}
					<div>
						<Label>Seleziona Icona *</Label>
						<div className='mt-3 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3'>
							{DEFAULT_ICONS.map((iconData, index) => (
								<Card
									key={index}
									className={`p-3 cursor-pointer transition-all hover:shadow-md ${
										selectedIcon === iconData.svg
											? 'ring-2 ring-blue-500 bg-blue-50'
											: 'hover:bg-gray-50'
									}`}
									onClick={() => setSelectedIcon(iconData.svg)}
								>
									<div className='flex flex-col items-center space-y-2'>
										<div
											className='w-8 h-8 flex items-center justify-center'
											dangerouslySetInnerHTML={{ __html: iconData.svg }}
										/>
										<div className='text-xs text-center text-gray-600'>
											{iconData.name}
										</div>
									</div>
								</Card>
							))}
						</div>
					</div>

					{/* Icona personalizzata */}
					<div>
						<Label htmlFor='customIcon'>Icona Personalizzata (SVG)</Label>
						<Textarea
							id='customIcon'
							value={formData.icon}
							onChange={e => {
								setFormData(prev => ({ ...prev, icon: e.target.value }))
								setSelectedIcon(e.target.value)
							}}
							placeholder='Incolla qui il codice SVG personalizzato...'
							className='mt-1 font-mono text-sm'
							rows={4}
						/>
						{formData.icon && (
							<div className='mt-2 p-3 border rounded-lg bg-gray-50'>
								<div className='text-sm text-gray-600 mb-2'>Anteprima:</div>
								<div
									className='w-12 h-12 flex items-center justify-center'
									dangerouslySetInnerHTML={{ __html: formData.icon }}
								/>
							</div>
						)}
					</div>
				</div>

				{/* Azioni */}
				<div className='flex justify-end gap-3 pt-4 border-t'>
					<Button variant='outline' onClick={onClose}>
						<X className='h-4 w-4 mr-2' />
						Annulla
					</Button>
					<Button
						onClick={handleSave}
						className='bg-green-600 hover:bg-green-700'
					>
						<Save className='h-4 w-4 mr-2' />
						{initialData ? 'Salva Modifiche' : 'Salva Categoria'}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
