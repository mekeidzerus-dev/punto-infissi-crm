import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { tmpdir } from 'node:os'

import {
	generateFileHash,
	saveFaviconFile,
} from '@/lib/favicon-storage'

let originalCwd: string
let tempDir: string
let publicDir: string

test.beforeEach(async () => {
	originalCwd = process.cwd()
	tempDir = await mkdtemp(path.join(tmpdir(), 'favicon-storage-'))
	publicDir = path.join(tempDir, 'public')
	await mkdir(publicDir, { recursive: true })
	process.chdir(tempDir)
})

test.afterEach(async () => {
	process.chdir(originalCwd)
	await rm(tempDir, { recursive: true, force: true })
})

test('generateFileHash is deterministic and length-limited', () => {
	const buffer = Buffer.from('modocrm')
	const hashA = generateFileHash(buffer)
	const hashB = generateFileHash(buffer)
	const hashC = generateFileHash(Buffer.from('other'))

	assert.equal(hashA, hashB)
	assert.equal(hashA.length, 12)
	assert.notEqual(hashA, hashC)
})

test('saveFaviconFile writes hashed file to public dir', async () => {
	const data = Buffer.from('favicon-data')
	const result = await saveFaviconFile(data, 'logo.png')

	assert.equal(result.success, true)
	assert.ok(result.path?.startsWith('/favicon-'))
	assert.ok(result.path?.endsWith('.png'))

	const relative = result.path?.startsWith('/')
		? result.path.slice(1)
		: result.path ?? ''
	const filePath = path.join(process.cwd(), 'public', relative)
	const stored = await readFile(filePath)
	assert.deepEqual(stored, data)
})

test('reusing same content keeps single file', async () => {
	const buffer = Buffer.from('same-content')

	const first = await saveFaviconFile(buffer, 'icon.ico')
	const second = await saveFaviconFile(buffer, 'icon.ico')

	assert.equal(first.success, true)
	assert.equal(second.success, true)
	assert.equal(first.path, second.path)

	const files = await readdir(publicDir)
	const faviconFiles = files.filter(name => name.startsWith('favicon-'))
	assert.equal(faviconFiles.length, 1)
})

test('returns error when public directory is missing', async () => {
	await rm(publicDir, { recursive: true, force: true })

	const result = await saveFaviconFile(Buffer.from('oops'), 'broken.png')

	assert.equal(result.success, false)
	assert.equal(result.error, 'Не удалось сохранить файл на сервере')
})


