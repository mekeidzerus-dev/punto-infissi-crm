import {
	Document,
	Page,
	Text,
	View,
	StyleSheet,
	pdf,
} from '@react-pdf/renderer'

interface Client {
	id: number
	name: string
	email?: string
	company?: string
}

interface Product {
	id: number
	name: string
	description?: string
	category: string
	basePrice: number
}

interface ProposalItem {
	id: number
	product: Product
	quantity: number
	unitPrice: number
	totalPrice: number
}

interface Proposal {
	id: number
	proposalNumber: string
	client: Client
	items: ProposalItem[]
	totalAmount: number
	currency: string
	notes?: string
	createdAt: string
	status: string
}

const getCurrencySymbol = (code: string) => {
	switch (code) {
		case 'EUR':
			return '€'
		case 'RUB':
			return '₽'
		case 'USD':
			return '$'
		default:
			return '€'
	}
}

const styles = StyleSheet.create({
	page: {
		flexDirection: 'column',
		backgroundColor: '#FFFFFF',
		padding: 40,
		fontSize: 12,
		lineHeight: 1.5,
	},
	header: {
		marginBottom: 30,
		textAlign: 'center',
	},
	companyName: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#DC2626',
		marginBottom: 10,
	},
	documentTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 20,
		color: '#1F2937',
	},
	proposalInfo: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 30,
	},
	clientInfo: {
		width: '50%',
	},
	proposalDetails: {
		width: '40%',
		textAlign: 'right',
	},
	sectionTitle: {
		fontSize: 14,
		fontWeight: 'bold',
		marginBottom: 10,
		color: '#374151',
	},
	text: {
		marginBottom: 5,
		color: '#4B5563',
	},
	itemsTable: {
		marginTop: 20,
		marginBottom: 30,
	},
	tableHeader: {
		flexDirection: 'row',
		backgroundColor: '#F3F4F6',
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#D1D5DB',
	},
	tableRow: {
		flexDirection: 'row',
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#E5E7EB',
	},
	tableCell: {
		flex: 1,
		color: '#374151',
	},
	tableCellNumber: {
		width: 60,
		textAlign: 'right',
		color: '#374151',
	},
	tableCellPrice: {
		width: 80,
		textAlign: 'right',
		color: '#374151',
	},
	totalSection: {
		marginTop: 20,
		padding: 15,
		backgroundColor: '#FEF2F2',
		borderRadius: 5,
	},
	totalRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 5,
	},
	totalAmount: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#DC2626',
	},
	notes: {
		marginTop: 30,
		padding: 15,
		backgroundColor: '#F9FAFB',
		borderRadius: 5,
	},
	footer: {
		marginTop: 40,
		paddingTop: 20,
		borderTopWidth: 1,
		borderTopColor: '#E5E7EB',
		textAlign: 'center',
		fontSize: 10,
		color: '#6B7280',
	},
})

const ProposalPDF = ({ proposal }: { proposal: Proposal }) => (
	<Document>
		<Page size='A4' style={styles.page}>
			{/* Заголовок */}
			<View style={styles.header}>
				<Text style={styles.companyName}>PUNTO INFISSI</Text>
				<Text style={styles.documentTitle}>КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ</Text>
			</View>

			{/* Информация о предложении и клиенте */}
			<View style={styles.proposalInfo}>
				<View style={styles.clientInfo}>
					<Text style={styles.sectionTitle}>Клиент:</Text>
					<Text style={styles.text}>{proposal.client.name}</Text>
					{proposal.client.company && (
						<Text style={styles.text}>{proposal.client.company}</Text>
					)}
					{proposal.client.email && (
						<Text style={styles.text}>{proposal.client.email}</Text>
					)}
				</View>
				<View style={styles.proposalDetails}>
					<Text style={styles.sectionTitle}>Детали предложения:</Text>
					<Text style={styles.text}>№ {proposal.proposalNumber}</Text>
					<Text style={styles.text}>
						Дата: {new Date(proposal.createdAt).toLocaleDateString('ru-RU')}
					</Text>
					<Text style={styles.text}>Статус: {proposal.status}</Text>
				</View>
			</View>

			{/* Таблица позиций */}
			<View style={styles.itemsTable}>
				<Text style={styles.sectionTitle}>Позиции предложения:</Text>

				{/* Заголовок таблицы */}
				<View style={styles.tableHeader}>
					<Text style={[styles.tableCell, { flex: 2 }]}>Наименование</Text>
					<Text style={styles.tableCellNumber}>Кол-во</Text>
					<Text style={styles.tableCellPrice}>Цена</Text>
					<Text style={styles.tableCellPrice}>Сумма</Text>
				</View>

				{/* Строки товаров */}
				{proposal.items.map(item => (
					<View key={item.id} style={styles.tableRow}>
						<Text style={[styles.tableCell, { flex: 2 }]}>
							{item.product.name}
						</Text>
						<Text style={styles.tableCellNumber}>{item.quantity}</Text>
						<Text style={styles.tableCellPrice}>
							{getCurrencySymbol(proposal.currency)}
							{item.unitPrice.toLocaleString('ru-RU')}
						</Text>
						<Text style={styles.tableCellPrice}>
							{getCurrencySymbol(proposal.currency)}
							{item.totalPrice.toLocaleString('ru-RU')}
						</Text>
					</View>
				))}
			</View>

			{/* Итого */}
			<View style={styles.totalSection}>
				<View style={styles.totalRow}>
					<Text style={styles.totalAmount}>
						ИТОГО: {getCurrencySymbol(proposal.currency)}
						{proposal.totalAmount.toLocaleString('ru-RU')}
					</Text>
				</View>
			</View>

			{/* Примечания */}
			{proposal.notes && (
				<View style={styles.notes}>
					<Text style={styles.sectionTitle}>Примечания:</Text>
					<Text style={styles.text}>{proposal.notes}</Text>
				</View>
			)}

			{/* Подвал */}
			<View style={styles.footer}>
				<Text>PUNTO INFISSI - Система управления продажами окон и дверей</Text>
				<Text>Документ сгенерирован автоматически</Text>
			</View>
		</Page>
	</Document>
)

export async function generatePDF(proposal: Proposal) {
	try {
		const blob = await pdf(<ProposalPDF proposal={proposal} />).toBlob()

		// Создаем ссылку для скачивания
		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = `Предложение_${proposal.proposalNumber}.pdf`

		// Добавляем ссылку в DOM, кликаем и удаляем
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)

		// Освобождаем память
		URL.revokeObjectURL(url)
	} catch (error) {
		console.error('Ошибка генерации PDF:', error)
		throw error
	}
}
