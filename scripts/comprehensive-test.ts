#!/usr/bin/env tsx
/**
 * Комплексное тестирование MODOCRM через API
 * Проверяет все основные функции приложения
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

interface TestResult {
	name: string
	status: 'PASS' | 'FAIL' | 'SKIP'
	error?: string
	duration?: number
}

const results: TestResult[] = []

async function test(name: string, fn: () => Promise<void> | void) {
	const start = Date.now()
	try {
		await fn()
		const duration = Date.now() - start
		results.push({ name, status: 'PASS', duration })
		console.log(`✅ ${name} (${duration}ms)`)
	} catch (error) {
		const duration = Date.now() - start
		const errorMsg = error instanceof Error ? error.message : String(error)
		results.push({ name, status: 'FAIL', error: errorMsg, duration })
		console.log(`❌ ${name}: ${errorMsg}`)
	}
}

async function testSkip(name: string, reason: string) {
	results.push({ name, status: 'SKIP', error: reason })
	console.log(`⏭️  ${name}: ${reason}`)
}

async function checkHealth() {
	const response = await fetch(`${BASE_URL}/api/health`)
	if (!response.ok) throw new Error(`Health check failed: ${response.status}`)
	const data = await response.json()
	if (data.status !== 'healthy') throw new Error(`Unhealthy: ${data.status}`)
}

async function checkDatabase() {
	await prisma.$queryRaw`SELECT 1`
}

async function checkAPIEndpoint(endpoint: string, method: string = 'GET') {
	const response = await fetch(`${BASE_URL}${endpoint}`, {
		method,
		headers: { 'Content-Type': 'application/json' },
	})
	return response
}

async function main() {
	console.log('🚀 Запуск комплексного тестирования MODOCRM\n')
	console.log(`Base URL: ${BASE_URL}\n`)

	// Базовые проверки
	await test('Health Check', checkHealth)
	await test('Database Connection', checkDatabase)

	// Проверка API endpoints (без авторизации - должны возвращать 401)
	await test('API: /api/clients (без авторизации)', async () => {
		const response = await checkAPIEndpoint('/api/clients')
		if (response.status !== 401) {
			const text = await response.text()
			throw new Error(`Expected 401, got ${response.status}. Response: ${text}`)
		}
		const data = await response.json()
		if (!data.error || !data.error.includes('Authentication')) {
			throw new Error(`Expected error message, got: ${JSON.stringify(data)}`)
		}
	})

	await test('API: /api/proposals (без авторизации)', async () => {
		const response = await checkAPIEndpoint('/api/proposals')
		if (response.status !== 401) {
			const text = await response.text()
			throw new Error(`Expected 401, got ${response.status}. Response: ${text}`)
		}
		const data = await response.json()
		if (!data.error || !data.error.includes('Authentication')) {
			throw new Error(`Expected error message, got: ${JSON.stringify(data)}`)
		}
	})

	await test('API: /api/suppliers (без авторизации)', async () => {
		const response = await checkAPIEndpoint('/api/suppliers')
		if (response.status !== 401) {
			const text = await response.text()
			throw new Error(`Expected 401, got ${response.status}. Response: ${text}`)
		}
		const data = await response.json()
		if (!data.error || !data.error.includes('Authentication')) {
			throw new Error(`Expected error message, got: ${JSON.stringify(data)}`)
		}
	})

	await test('API: /api/partners (без авторизации)', async () => {
		const response = await checkAPIEndpoint('/api/partners')
		if (response.status !== 401) {
			const text = await response.text()
			throw new Error(`Expected 401, got ${response.status}. Response: ${text}`)
		}
	})

	await test('API: /api/installers (без авторизации)', async () => {
		const response = await checkAPIEndpoint('/api/installers')
		if (response.status !== 401) {
			const text = await response.text()
			throw new Error(`Expected 401, got ${response.status}. Response: ${text}`)
		}
	})

	await test('API: /api/product-categories (без авторизации)', async () => {
		const response = await checkAPIEndpoint('/api/product-categories')
		if (response.status !== 401) {
			const text = await response.text()
			throw new Error(`Expected 401, got ${response.status}. Response: ${text}`)
		}
	})

	// Проверка публичных страниц
	await test('Public: /auth/signin', async () => {
		const response = await fetch(`${BASE_URL}/auth/signin`)
		if (!response.ok) throw new Error(`Failed: ${response.status}`)
	})

	await test('Public: /auth/signup', async () => {
		const response = await fetch(`${BASE_URL}/auth/signup`)
		if (!response.ok) throw new Error(`Failed: ${response.status}`)
	})

	// Проверка базы данных - структура
	await test('Database: Check User model', async () => {
		const count = await prisma.user.count()
		console.log(`   Users in DB: ${count}`)
	})

	await test('Database: Check Client model', async () => {
		const count = await prisma.client.count()
		console.log(`   Clients in DB: ${count}`)
	})

	await test('Database: Check Proposal model', async () => {
		const count = await prisma.proposal.count()
		console.log(`   Proposals in DB: ${count}`)
	})

	await test('Database: Check Supplier model', async () => {
		const count = await prisma.supplier.count()
		console.log(`   Suppliers in DB: ${count}`)
	})

	await test('Database: Check ProductCategory model', async () => {
		const count = await prisma.productCategory.count()
		console.log(`   Categories in DB: ${count}`)
	})

	await test('Database: Check ParameterTemplate model', async () => {
		const count = await prisma.parameterTemplate.count()
		console.log(`   Parameters in DB: ${count}`)
	})

	// Итоги
	console.log('\n' + '='.repeat(60))
	console.log('📊 РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ')
	console.log('='.repeat(60))

	const passed = results.filter((r) => r.status === 'PASS').length
	const failed = results.filter((r) => r.status === 'FAIL').length
	const skipped = results.filter((r) => r.status === 'SKIP').length

	console.log(`\n✅ Пройдено: ${passed}`)
	console.log(`❌ Провалено: ${failed}`)
	console.log(`⏭️  Пропущено: ${skipped}`)
	console.log(`📊 Всего: ${results.length}`)

	if (failed > 0) {
		console.log('\n❌ Проваленные тесты:')
		results
			.filter((r) => r.status === 'FAIL')
			.forEach((r) => {
				console.log(`   - ${r.name}: ${r.error}`)
			})
	}

	const successRate = ((passed / (passed + failed)) * 100).toFixed(1)
	console.log(`\n📈 Успешность: ${successRate}%`)

	await prisma.$disconnect()

	process.exit(failed > 0 ? 1 : 0)
}

main().catch((error) => {
	console.error('Fatal error:', error)
	process.exit(1)
})

