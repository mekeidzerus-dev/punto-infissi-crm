/**
 * Удаление всех пользователей и создание одного тестового пользователя
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const TEST_USER = {
	email: 'test@modocrm.com',
	name: 'Test User',
	password: 'Test123456',
	role: 'admin' as const,
}

async function resetUsers() {
	console.log('🔄 Сброс пользователей...\n')

	try {
		// Удаляем связанные данные в правильном порядке
		console.log('🧹 Удаление связанных данных...')
		
		await prisma.passwordResetToken.deleteMany()
		await prisma.invitation.deleteMany()
		await prisma.account.deleteMany()
		await prisma.session.deleteMany()
		
		// Удаляем всех пользователей
		console.log('🗑️  Удаление всех пользователей...')
		const deletedCount = await prisma.user.deleteMany()
		console.log(`   Удалено пользователей: ${deletedCount.count}`)

		// Создаем тестового пользователя
		console.log('\n👤 Создание тестового пользователя...')
		const hashedPassword = await bcrypt.hash(TEST_USER.password, 10)
		
		const testUser = await prisma.user.create({
			data: {
				email: TEST_USER.email,
				name: TEST_USER.name,
				password: hashedPassword,
				role: TEST_USER.role,
				emailVerified: new Date(),
			},
		})

		console.log('✅ Тестовый пользователь создан!\n')
		console.log('='.repeat(60))
		console.log('📝 УЧЕТНЫЕ ДАННЫЕ ДЛЯ ВХОДА:')
		console.log('='.repeat(60))
		console.log(`\n📧 Email: ${TEST_USER.email}`)
		console.log(`🔑 Пароль: ${TEST_USER.password}`)
		console.log(`👤 Имя: ${TEST_USER.name}`)
		console.log(`🎭 Роль: ${TEST_USER.role}`)
		console.log(`\n🌐 URL для входа:`)
		console.log(`   http://localhost:3000/auth/signin`)
		console.log('\n' + '='.repeat(60))
	} catch (error: any) {
		console.error('❌ Ошибка:', error.message)
		process.exit(1)
	}
}

resetUsers()
	.catch(e => {
		console.error('❌ Ошибка:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})

