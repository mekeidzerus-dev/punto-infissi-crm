'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useLanguage } from '@/contexts/LanguageContext'

export default function SignInPage() {
	const router = useRouter()
	const { locale } = useLanguage()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [isLoading, setIsLoading] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)

		// #region agent log
		fetch('http://127.0.0.1:7242/ingest/218ca7f0-e3d7-4389-a1b6-4602048211d4', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				location: 'signin/page.tsx:19',
				message: 'SignIn form submitted',
				data: { email },
				timestamp: Date.now(),
				sessionId: 'debug-session',
				runId: 'run1',
				hypothesisId: 'A',
			}),
		}).catch(() => {})
		// #endregion

		try {
			const result = await signIn('credentials', {
				email,
				password,
				redirect: false,
			})

			// #region agent log
			fetch(
				'http://127.0.0.1:7242/ingest/218ca7f0-e3d7-4389-a1b6-4602048211d4',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						location: 'signin/page.tsx:28',
						message: 'SignIn result received',
						data: {
							hasError: !!result?.error,
							error: result?.error,
							ok: result?.ok,
						},
						timestamp: Date.now(),
						sessionId: 'debug-session',
						runId: 'run1',
						hypothesisId: 'B',
					}),
				}
			).catch(() => {})
			// #endregion

			if (result?.error) {
				toast.error(
					locale === 'ru'
						? 'Неверный email или пароль'
						: 'Email o password non validi'
				)
			} else {
				toast.success(
					locale === 'ru' ? 'Успешный вход в систему' : 'Accesso riuscito'
				)
				// Ждем немного чтобы сессия установилась, затем делаем полный редирект
				setTimeout(() => {
					window.location.href = '/clients'
				}, 100)
			}
		} catch (error) {
			// #region agent log
			fetch(
				'http://127.0.0.1:7242/ingest/218ca7f0-e3d7-4389-a1b6-4602048211d4',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						location: 'signin/page.tsx:45',
						message: 'SignIn error caught',
						data: {
							error: error instanceof Error ? error.message : String(error),
						},
						timestamp: Date.now(),
						sessionId: 'debug-session',
						runId: 'run1',
						hypothesisId: 'A',
					}),
				}
			).catch(() => {})
			// #endregion
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
		subtitle: locale === 'ru' ? 'Вход в систему' : 'Accedi al tuo account',
		email: locale === 'ru' ? 'Email' : 'Email',
		password: locale === 'ru' ? 'Пароль' : 'Password',
		signIn: locale === 'ru' ? 'Войти' : 'Accedi',
		signingIn: locale === 'ru' ? 'Вход...' : 'Accesso in corso...',
		forgotPassword:
			locale === 'ru' ? 'Забыли пароль?' : 'Password dimenticata?',
		noAccount: locale === 'ru' ? 'Нет аккаунта?' : 'Non hai un account?',
		signUp: locale === 'ru' ? 'Зарегистрироваться' : 'Registrati',
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
							<Label htmlFor='email'>{t.email}</Label>
							<Input
								id='email'
								type='email'
								value={email}
								onChange={e => setEmail(e.target.value)}
								required
								disabled={isLoading}
								placeholder={t.emailPlaceholder}
							/>
						</div>

						<div>
							<Label htmlFor='password'>{t.password}</Label>
							<Input
								id='password'
								type='password'
								value={password}
								onChange={e => setPassword(e.target.value)}
								required
								disabled={isLoading}
								placeholder={t.passwordPlaceholder}
							/>
						</div>

						<Button type='submit' className='w-full' disabled={isLoading}>
							{isLoading ? t.signingIn : t.signIn}
						</Button>
					</form>

					<div className='mt-6 space-y-2 text-center'>
						<p className='text-sm'>
							<a
								href='/auth/forgot-password'
								className='text-red-600 hover:underline font-medium'
							>
								{t.forgotPassword}
							</a>
						</p>
						<p className='text-sm text-gray-600'>
							{t.noAccount}{' '}
							<a
								href='/auth/signup'
								className='text-red-600 hover:underline font-medium'
							>
								{t.signUp}
							</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
