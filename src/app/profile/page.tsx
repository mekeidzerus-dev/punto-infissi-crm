'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Building2, Save, ArrowLeft, Clock, Calendar, Shield, CheckCircle2, XCircle } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

export default function ProfilePage() {
	const { data: session, update } = useSession()
	const router = useRouter()
	const { locale } = useLanguage()
	const [isLoading, setIsLoading] = useState(false)
	const [name, setName] = useState('')
	const [organization, setOrganization] = useState<{ id: string; name: string } | null>(null)
	const [profileData, setProfileData] = useState<{
		createdAt?: string
		lastLoginAt?: string
		lastActivityAt?: string
		emailVerified?: string | null
	} | null>(null)

	useEffect(() => {
		if (session?.user) {
			setName(session.user.name || '')
			fetchProfileData()
		}
		if (session?.user?.organizationId) {
			fetchOrganization()
		}
	}, [session])

	const fetchProfileData = async () => {
		try {
			const response = await fetch('/api/user/profile')
			if (response.ok) {
				const data = await response.json()
				setProfileData({
					createdAt: data.createdAt,
					lastLoginAt: data.lastLoginAt,
					lastActivityAt: data.lastActivityAt,
					emailVerified: data.emailVerified,
				})
			}
		} catch (error) {
			logger.error('Error fetching profile data:', error)
		}
	}

	const fetchOrganization = async () => {
		try {
			const response = await fetch(`/api/organization`)
			if (response.ok) {
				const data = await response.json()
				setOrganization({ id: data.id, name: data.name })
			}
		} catch (error) {
			logger.error('Error fetching organization:', error)
		}
	}

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)

		try {
			const response = await fetch('/api/user/profile', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name }),
			})

			if (response.ok) {
				await update() // Обновляем сессию
				toast.success(
					locale === 'ru' ? 'Профиль успешно обновлен' : 'Profilo aggiornato con successo',
					{ duration: 2000 }
				)
			} else {
				const error = await response.json()
				toast.error(error.error || (locale === 'ru' ? 'Ошибка обновления' : 'Errore aggiornamento'))
			}
		} catch (error) {
			logger.error('Error updating profile:', error)
			toast.error(locale === 'ru' ? 'Ошибка при сохранении' : 'Errore durante il salvataggio')
		} finally {
			setIsLoading(false)
		}
	}

	if (!session?.user) {
		return null
	}

	const roleLabels: Record<string, { ru: string; it: string }> = {
		admin: { ru: 'Администратор', it: 'Amministratore' },
		user: { ru: 'Пользователь', it: 'Utente' },
	}

	const roleLabel = session.user.role
		? roleLabels[session.user.role]?.[locale] || session.user.role
		: locale === 'ru' ? 'Пользователь' : 'Utente'

	return (
		<AppLayout>
			<div className='space-y-6'>
				<div className='flex items-center justify-between'>
					<div>
						<h1 className='text-3xl font-bold text-gray-900'>
							{locale === 'ru' ? 'Профиль пользователя' : 'Profilo utente'}
						</h1>
						<p className='text-gray-600 mt-1'>
							{locale === 'ru'
								? 'Управление данными вашего профиля'
								: 'Gestisci i dati del tuo profilo'}
						</p>
					</div>
					<Button variant='outline' onClick={() => router.back()}>
						<ArrowLeft className='h-4 w-4 mr-2' />
						{locale === 'ru' ? 'Назад' : 'Indietro'}
					</Button>
				</div>

				<div className='grid gap-6 md:grid-cols-2'>
					{/* Основная информация */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<User className='h-5 w-5' />
								{locale === 'ru' ? 'Основная информация' : 'Informazioni principali'}
							</CardTitle>
							<CardDescription>
								{locale === 'ru'
									? 'Измените данные вашего профиля'
									: 'Modifica i dati del tuo profilo'}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSave} className='space-y-4'>
								{/* Аватар */}
								<div className='flex items-center gap-4 mb-4'>
									<div className='w-20 h-20 rounded-full bg-red-600 flex items-center justify-center text-white text-2xl font-medium'>
										{session.user.name?.[0]?.toUpperCase() ||
											session.user.email?.[0]?.toUpperCase() ||
											'U'}
									</div>
									<div className='flex-1'>
										<p className='text-sm font-medium text-gray-900'>
											{session.user.name || 'User'}
										</p>
										<p className='text-xs text-gray-500'>{session.user.email}</p>
									</div>
								</div>

								<div>
									<Label htmlFor='email'>
										{locale === 'ru' ? 'Email' : 'Email'}
									</Label>
									<div className='flex items-center gap-2 mt-1'>
										<Input
											id='email'
											type='email'
											value={session.user.email || ''}
											disabled
											className='bg-gray-50 flex-1'
										/>
										{profileData?.emailVerified ? (
											<Badge variant='outline' className='bg-green-50 text-green-700 border-green-200'>
												<CheckCircle2 className='h-3 w-3 mr-1' />
												{locale === 'ru' ? 'Подтвержден' : 'Verificato'}
											</Badge>
										) : (
											<Badge variant='outline' className='bg-yellow-50 text-yellow-700 border-yellow-200'>
												<XCircle className='h-3 w-3 mr-1' />
												{locale === 'ru' ? 'Не подтвержден' : 'Non verificato'}
											</Badge>
										)}
									</div>
									<p className='text-xs text-gray-500 mt-1'>
										{locale === 'ru'
											? 'Email нельзя изменить'
											: 'Email non può essere modificato'}
									</p>
								</div>

								<div>
									<Label htmlFor='name'>
										{locale === 'ru' ? 'Имя' : 'Nome'}
									</Label>
									<Input
										id='name'
										type='text'
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder={locale === 'ru' ? 'Ваше имя' : 'Il tuo nome'}
										disabled={isLoading}
									/>
								</div>

								<div>
									<Label>
										{locale === 'ru' ? 'Роль' : 'Ruolo'}
									</Label>
									<div className='mt-1 flex items-center gap-2'>
										<Badge variant='outline' className='text-sm'>
											<Shield className='h-3 w-3 mr-1' />
											{roleLabel}
										</Badge>
									</div>
									<p className='text-xs text-gray-500 mt-1'>
										{locale === 'ru'
											? 'Роль определяется администратором'
											: 'Il ruolo è determinato dall\'amministratore'}
									</p>
								</div>

								<Button type='submit' disabled={isLoading} className='w-full'>
									<Save className='h-4 w-4 mr-2' />
									{isLoading
										? locale === 'ru'
											? 'Сохранение...'
											: 'Salvataggio...'
										: locale === 'ru'
										? 'Сохранить'
										: 'Salva'}
								</Button>
							</form>
						</CardContent>
					</Card>

					{/* Информация об организации */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Building2 className='h-5 w-5' />
								{locale === 'ru' ? 'Организация' : 'Organizzazione'}
							</CardTitle>
							<CardDescription>
								{locale === 'ru'
									? 'Информация об организации'
									: 'Informazioni sull\'organizzazione'}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='space-y-4'>
								{organization ? (
									<>
										<div>
											<Label>
												{locale === 'ru' ? 'Название организации' : 'Nome organizzazione'}
											</Label>
											<Input
												value={organization.name}
												disabled
												className='bg-gray-50 mt-1'
											/>
										</div>
										<div>
											<Label>
												{locale === 'ru' ? 'ID организации' : 'ID organizzazione'}
											</Label>
											<Input
												value={organization.id}
												disabled
												className='bg-gray-50 mt-1 font-mono text-xs'
											/>
										</div>
									</>
								) : (
									<p className='text-sm text-gray-500'>
										{locale === 'ru'
											? 'Загрузка информации об организации...'
											: 'Caricamento informazioni organizzazione...'}
									</p>
								)}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Дополнительная информация */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<Clock className='h-5 w-5' />
							{locale === 'ru' ? 'Активность и статистика' : 'Attività e statistiche'}
						</CardTitle>
						<CardDescription>
							{locale === 'ru'
								? 'Информация о вашей активности в системе'
								: 'Informazioni sulla tua attività nel sistema'}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='grid gap-4 md:grid-cols-2'>
							{profileData?.createdAt && (
								<div className='flex items-start gap-3'>
									<Calendar className='h-5 w-5 text-gray-400 mt-0.5' />
									<div>
										<Label className='text-xs text-gray-500'>
											{locale === 'ru' ? 'Дата регистрации' : 'Data di registrazione'}
										</Label>
										<p className='text-sm font-medium'>
											{new Date(profileData.createdAt).toLocaleDateString(
												locale === 'ru' ? 'ru-RU' : 'it-IT',
												{
													year: 'numeric',
													month: 'long',
													day: 'numeric',
												}
											)}
										</p>
									</div>
								</div>
							)}
							{profileData?.lastLoginAt && (
								<div className='flex items-start gap-3'>
									<Clock className='h-5 w-5 text-gray-400 mt-0.5' />
									<div>
										<Label className='text-xs text-gray-500'>
											{locale === 'ru' ? 'Последний вход' : 'Ultimo accesso'}
										</Label>
										<p className='text-sm font-medium'>
											{new Date(profileData.lastLoginAt).toLocaleDateString(
												locale === 'ru' ? 'ru-RU' : 'it-IT',
												{
													year: 'numeric',
													month: 'long',
													day: 'numeric',
													hour: '2-digit',
													minute: '2-digit',
												}
											)}
										</p>
									</div>
								</div>
							)}
							{profileData?.lastActivityAt && (
								<div className='flex items-start gap-3'>
									<Clock className='h-5 w-5 text-gray-400 mt-0.5' />
									<div>
										<Label className='text-xs text-gray-500'>
											{locale === 'ru' ? 'Последняя активность' : 'Ultima attività'}
										</Label>
										<p className='text-sm font-medium'>
											{new Date(profileData.lastActivityAt).toLocaleDateString(
												locale === 'ru' ? 'ru-RU' : 'it-IT',
												{
													year: 'numeric',
													month: 'long',
													day: 'numeric',
													hour: '2-digit',
													minute: '2-digit',
												}
											)}
										</p>
									</div>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</AppLayout>
	)
}

