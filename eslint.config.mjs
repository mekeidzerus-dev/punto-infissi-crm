import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
	baseDirectory: __dirname,
})

const eslintConfig = [
	{
		ignores: [
			'**/node_modules/**',
			'**/.next/**',
			'**/out/**',
			'**/build/**',
			'**/scripts/**',
			'next-env.d.ts',
		],
	},
	...compat.extends('next/core-web-vitals', 'next/typescript'),
	{
		files: ['**/*.{ts,tsx,js,jsx}'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
			],
			'react-hooks/exhaustive-deps': 'warn',
			'react/no-unescaped-entities': 'warn',
			'prefer-const': 'warn',
		},
	},
]

export default eslintConfig
