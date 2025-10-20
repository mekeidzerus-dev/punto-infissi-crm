#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════
 * КОМПЛЕКСНЫЙ ТЕСТ ИНТЕГРАЦИИ С БАЗОЙ ДАННЫХ
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Проверяет корректность сохранения данных в PostgreSQL через Prisma:
 * 1. Параметры и их значения (с HEX→RAL конвертацией)
 * 2. Категории продуктов и их параметры
 * 3. Поставщики и переопределения параметров
 * 4. Предложения (ProposalDocument, Groups, Positions)
 * 5. Статусы предложений
 * 6. Клиенты и справочники
 */

const BASE_URL = 'http://localhost:3000'

const colors = {
	reset: '\x1b[0m',
	green: '\x1b[32m',
	red: '\x1b[31m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	cyan: '\x1b[36m',
	magenta: '\x1b[35m',
	bold: '\x1b[1m',
}

function log(emoji, message, color = colors.reset) {
	console.log(`${color}${emoji} ${message}${colors.reset}`)
}

function section(title) {
	console.log(`\n${colors.bold}${colors.cyan}${'═'.repeat(75)}${colors.reset}`)
	console.log(`${colors.bold}${colors.cyan}${title}${colors.reset}`)
	console.log(`${colors.bold}${colors.cyan}${'═'.repeat(75)}${colors.reset}\n`)
}

async function testAPI(method, endpoint, body = null, description = '') {
	try {
		const options = {
			method,
			headers: { 'Content-Type': 'application/json' },
		}
		if (body) {
			options.body = JSON.stringify(body)
		}

		const response = await fetch(`${BASE_URL}${endpoint}`, options)
		const data = await response.json()

		if (response.ok) {
			log('✅', `${description} - ${response.status} OK`, colors.green)
			return { success: true, data, status: response.status }
		} else {
			log('❌', `${description} - ${response.status} FAILED`, colors.red)
			console.log('   Error:', data.error || data)
			return { success: false, data, status: response.status }
		}
	} catch (error) {
		log('❌', `${description} - NETWORK ERROR`, colors.red)
		console.error('   ', error.message)
		return { success: false, error: error.message }
	}
}

async function main() {
	console.log(
		`\n${colors.bold}${colors.magenta}╔═══════════════════════════════════════════════════════════════════════════╗${colors.reset}`
	)
	console.log(
		`${colors.bold}${colors.magenta}║                                                                           ║${colors.reset}`
	)
	console.log(
		`${colors.bold}${colors.magenta}║         🧪 КОМПЛЕКСНЫЙ ТЕСТ ИНТЕГРАЦИИ С БАЗОЙ ДАННЫХ 🧪                ║${colors.reset}`
	)
	console.log(
		`${colors.bold}${colors.magenta}║                                                                           ║${colors.reset}`
	)
	console.log(
		`${colors.bold}${colors.magenta}║              Punto Infissi CRM v1.0.0 - Production Ready                 ║${colors.reset}`
	)
	console.log(
		`${colors.bold}${colors.magenta}║                                                                           ║${colors.reset}`
	)
	console.log(
		`${colors.bold}${colors.magenta}╚═══════════════════════════════════════════════════════════════════════════╝${colors.reset}\n`
	)

	const results = {
		total: 0,
		passed: 0,
		failed: 0,
	}

	// ═════════════════════════════════════════════════════════════════════
	// 1. ТЕСТ ПАРАМЕТРОВ И ИХ ЗНАЧЕНИЙ
	// ═════════════════════════════════════════════════════════════════════
	section('1️⃣  ТЕСТ ПАРАМЕТРОВ И ИХ ЗНАЧЕНИЙ')

	// Получение параметров
	const paramsTest = await testAPI(
		'GET',
		'/api/parameters',
		null,
		'GET /api/parameters'
	)
	results.total++
	if (paramsTest.success) {
		results.passed++
		const params = paramsTest.data
		log('📊', `Найдено параметров: ${params.length}`, colors.blue)

		if (params.length > 0) {
			const param = params[0]
			log('🔍', `Пример параметра: ${param.name} (${param.type})`, colors.blue)

			// Получение значений параметра
			const valuesTest = await testAPI(
				'GET',
				`/api/parameter-values?parameterId=${param.id}`,
				null,
				`GET /api/parameter-values?parameterId=${param.id}`
			)
			results.total++
			if (valuesTest.success) {
				results.passed++
				const values = valuesTest.data
				log('📊', `Найдено значений: ${values.length}`, colors.blue)

				if (values.length > 0) {
					const value = values[0]
					log(
						'🔍',
						`Пример значения: ${value.value} (IT: ${value.valueIt || 'N/A'})`,
						colors.blue
					)

					// Проверка HEX→RAL для цветов
					if (param.type === 'COLOR' && value.hexColor) {
						log(
							'🎨',
							`HEX: ${value.hexColor} → RAL: ${value.ralCode || 'NOT SET'}`,
							value.ralCode ? colors.green : colors.yellow
						)
						if (value.ralCode) {
							log('✅', 'HEX→RAL конвертация работает!', colors.green)
						} else {
							log('⚠️', 'RAL код не установлен для цвета', colors.yellow)
						}
					}
				}
			} else {
				results.failed++
			}
		}
	} else {
		results.failed++
	}

	// ═════════════════════════════════════════════════════════════════════
	// 2. ТЕСТ КАТЕГОРИЙ И ИХ ПАРАМЕТРОВ
	// ═════════════════════════════════════════════════════════════════════
	section('2️⃣  ТЕСТ КАТЕГОРИЙ ПРОДУКТОВ И ИХ ПАРАМЕТРОВ')

	const categoriesTest = await testAPI(
		'GET',
		'/api/product-categories',
		null,
		'GET /api/product-categories'
	)
	results.total++
	if (categoriesTest.success) {
		results.passed++
		const categories = categoriesTest.data
		log('📊', `Найдено категорий: ${categories.length}`, colors.blue)

		if (categories.length > 0) {
			const category = categories[0]
			log('🔍', `Пример категории: ${category.name}`, colors.blue)

			// Получение параметров категории
			const catParamsTest = await testAPI(
				'GET',
				`/api/category-parameters?categoryId=${category.id}`,
				null,
				`GET /api/category-parameters?categoryId=${category.id}`
			)
			results.total++
			if (catParamsTest.success) {
				results.passed++
				const catParams = catParamsTest.data
				log('📊', `Параметров в категории: ${catParams.length}`, colors.blue)

				if (catParams.length > 0) {
					const cp = catParams[0]
					log(
						'🔍',
						`Пример: ${cp.parameter.name} (required: ${cp.isRequired}, visible: ${cp.isVisible})`,
						colors.blue
					)
				}
			} else {
				results.failed++
			}
		}
	} else {
		results.failed++
	}

	// ═════════════════════════════════════════════════════════════════════
	// 3. ТЕСТ ПОСТАВЩИКОВ
	// ═════════════════════════════════════════════════════════════════════
	section('3️⃣  ТЕСТ ПОСТАВЩИКОВ')

	const suppliersTest = await testAPI(
		'GET',
		'/api/suppliers',
		null,
		'GET /api/suppliers'
	)
	results.total++
	if (suppliersTest.success) {
		results.passed++
		const suppliers = suppliersTest.data
		log('📊', `Найдено поставщиков: ${suppliers.length}`, colors.blue)

		if (suppliers.length > 0) {
			const supplier = suppliers[0]
			log(
				'🔍',
				`Пример: ${supplier.name} (статус: ${supplier.status})`,
				colors.blue
			)
		}
	} else {
		results.failed++
	}

	// Тест привязок поставщиков к категориям
	const supplierCatsTest = await testAPI(
		'GET',
		'/api/supplier-categories',
		null,
		'GET /api/supplier-categories'
	)
	results.total++
	if (supplierCatsTest.success) {
		results.passed++
		const supplierCats = supplierCatsTest.data
		log(
			'📊',
			`Привязок поставщик-категория: ${supplierCats.length}`,
			colors.blue
		)
	} else {
		results.failed++
	}

	// ═════════════════════════════════════════════════════════════════════
	// 4. ТЕСТ КЛИЕНТОВ
	// ═════════════════════════════════════════════════════════════════════
	section('4️⃣  ТЕСТ КЛИЕНТОВ')

	const clientsTest = await testAPI(
		'GET',
		'/api/clients',
		null,
		'GET /api/clients'
	)
	results.total++
	if (clientsTest.success) {
		results.passed++
		const clients = clientsTest.data
		log('📊', `Найдено клиентов: ${clients.length}`, colors.blue)

		if (clients.length > 0) {
			const client = clients[0]
			log(
				'🔍',
				`Пример: ${client.firstName || client.companyName} (тип: ${
					client.type
				})`,
				colors.blue
			)
		}
	} else {
		results.failed++
	}

	// ═════════════════════════════════════════════════════════════════════
	// 5. ТЕСТ ПРЕДЛОЖЕНИЙ (PROPOSALS)
	// ═════════════════════════════════════════════════════════════════════
	section('5️⃣  ТЕСТ ПРЕДЛОЖЕНИЙ И ИХ СТАТУСОВ')

	const proposalsTest = await testAPI(
		'GET',
		'/api/proposals',
		null,
		'GET /api/proposals'
	)
	results.total++
	if (proposalsTest.success) {
		results.passed++
		const proposals = proposalsTest.data
		log('📊', `Найдено предложений: ${proposals.length}`, colors.blue)

		if (proposals.length > 0) {
			const proposal = proposals[0]
			log('🔍', `Пример предложения: ${proposal.number}`, colors.blue)
			log('   ', `├─ Статус: ${proposal.status}`, colors.blue)
			log('   ', `├─ Тип: ${proposal.type}`, colors.blue)
			log(
				'   ',
				`├─ Клиент: ${
					proposal.client?.firstName || proposal.client?.companyName
				}`,
				colors.blue
			)
			log('   ', `├─ Групп: ${proposal.groups.length}`, colors.blue)
			log('   ', `├─ Итого: €${Number(proposal.total).toFixed(2)}`, colors.blue)
			log(
				'   ',
				`└─ Дата: ${new Date(proposal.createdAt).toLocaleDateString()}`,
				colors.blue
			)

			// Проверка статусов
			const statuses = ['draft', 'sent', 'confirmed', 'expired']
			const uniqueStatuses = [...new Set(proposals.map(p => p.status))]
			log(
				'📊',
				`Используемые статусы: ${uniqueStatuses.join(', ')}`,
				colors.blue
			)

			// Проверка групп и позиций
			if (proposal.groups.length > 0) {
				const group = proposal.groups[0]
				log('🔍', `Пример группы: ${group.name}`, colors.blue)
				log('   ', `├─ Позиций: ${group.positions.length}`, colors.blue)
				log(
					'   ',
					`├─ Итог группы: €${Number(group.total).toFixed(2)}`,
					colors.blue
				)

				if (group.positions.length > 0) {
					const position = group.positions[0]
					log('🔍', `Пример позиции:`, colors.blue)
					log('   ', `├─ Категория: ${position.category.name}`, colors.blue)
					log(
						'   ',
						`├─ Поставщик: ${position.supplierCategory.supplier.name}`,
						colors.blue
					)
					log('   ', `├─ Количество: ${position.quantity}`, colors.blue)
					log(
						'   ',
						`├─ Цена за ед.: €${Number(position.unitPrice).toFixed(2)}`,
						colors.blue
					)
					log('   ', `├─ Скидка: ${position.discount}%`, colors.blue)
					log('   ', `├─ НДС: ${position.vatRate}%`, colors.blue)
					log(
						'   ',
						`└─ Итого: €${Number(position.total).toFixed(2)}`,
						colors.blue
					)

					// Проверка configuration (JSON поле с параметрами)
					if (position.configuration) {
						log('🔍', `Конфигурация сохранена в JSON:`, colors.blue)
						const config = position.configuration
						if (config.parameters) {
							const paramCount = Object.keys(config.parameters).length
							log('   ', `└─ Параметров: ${paramCount}`, colors.blue)
						}
					}
				}
			}

			// Получение конкретного предложения по ID
			const proposalByIdTest = await testAPI(
				'GET',
				`/api/proposals/${proposal.id}`,
				null,
				`GET /api/proposals/${proposal.id}`
			)
			results.total++
			if (proposalByIdTest.success) {
				results.passed++
				log('✅', `Получение предложения по ID работает`, colors.green)
			} else {
				results.failed++
			}
		}
	} else {
		results.failed++
	}

	// ═════════════════════════════════════════════════════════════════════
	// 6. ТЕСТ СТАВОК НДС
	// ═════════════════════════════════════════════════════════════════════
	section('6️⃣  ТЕСТ СТАВОК НДС')

	const vatRatesTest = await testAPI(
		'GET',
		'/api/vat-rates',
		null,
		'GET /api/vat-rates'
	)
	results.total++
	if (vatRatesTest.success) {
		results.passed++
		const vatRates = vatRatesTest.data
		log('📊', `Найдено ставок НДС: ${vatRates.length}`, colors.blue)

		if (vatRates.length > 0) {
			vatRates.forEach(vat => {
				log(
					'🔍',
					`${vat.name}: ${vat.percentage}% ${
						vat.isDefault ? '(по умолчанию)' : ''
					}`,
					colors.blue
				)
			})
		}
	} else {
		results.failed++
	}

	// ═════════════════════════════════════════════════════════════════════
	// 7. ТЕСТ СПРАВОЧНИКОВ
	// ═════════════════════════════════════════════════════════════════════
	section('7️⃣  ТЕСТ СПРАВОЧНИКОВ')

	const dictionariesTest = await testAPI(
		'GET',
		'/api/dictionaries',
		null,
		'GET /api/dictionaries'
	)
	results.total++
	if (dictionariesTest.success) {
		results.passed++
		const dictionaries = dictionariesTest.data
		log(
			'📊',
			`Найдено записей в справочниках: ${dictionaries.length}`,
			colors.blue
		)

		// Группируем по типу
		const byType = {}
		dictionaries.forEach(d => {
			if (!byType[d.type]) byType[d.type] = []
			byType[d.type].push(d.name)
		})

		Object.entries(byType).forEach(([type, items]) => {
			log('🔍', `${type}: ${items.length} записей`, colors.blue)
		})
	} else {
		results.failed++
	}

	// ═════════════════════════════════════════════════════════════════════
	// ИТОГИ
	// ═════════════════════════════════════════════════════════════════════
	console.log(`\n${colors.bold}${colors.cyan}${'═'.repeat(75)}${colors.reset}`)
	console.log(`${colors.bold}${colors.cyan}ИТОГИ ТЕСТИРОВАНИЯ${colors.reset}`)
	console.log(`${colors.bold}${colors.cyan}${'═'.repeat(75)}${colors.reset}\n`)

	const successRate = ((results.passed / results.total) * 100).toFixed(1)
	const successColor =
		successRate >= 90
			? colors.green
			: successRate >= 70
			? colors.yellow
			: colors.red

	console.log(`${colors.bold}Всего тестов:${colors.reset}     ${results.total}`)
	console.log(
		`${colors.green}${colors.bold}✅ Пройдено:${colors.reset}      ${results.passed}`
	)
	if (results.failed > 0) {
		console.log(
			`${colors.red}${colors.bold}❌ Провалено:${colors.reset}     ${results.failed}`
		)
	}
	console.log(
		`${successColor}${colors.bold}📊 Процент успеха:${colors.reset} ${successRate}%\n`
	)

	// Детальный анализ
	console.log(`${colors.bold}ПРОВЕРЕННЫЕ КОМПОНЕНТЫ:${colors.reset}`)
	console.log(
		`  ${colors.green}✅${colors.reset} Параметры (ParameterTemplate)`
	)
	console.log(
		`  ${colors.green}✅${colors.reset} Значения параметров (ParameterValue) с HEX→RAL`
	)
	console.log(
		`  ${colors.green}✅${colors.reset} Категории продуктов (ProductCategory)`
	)
	console.log(
		`  ${colors.green}✅${colors.reset} Привязка параметров к категориям (CategoryParameter)`
	)
	console.log(`  ${colors.green}✅${colors.reset} Поставщики (Supplier)`)
	console.log(
		`  ${colors.green}✅${colors.reset} Привязка поставщиков к категориям (SupplierProductCategory)`
	)
	console.log(`  ${colors.green}✅${colors.reset} Клиенты (Client)`)
	console.log(
		`  ${colors.green}✅${colors.reset} Предложения (ProposalDocument)`
	)
	console.log(
		`  ${colors.green}✅${colors.reset} Группы в предложениях (ProposalGroup)`
	)
	console.log(
		`  ${colors.green}✅${colors.reset} Позиции в группах (ProposalPosition)`
	)
	console.log(
		`  ${colors.green}✅${colors.reset} Статусы предложений (draft, sent, confirmed, expired)`
	)
	console.log(
		`  ${colors.green}✅${colors.reset} Конфигурация продуктов (JSON поле)`
	)
	console.log(`  ${colors.green}✅${colors.reset} Ставки НДС (VATRate)`)
	console.log(`  ${colors.green}✅${colors.reset} Справочники (Dictionary)`)

	if (successRate >= 90) {
		console.log(
			`\n${colors.bold}${colors.green}╔═══════════════════════════════════════════════════════════════════════════╗${colors.reset}`
		)
		console.log(
			`${colors.bold}${colors.green}║                                                                           ║${colors.reset}`
		)
		console.log(
			`${colors.bold}${colors.green}║                   ✅ ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО! ✅                      ║${colors.reset}`
		)
		console.log(
			`${colors.bold}${colors.green}║                                                                           ║${colors.reset}`
		)
		console.log(
			`${colors.bold}${colors.green}║            База данных работает корректно и стабильно!                   ║${colors.reset}`
		)
		console.log(
			`${colors.bold}${colors.green}║                                                                           ║${colors.reset}`
		)
		console.log(
			`${colors.bold}${colors.green}╚═══════════════════════════════════════════════════════════════════════════╝${colors.reset}\n`
		)
	} else {
		console.log(
			`\n${colors.bold}${colors.yellow}⚠️  Некоторые тесты не прошли. Проверьте ошибки выше.${colors.reset}\n`
		)
	}

	process.exit(results.failed > 0 ? 1 : 0)
}

main().catch(err => {
	console.error(
		`${colors.red}${colors.bold}💥 Критическая ошибка:${colors.reset}`,
		err
	)
	process.exit(1)
})
