# 🎨 QUICK CHEATSHEET - Punto Infissi CRM Design System

## 🚨 BEFORE YOU START

**MANDATORY WORKFLOW:**

1. Search existing forms in codebase
2. Propose options to user
3. Use existing patterns
4. Reference `.cursor/DESIGN_SYSTEM_GUIDE.md` for details

---

## 📐 FORM PATTERN (Copy-Paste Ready)

```tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Save, X } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export function YourFormModal({ isOpen, onClose, onSave, initialData }) {
	const { t } = useLanguage()
	const [formData, setFormData] = useState({})
	const [errors, setErrors] = useState({})

	useEffect(() => {
		if (initialData) setFormData(prev => ({ ...prev, ...initialData }))
	}, [initialData])

	const validate = () => {
		const newErrors = {}
		if (!formData.name?.trim()) newErrors.name = t('requiredField')
		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = () => {
		if (validate()) {
			onSave(formData)
			handleClose()
		}
	}

	const handleClose = () => {
		setFormData({})
		setErrors({})
		onClose()
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className='max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>{initialData ? t('edit') : t('create')}</DialogTitle>
				</DialogHeader>

				<div className='space-y-4 py-4'>
					<div className='sticker-card-v2 p-4'>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3'>
							<div>
								<Input
									value={formData.name || ''}
									onChange={e =>
										setFormData({ ...formData, name: e.target.value })
									}
									placeholder='Name'
									className={errors.name ? 'border-red-500' : ''}
								/>
								{errors.name && (
									<p className='text-xs text-red-600 mt-1'>{errors.name}</p>
								)}
							</div>
						</div>
					</div>
				</div>

				<div className='flex justify-end gap-3 pt-4 border-t'>
					<Button
						variant='outline'
						onClick={handleClose}
						className='border-red-300 text-red-600 hover:bg-red-50'
					>
						<X className='w-4 h-4 mr-2' />
						{t('cancel')}
					</Button>
					<Button
						onClick={handleSubmit}
						className='bg-green-600 hover:bg-green-700 text-white'
					>
						<Save className='w-4 h-4 mr-2' />
						{t('save')}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
```

---

## 🎨 COLORS

**ONLY use these:**

```tsx
// Buttons
className = 'bg-green-600 hover:bg-green-700 text-white' // Save/Action
className = 'border-red-300 text-red-600 hover:bg-red-50' // Cancel/Delete

// Errors
className = 'border-red-500' // Input error
className = 'text-xs text-red-600 mt-1' // Error message

// Semantic
className = 'bg-primary text-primary-foreground' // Black
className = 'text-muted-foreground' // Gray text
```

---

## 📏 LAYOUTS

```tsx
// Modal
className = 'max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto'

// Grid (Forms)
className = 'grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3'

// Card wrapper
className = 'sticker-card-v2 p-4'

// Spacing
className = 'space-y-4 py-4' // Section
className = 'flex justify-end gap-3 pt-4 border-t' // Actions
```

---

## 🔘 BUTTONS

```tsx
// Cancel (always outline red)
<Button variant='outline' onClick={handleClose} className='border-red-300 text-red-600 hover:bg-red-50'>
	<X className='w-4 h-4 mr-2' />
	Cancel
</Button>

// Save (always green)
<Button onClick={handleSubmit} className='bg-green-600 hover:bg-green-700 text-white'>
	<Save className='w-4 h-4 mr-2' />
	Save
</Button>

// Default action
<Button>
	<Plus className='w-4 h-4 mr-2' />
	Create
</Button>
```

---

## 📝 INPUTS

