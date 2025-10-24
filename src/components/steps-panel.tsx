'use client'

import { CheckCircle } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

// Функция для безопасного рендеринга иконки
const renderIcon = (icon: string) => {
	if (icon.length <= 4 && !icon.includes('<')) {
		return <span className='text-xs'>{icon}</span>
	}
	if (icon.includes('<svg')) {
		return (
			<div
				className='w-3 h-3 flex items-center justify-center'
				dangerouslySetInnerHTML={{ __html: icon }}
			/>
		)
	}
	return <span className='text-xs'>📦</span>
}

interface StepsPanelProps {
	currentStep: number
	onStepClick: (step: number) => void
	completedSteps: number[]
	disabledSteps: number[]
	selectedCategory?: any
	selectedSupplier?: any
}

export function StepsPanel({
	currentStep,
	onStepClick,
	completedSteps,
	disabledSteps,
	selectedCategory,
	selectedSupplier,
}: StepsPanelProps) {
	const { t } = useLanguage()

	const steps = [
		{ id: 1, title: 'Categoria' },
		{ id: 2, title: 'Fornitore' },
	]

	const getStepStatus = (stepId: number) => {
		if (completedSteps.includes(stepId)) return 'completed'
		if (currentStep === stepId) return 'current'
		if (disabledSteps.includes(stepId)) return 'disabled'
		return 'upcoming'
	}

	const getSelectedItem = (stepId: number) => {
		if (stepId === 1 && selectedCategory) {
			return { icon: selectedCategory.icon, name: selectedCategory.name }
		}
		if (stepId === 2 && selectedSupplier) {
			return { name: selectedSupplier.name }
		}
		return null
	}

	return (
		<div className='space-y-3'>
			{steps.map(step => {
				const status = getStepStatus(step.id)
				const isClickable = status !== 'disabled'
				const isCurrent = status === 'current'
				const isCompleted = status === 'completed'
				const selectedItem = getSelectedItem(step.id)

				return (
					<div
						key={step.id}
						className={`p-3 rounded-lg border-2 transition-all duration-200 ${
							isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
						} ${
							isCurrent
								? 'border-blue-500 bg-blue-50'
								: isCompleted
								? 'border-green-500 bg-green-50'
								: 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
						}`}
						onClick={() => isClickable && onStepClick(step.id)}
					>
						<div className='flex items-center space-x-2'>
							<div
								className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
									isCurrent
										? 'bg-blue-500 text-white'
										: isCompleted
										? 'bg-green-500 text-white'
										: 'bg-gray-300 text-gray-600'
								}`}
							>
								{isCompleted ? <CheckCircle className='h-4 w-4' /> : step.id}
							</div>
							<div className='flex-1'>
								<div
									className={`text-sm font-medium ${
										isCurrent
											? 'text-blue-700'
											: isCompleted
											? 'text-green-700'
											: 'text-gray-700'
									}`}
								>
									{step.title}
								</div>
								{selectedItem && (
									<div className='mt-0.5 flex items-center space-x-1.5'>
										{selectedItem.icon && renderIcon(selectedItem.icon)}
										<span className='text-xs text-gray-600'>
											{selectedItem.name}
										</span>
									</div>
								)}
							</div>
						</div>
					</div>
				)
			})}
		</div>
	)
}
