import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const type = searchParams.get('type') // privacy_policy, sales_terms, warranty

		console.log('🔍 Fetching document templates...')

		const templates = await prisma.documentTemplate.findMany({
			where: {
				isActive: true,
				...(type && { type }),
			},
			orderBy: [
				{ isDefault: 'desc' }, // Сначала дефолтные
				{ createdAt: 'desc' },
			],
		})

		console.log(`✅ Found ${templates.length} document templates`)
		return NextResponse.json(templates)
	} catch (error) {
		console.error('❌ Error fetching document templates:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch document templates', details: String(error) },
			{ status: 500 }
		)
	}
}

export async function POST(request: NextRequest) {
	try {
		console.log('📝 Creating document template...')

		const body = await request.json()
		const { name, type, contentRu, contentIt, isDefault } = body

		if (!name || !type) {
			return NextResponse.json(
				{ error: 'Name and type are required' },
				{ status: 400 }
			)
		}

		if (!contentRu && !contentIt) {
			return NextResponse.json(
				{ error: 'At least one language content is required' },
				{ status: 400 }
			)
		}

		// Если устанавливаем как дефолтный, снимаем дефолт с других шаблонов того же типа
		if (isDefault) {
			await prisma.documentTemplate.updateMany({
				where: { type, isDefault: true },
				data: { isDefault: false },
			})
		}

		const template = await prisma.documentTemplate.create({
			data: {
				name,
				type,
				contentRu,
				contentIt,
				isDefault: isDefault || false,
			},
		})

		console.log(`✅ Created document template: ${template.name}`)
		return NextResponse.json(template, { status: 201 })
	} catch (error) {
		console.error('❌ Error creating document template:', error)
		return NextResponse.json(
			{ error: 'Failed to create document template', details: String(error) },
			{ status: 500 }
		)
	}
}
