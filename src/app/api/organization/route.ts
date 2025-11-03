import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// GET - получить настройки организации
export async function GET() {
	try {
		// Получаем первую (и единственную) организацию
		const organization = await prisma.organization.findFirst({
			include: {
				settings: true,
			},
		})

		if (!organization) {
			// Создаем дефолтную организацию, если её нет
			const newOrg = await prisma.organization.create({
				data: {
					name: 'PUNTO INFISSI',
					slug: 'punto-infissi',
					logoUrl: null,
					faviconUrl: null,
					primaryColor: '#dc2626',
					currency: 'EUR',
					timezone: 'Europe/Rome',
					language: 'it',
				},
				include: {
					settings: true,
				},
			})

			logger.info('✅ Created default organization')
			return NextResponse.json(newOrg)
		}

		return NextResponse.json(organization)
	} catch (error) {
		logger.error('❌ Error fetching organization:', error)
		return NextResponse.json(
			{
				error: 'Failed to fetch organization',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		)
	}
}

// PUT - обновить настройки организации
export async function PUT(request: NextRequest) {
	try {
		const body = await request.json()
		const { name, logoUrl, faviconUrl, primaryColor, phone, email, address, currency } = body

		// Получаем существующую организацию
		const existing = await prisma.organization.findFirst()

		if (!existing) {
			// Создаем новую организацию
			const newOrg = await prisma.organization.create({
				data: {
					name: name || 'PUNTO INFISSI',
					slug: 'punto-infissi',
					logoUrl: logoUrl || null,
					faviconUrl: faviconUrl || null,
					primaryColor: primaryColor || '#dc2626',
					phone: phone || null,
					email: email || null,
					address: address || null,
					currency: currency || 'EUR',
					timezone: 'Europe/Rome',
					language: 'it',
				},
			})

			logger.info('✅ Created new organization')
			return NextResponse.json(newOrg)
		}

		// Обновляем существующую организацию
		const updated = await prisma.organization.update({
			where: { id: existing.id },
			data: {
				...(name && { name }),
				...(logoUrl !== undefined && { logoUrl: logoUrl || null }),
				...(faviconUrl !== undefined && { faviconUrl: faviconUrl || null }),
				...(primaryColor && { primaryColor }),
				...(phone !== undefined && { phone: phone || null }),
				...(email !== undefined && { email: email || null }),
				...(address !== undefined && { address: address || null }),
				...(currency && { currency }),
			},
		})

		logger.info('✅ Updated organization:', updated.name)
		return NextResponse.json(updated)
	} catch (error) {
		logger.error('❌ Error updating organization:', error)
		return NextResponse.json(
			{
				error: 'Failed to update organization',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		)
	}
}

