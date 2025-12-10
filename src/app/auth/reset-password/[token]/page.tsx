'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function ResetPasswordPage() {
	const router = useRouter()
	const params = useParams()
	const token = params.token as string

	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [verifying, setVerifying] = useState(true)
	const [valid, setValid] = useState(false)
	const [email, setEmail] = useState('')

	useEffect(() => {
		// Проверяем валидность токена при загрузке
		const verifyToken = async () => {
			try {
				const response = await fetch(
					`/api/auth/verify-reset-token/${token}`
				)
				const data = await response.json()

				if (!response.ok) {
					throw new Error(data.error || 'Invalid token')
				}

				setValid(true)
				setEmail(data.email)
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: 'Invalid or expired token'
				)
				setValid(false)
			} finally {
				setVerifying(false)
			}
		}

		if (token) {
			verifyToken()
		}
	}, [token])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (password !== confirmPassword) {
			toast.error('Passwords do not match')
			return
		}

		if (password.length < 8) {
			toast.error('Password must be at least 8 characters')
			return
		}

		if (!/[a-zA-Z]/.test(password)) {
			toast.error('Password must contain at least one letter')
			return
		}

		if (!/[0-9]/.test(password)) {
			toast.error('Password must contain at least one number')
			return
		}

		setLoading(true)

		try {
			const response = await fetch('/api/auth/reset-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token, password }),
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Failed to reset password')
			}

			toast.success('Password has been reset successfully')

			// Перенаправляем на страницу входа
			setTimeout(() => {
				router.push('/auth/signin')
			}, 2000)
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : 'An error occurred'
			)
		} finally {
			setLoading(false)
		}
	}

	if (verifying) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<p className="text-gray-600">Verifying token...</p>
				</div>
			</div>
		)
	}

	if (!valid) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="w-full max-w-md space-y-4 rounded-lg bg-white p-8 shadow text-center">
					<h2 className="text-2xl font-bold text-red-600">
						Invalid or Expired Token
					</h2>
					<p className="text-gray-600">
						This password reset link is invalid or has expired. Please
						request a new one.
					</p>
					<Link href="/auth/forgot-password">
						<Button>Request New Link</Button>
					</Link>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
			<div className="w-full max-w-md">
				<div className="bg-white rounded-lg shadow-md p-8">
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold text-red-600 mb-2">
							MODOCRM
						</h1>
						<h2 className="text-2xl font-bold">Reset Password</h2>
						<p className="mt-2 text-sm text-gray-600">
							Enter your new password for {email}
						</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<Label htmlFor="password">New Password</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								disabled={loading}
								minLength={8}
								placeholder="Enter new password"
							/>
							<p className="mt-1 text-xs text-gray-500">
								Must be at least 8 characters with letters and numbers
							</p>
						</div>

						<div>
							<Label htmlFor="confirmPassword">
								Confirm Password
							</Label>
							<Input
								id="confirmPassword"
								type="password"
								value={confirmPassword}
								onChange={(e) =>
									setConfirmPassword(e.target.value)
								}
								required
								disabled={loading}
								minLength={8}
								placeholder="Confirm new password"
							/>
						</div>

						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? 'Resetting...' : 'Reset Password'}
						</Button>
					</form>

					<div className="mt-6 text-center">
						<Link
							href="/auth/signin"
							className="text-red-600 hover:underline font-medium text-sm"
						>
							Back to Sign In
						</Link>
					</div>
				</div>
			</div>
		</div>
	)
}

