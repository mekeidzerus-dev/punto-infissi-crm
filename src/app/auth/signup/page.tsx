'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useLanguage } from '@/contexts/LanguageContext'
import { validatePassword as validatePasswordUtil } from '@/lib/validation/password'

export default function SignUpPage() {
	const router = useRouter()
	const { locale } = useLanguage()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [name, setName] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [errors, setErrors] = useState<Record<string, string>>({})

	const validatePassword = (pwd: string): string | null => {
		const result = validatePasswordUtil(pwd, locale)
		if (!result.valid) {
			return result.errors[0] || (locale === 'ru' ? 'Неверный пароль' : 'Password non valida')
		}
		return null
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setErrors({})

		const passwordError = validatePassword(password)
		if (passwordError) {
			setErrors({ password: passwordError })
			return
		}

		setIsLoading(true)

		try {
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password, name: name || undefined }),
			})

			const data = await response.json()

			if (!response.ok) {
				toast.error(
					data.error || (locale === 'ru' ? 'Ошибка регистрации' : 'Errore di registrazione')
				)
				if (data.details) {
					setErrors(data.details)
				}
				return
			}

			toast.success(
				locale === 'ru'
					? 'Аккаунт успешно создан! Вход в систему...'
					: 'Account creato con successo! Accesso in corso...'
			)

			// Автоматически входим после регистрации
			const result = await signIn('credentials', {
				email,
				password,
				redirect: false,
			})

			if (result?.error) {
				toast.error(
					locale === 'ru'
						? 'Аккаунт создан, но вход не удался. Попробуйте войти вручную.'
						: 'Account creato ma accesso fallito. Prova ad accedere manualmente.'
				)
				router.push('/auth/signin')
			} else {
				router.push('/clients')
				router.refresh()
			}
		} catch (error) {
			toast.error(
				locale === 'ru'
					? 'Произошла ошибка. Попробуйте снова.'
					: 'Si è verificato un errore. Riprova.'
			)
		} finally {
			setIsLoading(false)
		}
	}

	const t = {
		title: locale === 'ru' ? 'MODOCRM' : 'MODOCRM',
		subtitle: locale === 'ru' ? 'Создать аккаунт' : 'Crea il tuo account',
		name: locale === 'ru' ? 'Имя' : 'Nome',
		nameOptional: locale === 'ru' ? 'Имя (необязательно)' : 'Nome (opzionale)',
		email: locale === 'ru' ? 'Email' : 'Email',
		password: locale === 'ru' ? 'Пароль' : 'Password',
		signUp: locale === 'ru' ? 'Зарегистрироваться' : 'Registrati',
		creating: locale === 'ru' ? 'Создание аккаунта...' : 'Creazione account...',
		alreadyHave: locale === 'ru' ? 'Уже есть аккаунт?' : 'Hai già un account?',
		signIn: locale === 'ru' ? 'Войти' : 'Accedi',
		passwordHint: locale === 'ru'
			? 'Минимум 8 символов, должны быть буквы и цифры'
			: 'Minimo 8 caratteri, devono contenere lettere e numeri',
		namePlaceholder: locale === 'ru' ? 'Ваше имя' : 'Il tuo nome',
		emailPlaceholder: locale === 'ru' ? 'your@email.com' : 'your@email.com',
		passwordPlaceholder: locale === 'ru' ? '••••••••' : '••••••••',
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
			<div className='w-full max-w-md'>
				<div className='bg-white rounded-lg shadow-md p-8'>
					<div className='text-center mb-8'>
						<h1 className='text-3xl font-bold text-red-600 mb-2'>{t.title}</h1>
						<p className='text-gray-600'>{t.subtitle}</p>
					</div>

					<form onSubmit={handleSubmit} className='space-y-4'>
						<div>
							<Label htmlFor='name'>{t.nameOptional}</Label>
							<Input
								id='name'
								type='text'
								value={name}
								onChange={(e) => setName(e.target.value)}
								disabled={isLoading}
								placeholder={t.namePlaceholder}
							/>
						</div>

						<div>
							<Label htmlFor='email'>{t.email}</Label>
							<Input
								id='email'
								type='email'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								disabled={isLoading}
								placeholder={t.emailPlaceholder}
								aria-invalid={errors.email ? 'true' : 'false'}
							/>
							{errors.email && <p className='text-sm text-red-600 mt-1'>{errors.email}</p>}
						</div>

						<div>
							<Label htmlFor='password'>{t.password}</Label>
							<Input
								id='password'
								type='password'
								value={password}
								onChange={(e) => {
									setPassword(e.target.value)
									if (errors.password) {
										setErrors({ ...errors, password: '' })
									}
								}}
								required
								disabled={isLoading}
								placeholder={t.passwordPlaceholder}
								aria-invalid={errors.password ? 'true' : 'false'}
							/>
							{errors.password && <p className='text-sm text-red-600 mt-1'>{errors.password}</p>}
							<p className='text-xs text-gray-500 mt-1'>{t.passwordHint}</p>
						</div>

						<Button type='submit' className='w-full' disabled={isLoading}>
							{isLoading ? t.creating : t.signUp}
						</Button>
					</form>

					<div className='mt-6 text-center'>
						<p className='text-sm text-gray-600'>
							{t.alreadyHave}{' '}
							<a href='/auth/signin' className='text-red-600 hover:underline font-medium'>
								{t.signIn}
							</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

