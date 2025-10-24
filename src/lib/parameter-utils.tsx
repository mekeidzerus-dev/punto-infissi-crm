// Утилита для загрузки параметров категории
export async function loadCategoryParameters(categoryId: string) {
	try {
		const response = await fetch(
			`/api/category-parameters?categoryId=${categoryId}`
		)
		if (!response.ok) throw new Error('Failed to load parameters')
		return await response.json()
	} catch (error) {
		console.error('Error loading category parameters:', error)
		return []
	}
}

// Утилита для рендеринга параметра по типу
export function renderParameterInput(
	parameter: any,
	value: any,
	onChange: (value: any) => void
) {
	const { type } = parameter.parameter

	switch (type) {
		case 'TEXT':
			return (
				<input
					type='text'
					value={value || ''}
					onChange={e => onChange(e.target.value)}
					className='w-full p-2 border rounded'
					placeholder={parameter.helpText || ''}
				/>
			)

		case 'NUMBER':
			return (
				<input
					type='number'
					value={value || ''}
					onChange={e => onChange(parseFloat(e.target.value))}
					min={parameter.parameter.minValue}
					max={parameter.parameter.maxValue}
					step={parameter.parameter.step || 1}
					className='w-full p-2 border rounded'
					placeholder={parameter.helpText || ''}
				/>
			)

		case 'SELECT':
		case 'COLOR':
			return (
				<select
					value={value || ''}
					onChange={e => onChange(e.target.value)}
					className='w-full p-2 border rounded'
				>
					<option value=''>Выберите...</option>
					{parameter.parameter.values?.map((v: any) => (
						<option key={v.id} value={v.value}>
							{v.displayName || v.value}
							{v.ralCode && ` (${v.ralCode})`}
						</option>
					))}
				</select>
			)

		case 'BOOLEAN':
			return (
				<label className='flex items-center'>
					<input
						type='checkbox'
						checked={value || false}
						onChange={e => onChange(e.target.checked)}
						className='mr-2'
					/>
					{parameter.displayNameIt || parameter.parameter.nameIt}
				</label>
			)

		default:
			return (
				<input
					type='text'
					value={value || ''}
					onChange={e => onChange(e.target.value)}
					className='w-full p-2 border rounded'
				/>
			)
	}
}
