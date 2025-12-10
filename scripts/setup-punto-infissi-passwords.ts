/**
 * Установка/проверка паролей для пользователей PUNTO INFISSI SRL
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const DEFAULT_PASSWORDS = {
	'admin@modocrm.com': 'Admin123456',
	'user@modocrm.com': 'User123456',
}

async function setupPasswords() {
	console.log('🔐 Настройка паролей для PUNTO INFISSI SRL...\n')

	try {
		const org = await prisma.organization.findFirst({
			where: {
				name: {
					contains: 'PUNTO INFISSI',
					mode: 'insensitive',
				},
			},
		})

		if (!org) {
			console.log('❌ Организация не найдена')
			return
		}

		const users = await prisma.user.findMany({
			where: {
				organizationId: org.id,
			},
		})

		console.log(`📋 Найдено пользователей: ${users.length}\n`)

		for (const user of users) {
			const defaultPassword = DEFAULT_PASSWORDS[user.email as keyof typeof DEFAULT_PASSWORDS]
			
			if (!defaultPassword) {
				console.log(`⚠️  ${user.email}: нет пароля по умолчанию`)
				continue
			}

			// Проверяем текущий пароль
			const hasPassword = !!user.password && user.password.length > 0
			
			if (hasPassword && user.password) {
				// Проверяем, совпадает ли пароль
				const matches = await bcrypt.compare(defaultPassword, user.password)
				if (matches) {
					console.log(`✅ ${user.email}: пароль уже установлен (${defaultPassword})`)
				} else {
					console.log(`⚠️  ${user.email}: пароль установлен, но отличается от стандартного`)
					console.log(`   Текущий пароль: установлен`)
					console.log(`   Стандартный пароль: ${defaultPassword}`)
				}
			} else {
				// Устанавливаем пароль
				const hashedPassword = await bcrypt.hash(defaultPassword, 10)
				await prisma.user.update({
					where: { id: user.id },
					data: { password: hashedPassword },
				})
				console.log(`✅ ${user.email}: пароль установлен (${defaultPassword})`)
			}
		}

		console.log('\n' + '='.repeat(60))
		console.log('📝 УЧЕТНЫЕ ДАННЫЕ ДЛЯ ВХОДА:')
		console.log('='.repeat(60))
		console.log('\n🔑 Администратор:')
		console.log('   Email: admin@modocrm.com')
		console.log('   Пароль: Admin123456')
		console.log('\n👤 Пользователь:')
		console.log('   Email: user@modocrm.com')
		console.log('   Пароль: User123456')
		console.log('\n🌐 URL для входа:')
		console.log('   http://localhost:3000/auth/signin')
		console.log('\n' + '='.repeat(60))
	} catch (error: any) {
		console.error('❌ Ошибка:', error.message)
		process.exit(1)
	}
}

setupPasswords()
	.catch(e => {
		console.error('❌ Ошибка:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})

