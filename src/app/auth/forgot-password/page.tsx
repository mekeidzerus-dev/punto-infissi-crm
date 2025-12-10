'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Copy, Check } from 'lucide-react'

export default function ForgotPasswordPage() {
	const router = useRouter()
	const [email, setEmail] = useState('')
	const [loading, setLoading] = useState(false)
	const [resetToken, setResetToken] = useState<string | null>(null)
	const [copied, setCopied] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setResetToken(null)

		try {
			const response = await fetch('/api/auth/forgot-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email }),
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Failed to send reset email')
			}

			// Если токен возвращен (email сервис не настроен), показываем его
			if (data.token) {
				setResetToken(data.token)
				toast.success('Password reset token generated. Use the link below to reset your password.')
			} else {
				// Если токен не возвращен, значит email сервис настроен
				toast.success(
					'If the email exists, a password reset link has been sent.'
				)
				// Перенаправляем на страницу входа только если нет токена
				setTimeout(() => {
					router.push('/auth/signin')
				}, 2000)
			}
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : 'An error occurred'
			)
		} finally {
			setLoading(false)
		}
	}

	const copyToClipboard = async () => {
		if (resetToken) {
			await navigator.clipboard.writeText(resetToken)
			setCopied(true)
			toast.success('Token copied to clipboard!')
			setTimeout(() => setCopied(false), 2000)
		}
	}

	const resetLink = resetToken
		? `${window.location.origin}/auth/reset-password/${resetToken}`
		: null

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
			<div className="w-full max-w-md">
				<div className="bg-white rounded-lg shadow-md p-8">
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold text-red-600 mb-2">
							MODOCRM
						</h1>
						<h2 className="text-2xl font-bold">Forgot Password</h2>
						<p className="mt-2 text-sm text-gray-600">
							Enter your email address and we will send you a link
							to reset your password.
						</p>
					</div>

					{!resetToken ? (
						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									disabled={loading}
									placeholder="your@email.com"
								/>
							</div>

							<Button type="submit" className="w-full" disabled={loading}>
								{loading ? 'Sending...' : 'Send Reset Link'}
							</Button>
						</form>
					) : (
						<div className="space-y-4">
							<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
								<p className="text-sm font-medium text-yellow-800 mb-2">
									🔧 Development Mode
								</p>
								<p className="text-xs text-yellow-700 mb-4">
									Email service is not configured. Use the token below to reset your password.
								</p>

								{/* Ссылка для сброса пароля */}
								<div className="mb-4">
									<Label className="text-xs text-gray-600 mb-1 block">
										Reset Link:
									</Label>
									<div className="flex gap-2">
										<Input
											value={resetLink || ''}
											readOnly
											className="text-xs font-mono"
										/>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={copyToClipboard}
											className="shrink-0"
										>
											{copied ? (
												<Check className="h-4 w-4" />
											) : (
												<Copy className="h-4 w-4" />
											)}
										</Button>
									</div>
									<Button
										asChild
										className="w-full mt-2"
									>
										<Link href={`/auth/reset-password/${resetToken}`}>
											Go to Reset Password Page
										</Link>
									</Button>
								</div>

								{/* Токен */}
								<div>
									<Label className="text-xs text-gray-600 mb-1 block">
										Reset Token:
									</Label>
									<div className="flex gap-2">
										<Input
											value={resetToken}
											readOnly
											className="text-xs font-mono"
										/>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={copyToClipboard}
											className="shrink-0"
										>
											{copied ? (
												<Check className="h-4 w-4" />
											) : (
												<Copy className="h-4 w-4" />
											)}
										</Button>
									</div>
								</div>
							</div>

							<Button
								variant="outline"
								className="w-full"
								onClick={() => {
									setResetToken(null)
									setEmail('')
								}}
							>
								Request Another Token
							</Button>
						</div>
					)}

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

