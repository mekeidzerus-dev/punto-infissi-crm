'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function AcceptInvitePage() {
	const params = useParams()
	const router = useRouter()
	const token = params.token as string

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [name, setName] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [isValidating, setIsValidating] = useState(true)
	const [errors, setErrors] = useState<Record<string, string>>({})

	useEffect(() => {
		// Проверяем токен при загрузке страницы
		const validateToken = async () => {
			try {
				// Можно добавить endpoint для проверки токена, но пока просто показываем форму
				setIsValidating(false)
			} catch (error) {
				toast.error('Invalid or expired invitation')
				router.push('/auth/signin')
			}
		}

		if (token) {
			validateToken()
		}
	}, [token, router])

	const validatePassword = (pwd: string): string | null => {
		if (pwd.length < 8) {
			return 'Password must be at least 8 characters'
		}
		if (!/[a-zA-Z]/.test(pwd)) {
			return 'Password must contain at least one letter'
		}
		if (!/[0-9]/.test(pwd)) {
			return 'Password must contain at least one number'
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
			const response = await fetch('/api/auth/accept-invite', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token, email, password, name: name || undefined }),
			})

			const data = await response.json()

			if (!response.ok) {
				toast.error(data.error || 'Failed to accept invitation')
				if (data.details) {
					setErrors(data.details)
				}
				return
			}

			toast.success('Account created! Signing in...')

			// Автоматически входим после регистрации
			const result = await signIn('credentials', {
				email,
				password,
				redirect: false,
			})

			if (result?.error) {
				toast.error('Account created but sign in failed. Please try signing in.')
				router.push('/auth/signin')
			} else {
				router.push('/clients')
				router.refresh()
			}
		} catch (error) {
			toast.error('An error occurred. Please try again.')
		} finally {
			setIsLoading(false)
		}
	}

	if (isValidating) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gray-50'>
				<div className='text-center'>
					<p className='text-gray-600'>Validating invitation...</p>
				</div>
			</div>
		)
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
			<div className='w-full max-w-md'>
				<div className='bg-white rounded-lg shadow-md p-8'>
					<div className='text-center mb-8'>
						<h1 className='text-3xl font-bold text-red-600 mb-2'>MODOCRM</h1>
						<p className='text-gray-600'>Accept invitation and create your account</p>
					</div>

					<form onSubmit={handleSubmit} className='space-y-4'>
						<div>
							<Label htmlFor='name'>Name (optional)</Label>
							<Input
								id='name'
								type='text'
								value={name}
								onChange={(e) => setName(e.target.value)}
								disabled={isLoading}
								placeholder='Your name'
							/>
						</div>

						<div>
							<Label htmlFor='email'>Email</Label>
							<Input
								id='email'
								type='email'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								disabled={isLoading}
								placeholder='your@email.com'
								aria-invalid={errors.email ? 'true' : 'false'}
							/>
							{errors.email && <p className='text-sm text-red-600 mt-1'>{errors.email}</p>}
						</div>

						<div>
							<Label htmlFor='password'>Password</Label>
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
								placeholder='••••••••'
								aria-invalid={errors.password ? 'true' : 'false'}
							/>
							{errors.password && <p className='text-sm text-red-600 mt-1'>{errors.password}</p>}
							<p className='text-xs text-gray-500 mt-1'>
								Must be at least 8 characters with letters and numbers
							</p>
						</div>

						<Button type='submit' className='w-full' disabled={isLoading}>
							{isLoading ? 'Creating account...' : 'Accept Invitation'}
						</Button>
					</form>

					<div className='mt-6 text-center'>
						<p className='text-sm text-gray-600'>
							Already have an account?{' '}
							<a href='/auth/signin' className='text-red-600 hover:underline font-medium'>
								Sign in
							</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

