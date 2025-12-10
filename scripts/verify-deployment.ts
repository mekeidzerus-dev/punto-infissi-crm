#!/usr/bin/env tsx
/**
 * Скрипт для проверки успешности деплоя
 * Используется для локальной проверки или в CI/CD
 */

import { execSync } from 'child_process'

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://infissi.omoxsoft.com.ua'
const PM2_PROCESS_NAME = 'punto-infissi-crm-current'
const EXPECTED_PORT = 3000
const MAX_RETRIES = 5
const RETRY_DELAY = 10000 // 10 секунд

interface CheckResult {
	name: string
	success: boolean
	message: string
	details?: string
}

const results: CheckResult[] = []

function check(name: string, checkFn: () => Promise<boolean> | boolean, details?: () => Promise<string> | string) {
	return async () => {
		try {
			const success = await checkFn()
			const detailMessage = details ? await details() : undefined
			results.push({
				name,
				success,
				message: success ? `✅ ${name}` : `❌ ${name}`,
				details: detailMessage,
			})
			return success
		} catch (error) {
			results.push({
				name,
				success: false,
				message: `❌ ${name}: ${error instanceof Error ? error.message : String(error)}`,
			})
			return false
		}
	}
}

async function checkPM2Status(): Promise<boolean> {
	try {
		const output = execSync(`pm2 list | grep ${PM2_PROCESS_NAME} || echo ""`, {
			encoding: 'utf-8',
		}).trim()

		if (!output) {
			throw new Error('PM2 процесс не найден')
		}

		if (output.includes('online')) {
			return true
		}

		if (output.includes('errored') || output.includes('stopped')) {
			throw new Error(`Процесс в статусе ошибки: ${output}`)
		}

		return false
	} catch (error) {
		throw error
	}
}

async function getPM2Details(): Promise<string> {
	try {
		const status = execSync(`pm2 list | grep ${PM2_PROCESS_NAME} || echo ""`, {
			encoding: 'utf-8',
		}).trim()
		return status || 'Процесс не найден'
	} catch {
		return 'Не удалось получить статус'
	}
}

async function checkPort(): Promise<boolean> {
	try {
		let command = ''
		if (execSync('command -v ss', { encoding: 'utf-8' }).trim()) {
			command = `ss -tuln | grep ":${EXPECTED_PORT} " || echo ""`
		} else if (execSync('command -v netstat', { encoding: 'utf-8' }).trim()) {
			command = `netstat -tuln | grep ":${EXPECTED_PORT} " || echo ""`
		} else {
			throw new Error('Не найдены команды ss или netstat')
		}

		const output = execSync(command, { encoding: 'utf-8' }).trim()
		return output.length > 0
	} catch (error) {
		throw error
	}
}

async function checkHealthEndpoint(): Promise<boolean> {
	const url = `http://localhost:${EXPECTED_PORT}/api/health`

	for (let i = 0; i < MAX_RETRIES; i++) {
		try {
			const response = await fetch(url, {
				signal: AbortSignal.timeout(5000),
			})

			if (response.ok) {
				const data = await response.json()
				if (data.status === 'healthy') {
					return true
				}
			}
		} catch (error) {
			if (i < MAX_RETRIES - 1) {
				await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
				continue
			}
			throw error
		}
	}

	return false
}

async function checkExternalURL(url: string): Promise<boolean> {
	for (let i = 0; i < MAX_RETRIES; i++) {
		try {
			const response = await fetch(url, {
				signal: AbortSignal.timeout(30000),
			})

			if (response.ok) {
				return true
			}

			if (i < MAX_RETRIES - 1) {
				await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
				continue
			}

			throw new Error(`HTTP ${response.status}: ${response.statusText}`)
		} catch (error) {
			if (i < MAX_RETRIES - 1) {
				await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
				continue
			}
			throw error
		}
	}

	return false
}

async function getPM2Logs(): Promise<string> {
	try {
		const logs = execSync(`pm2 logs ${PM2_PROCESS_NAME} --lines 50 --nostream 2>&1 || echo ""`, {
			encoding: 'utf-8',
		}).trim()
		return logs || 'Логи недоступны'
	} catch {
		return 'Не удалось получить логи'
	}
}

async function main() {
	console.log('🔍 Проверка деплоя...\n')

	const checks = [
		check('PM2 процесс запущен', checkPM2Status, getPM2Details),
		check('Порт 3000 слушается', checkPort),
		check('Health endpoint локально', checkHealthEndpoint),
		check(`Главная страница (${PRODUCTION_URL})`, () => checkExternalURL(PRODUCTION_URL)),
		check(`Health endpoint (${PRODUCTION_URL}/api/health)`, () =>
			checkExternalURL(`${PRODUCTION_URL}/api/health`)
		),
		check(`Страница входа (${PRODUCTION_URL}/auth/signin)`, () =>
			checkExternalURL(`${PRODUCTION_URL}/auth/signin`)
		),
	]

	for (const checkFn of checks) {
		await checkFn()
	}

	console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
	console.log('📊 РЕЗУЛЬТАТЫ ПРОВЕРКИ')
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

	let allPassed = true
	for (const result of results) {
		console.log(result.message)
		if (result.details) {
			console.log(`   ${result.details}`)
		}
		if (!result.success) {
			allPassed = false
		}
	}

	console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

	if (!allPassed) {
		console.log('❌ Некоторые проверки не пройдены')
		console.log('\n📋 Логи PM2:')
		console.log(await getPM2Logs())
		process.exit(1)
	}

	console.log('✅ Все проверки пройдены успешно!')
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main().catch((error) => {
	console.error('❌ Ошибка при проверке:', error)
	process.exit(1)
})

