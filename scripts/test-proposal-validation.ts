import { proposalCreateSchema } from '../src/lib/validation/proposal'

// Тестируем валидацию с данными как из формы
const testCases = [
	{
		name: 'Тест 1: Стандартные данные с YYYY-MM-DD датами и числовым statusId',
		data: {
			clientId: 1,
			groups: [
				{
					name: 'Gruppo Test',
					description: 'Test',
					positions: [
						{
							categoryId: 'cat1',
							supplierCategoryId: 'supp1',
							description: 'Test product',
							unitPrice: 100,
							quantity: 1,
							discount: 0,
							vatRate: 22,
							total: 122,
							vatAmount: 22,
						},
					],
				},
			],
			vatRate: 22,
			proposalDate: '2025-01-15', // YYYY-MM-DD формат
			validUntil: '2025-02-15', // YYYY-MM-DD формат
			responsibleManager: 'Test Manager',
			status: 'draft',
			statusId: 8, // число
			notes: 'Test',
		},
	},
	{
		name: 'Тест 2: ISO datetime строки и строковый statusId',
		data: {
			clientId: 1,
			groups: [
				{
					name: 'Gruppo Test',
					positions: [
						{
							categoryId: 'cat1',
							supplierCategoryId: 'supp1',
							unitPrice: 100,
							quantity: 1,
						},
					],
				},
			],
			proposalDate: '2025-01-15T00:00:00.000Z',
			validUntil: '2025-02-15T00:00:00.000Z',
			statusId: '8', // строка
		},
	},
	{
		name: 'Тест 3: null значения',
		data: {
			clientId: 1,
			groups: [
				{
					name: 'Gruppo Test',
					positions: [
						{
							categoryId: 'cat1',
							supplierCategoryId: 'supp1',
							unitPrice: 100,
							quantity: 1,
						},
					],
				},
			],
			proposalDate: null,
			validUntil: null,
			statusId: null,
		},
	},
]

console.log('🧪 Тестирование валидации предложений...\n')

for (const testCase of testCases) {
	console.log(`\n📋 ${testCase.name}`)
	console.log('Входные данные:')
	console.log(JSON.stringify(testCase.data, null, 2))

	const result = proposalCreateSchema.safeParse(testCase.data)

	if (result.success) {
		console.log('✅ Валидация прошла успешно!')
		console.log('Выходные данные:')
		console.log(JSON.stringify(result.data, null, 2))
		console.log('\nПроверка преобразований:')
		if (testCase.data.proposalDate) {
			console.log(
				`  proposalDate: "${testCase.data.proposalDate}" -> "${result.data.proposalDate}"`
			)
		}
		if (testCase.data.validUntil) {
			console.log(
				`  validUntil: "${testCase.data.validUntil}" -> "${result.data.validUntil}"`
			)
		}
		if (testCase.data.statusId !== undefined) {
			console.log(
				`  statusId: ${testCase.data.statusId} (${typeof testCase.data.statusId}) -> "${result.data.statusId}" (${typeof result.data.statusId})`
			)
		}
	} else {
		console.error('❌ Ошибка валидации:')
		console.error(JSON.stringify(result.error.errors, null, 2))
	}
}

console.log('\n✅ Тестирование завершено!')

