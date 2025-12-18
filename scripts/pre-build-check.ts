#!/usr/bin/env tsx
/**
 * Скрипт проверки перед сборкой
 * Проверяет отсутствие проблемных паттернов импортов и циклических зависимостей
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const PROJECT_ROOT = join(__dirname, '..')
const SRC_DIR = join(PROJECT_ROOT, 'src')

interface ImportInfo {
	file: string
	imports: string[]
}

function findFiles(
	dir: string,
	extensions: string[] = ['.ts', '.tsx']
): string[] {
	const files: string[] = []

	try {
		const entries = require('fs').readdirSync(dir, { withFileTypes: true })

		for (const entry of entries) {
			const fullPath = join(dir, entry.name)

			if (
				entry.isDirectory() &&
				!entry.name.startsWith('.') &&
				entry.name !== 'node_modules'
			) {
				files.push(...findFiles(fullPath, extensions))
			} else if (
				entry.isFile() &&
				extensions.some(ext => entry.name.endsWith(ext))
			) {
				files.push(fullPath)
			}
		}
	} catch (error) {
		// Игнорируем ошибки доступа
	}

	return files
}

function extractImports(filePath: string): string[] {
	try {
		const content = readFileSync(filePath, 'utf-8')
		const imports: string[] = []

		// Находим все импорты
		const importRegex =
			/import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"]([^'"]+)['"]/g
		let match

		while ((match = importRegex.exec(content)) !== null) {
			const importPath = match[1]
			if (
				importPath.startsWith('@/') ||
				importPath.startsWith('./') ||
				importPath.startsWith('../')
			) {
				imports.push(importPath)
			}
		}

		return imports
	} catch (error) {
		return []
	}
}

function checkCircularDependencies(files: ImportInfo[]): boolean {
	const visited = new Set<string>()
	const recursionStack = new Set<string>()
	const cycles: string[][] = []

	function resolvePath(from: string, importPath: string): string | null {
		if (importPath.startsWith('@/')) {
			return join(SRC_DIR, importPath.replace('@/', ''))
		}
		if (importPath.startsWith('./') || importPath.startsWith('../')) {
			const dir = require('path').dirname(from)
			return require('path').resolve(dir, importPath)
		}
		return null
	}

	function dfs(file: string, path: string[]): void {
		if (recursionStack.has(file)) {
			// Найден цикл
			const cycleStart = path.indexOf(file)
			cycles.push([...path.slice(cycleStart), file])
			return
		}

		if (visited.has(file)) {
			return
		}

		visited.add(file)
		recursionStack.add(file)

		const fileInfo = files.find(f => f.file === file)
		if (fileInfo) {
			for (const imp of fileInfo.imports) {
				const resolved = resolvePath(file, imp)
				if (resolved && existsSync(resolved)) {
					dfs(resolved, [...path, file])
				}
			}
		}

		recursionStack.delete(file)
	}

	for (const fileInfo of files) {
		if (!visited.has(fileInfo.file)) {
			dfs(fileInfo.file, [])
		}
	}

	if (cycles.length > 0) {
		console.error('❌ Обнаружены циклические зависимости:')
		cycles.forEach((cycle, idx) => {
			console.error(`  ${idx + 1}. ${cycle.join(' -> ')}`)
		})
		return false
	}

	return true
}

function main() {
	console.log('🔍 Проверка структуры проекта перед сборкой...\n')

	const files = findFiles(SRC_DIR)
	console.log(`📁 Найдено ${files.length} файлов для проверки\n`)

	const imports: ImportInfo[] = files.map(file => ({
		file,
		imports: extractImports(file),
	}))

	// Проверка циклических зависимостей
	console.log('🔗 Проверка циклических зависимостей...')
	const noCycles = checkCircularDependencies(imports)

	if (!noCycles) {
		console.error(
			'\n❌ Проверка не пройдена. Исправьте циклические зависимости перед сборкой.'
		)
		process.exit(1)
	}

	console.log('✅ Циклических зависимостей не обнаружено\n')

	// Проверка критичных файлов
	const criticalFiles = [
		'src/lib/auth-options.ts',
		'src/app/api/auth/[...nextauth]/route.ts',
	]

	console.log('📋 Проверка критичных файлов...')
	for (const file of criticalFiles) {
		const fullPath = join(PROJECT_ROOT, file)
		if (!existsSync(fullPath)) {
			console.error(`❌ Отсутствует критичный файл: ${file}`)
			process.exit(1)
		}
	}
	console.log('✅ Все критичные файлы на месте\n')

	console.log('✅ Проверка завершена успешно. Можно выполнять сборку.')
}

main()