```tsx
// Standard
<Input
	value={formData.field}
	onChange={e => setFormData({ ...formData, field: e.target.value })}
	placeholder='Placeholder'
	className={errors.field ? 'border-red-500' : ''}
/>
{errors.field && <p className='text-xs text-red-600 mt-1'>{errors.field}</p>}

// Select
<Select value={formData.status} onValueChange={value => setFormData({ ...formData, status: value })}>
	<SelectTrigger>
		<SelectValue placeholder='Status' />
	</SelectTrigger>
	<SelectContent>
		<SelectItem value='active'>Active</SelectItem>
		<SelectItem value='inactive'>Inactive</SelectItem>
	</SelectContent>
</Select>

// Phone
<PhoneInput
	value={formData.phone}
	onChange={phone => setFormData({ ...formData, phone })}
	defaultCountry='IT'
/>

// Textarea (full width)
<div className='md:col-span-2'>
	<Textarea
		value={formData.notes}
		onChange={e => setFormData({ ...formData, notes: e.target.value })}
		rows={3}
		className='resize-none'
	/>
</div>
```

---

## 🎛️ TOGGLERS (Individual/Company)

```tsx
<div className='flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-lg'>
	<button
		type='button'
		onClick={() => setFormData({ ...formData, type: 'individual' })}
		className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
			formData.type === 'individual'
				? 'bg-green-600 text-white shadow-md'
				: 'bg-white text-gray-600 hover:bg-gray-100'
		}`}
	>
		<User className='h-4 w-4' />
		Individual
	</button>
	<div className='h-6 w-px bg-gray-300' />
	<button
		type='button'
		onClick={() => setFormData({ ...formData, type: 'company' })}
		className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
			formData.type === 'company'
				? 'bg-green-600 text-white shadow-md'
				: 'bg-white text-gray-600 hover:bg-gray-100'
		}`}
	>
		<Building className='h-4 w-4' />
		Company
	</button>
</div>
```

---

## ✅ VALIDATION TEMPLATE

```tsx
const validate = (): boolean => {
	const newErrors = {}

	// Required
	if (!formData.name?.trim()) newErrors.name = t('requiredField')

	// Phone
	if (
		!formData.phone?.trim() ||
		formData.phone.replace(/[^\d]/g, '').length <= 1
	) {
		newErrors.phone = t('requiredField')
	} else {
		const country = getCountryByDialCode(formData.phone)
		if (country && !validatePhoneForCountry(formData.phone, country)) {
			newErrors.phone = `${t('invalidPhoneFormat')} ${country.name}`
		}
	}

	// Email
	if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
		newErrors.email = t('invalidEmailFormat')
	}

	// Italian tax codes (if needed)
	if (
		formData.codiceFiscale &&
		!validateCodiceFiscale(formData.codiceFiscale)
	) {
		newErrors.codiceFiscale = t('invalidCodiceFiscaleFormat')
	}

	if (formData.partitaIVA && !validatePartitaIVA(formData.partitaIVA)) {
		newErrors.partitaIVA = t('invalidPartitaIVAFormat')
	}

	setErrors(newErrors)
	return Object.keys(newErrors).length === 0
}
```

---

## 📦 COMPONENT IMPORTS

```tsx
// Always from ui/
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PhoneInput } from '@/components/ui/phone-input'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardFooter,
} from '@/components/ui/card'
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from '@/components/ui/table'

// Icons
import { Save, X, Plus, Edit, Trash, User, Building } from 'lucide-react'

// Utils
import { useLanguage } from '@/contexts/LanguageContext'
import { validatePhoneForCountry, getCountryByDialCode } from '@/lib/countries'
import {
	validateCodiceFiscale,
	validatePartitaIVA,
} from '@/lib/italian-validation'
```

---

## 📋 CHECKLIST

**Before submitting code:**

- [ ] Searched existing forms
- [ ] Used Button, Input, Dialog from `/ui/`
- [ ] Grid: `grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3`
- [ ] Wrapper: `sticker-card-v2 p-4`
- [ ] Modal: `max-w-6xl w-[95vw] max-h-[90vh]`
- [ ] Cancel: red outline
- [ ] Save: green
- [ ] Validation with error display
- [ ] `useLanguage()` for translations
- [ ] No arbitrary colors
- [ ] Icons from lucide-react
- [ ] Tailwind classes, no inline styles

---

**📖 Full guide:** `.cursor/DESIGN_SYSTEM_GUIDE.md`
