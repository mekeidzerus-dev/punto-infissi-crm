'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	COUNTRIES,
	type Country,
	formatPhoneForCountry,
	getCountryByDialCode,
} from '@/lib/countries'

interface PhoneInputProps {
	value: string
	onChange: (value: string) => void
	placeholder?: string
	className?: string
	defaultCountry?: string // ISO код страны по умолчанию
}

export function PhoneInput({
	value,
	onChange,
	placeholder = 'Телефон',
	className = '',
	defaultCountry = 'IT',
}: PhoneInputProps) {
	const [selectedCountry, setSelectedCountry] = useState<Country>(
		COUNTRIES.find(c => c.code === defaultCountry) || COUNTRIES[0]
	)

	// Определяем страну по текущему значению телефона
	useEffect(() => {
		if (value && value.startsWith('+')) {
			const detectedCountry = getCountryByDialCode(value)
			if (detectedCountry && detectedCountry.code !== selectedCountry.code) {
				setSelectedCountry(detectedCountry)
			}
		}
	}, [value, selectedCountry.code])

	const handleCountryChange = (countryCode: string) => {
		const newCountry = COUNTRIES.find(c => c.code === countryCode)
		if (newCountry) {
			setSelectedCountry(newCountry)
			// Заменяем код страны в текущем номере
			const digits = value.replace(/[^\d]/g, '').replace(/^\d{1,3}/, '') // Удаляем старый код
			onChange(formatPhoneForCountry(digits, newCountry))
		}
	}

	const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		// Получаем только цифры из ввода
		const inputDigits = e.target.value.replace(/[^\d]/g, '')
		// Добавляем код страны и форматируем
		const fullNumber = selectedCountry.dialCode + inputDigits
		const formatted = formatPhoneForCountry(fullNumber, selectedCountry)
		onChange(formatted)
	}

	// Получаем номер без кода страны для отображения в поле
	const displayValue = value.replace(selectedCountry.dialCode, '').trim()

	return (
		<div
			className={`relative flex items-stretch border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${className}`}
		>
			{/* Селектор страны - встроенный слева */}
			<Select value={selectedCountry.code} onValueChange={handleCountryChange}>
				<SelectTrigger className='w-[110px] shrink-0 border-0 border-r rounded-none focus:ring-0 focus:ring-offset-0 bg-gray-50 hover:bg-gray-100'>
					<SelectValue>
						<div className='flex items-center gap-1.5'>
							<span className='text-lg'>{selectedCountry.flag}</span>
							<span className='text-sm font-semibold'>
								{selectedCountry.dialCode}
							</span>
						</div>
					</SelectValue>
				</SelectTrigger>
				<SelectContent>
					{COUNTRIES.map(country => (
						<SelectItem key={country.code} value={country.code}>
							<div className='flex items-center gap-2'>
								<span className='text-xl'>{country.flag}</span>
								<span className='text-sm font-medium'>{country.name}</span>
								<span className='text-xs text-gray-500'>
									{country.dialCode}
								</span>
							</div>
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			{/* Поле ввода номера - БЕЗ кода страны, БЕЗ border */}
			<Input
				type='tel'
				value={displayValue}
				onChange={handlePhoneChange}
				placeholder={placeholder}
				className='flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none'
			/>
		</div>
	)
}
