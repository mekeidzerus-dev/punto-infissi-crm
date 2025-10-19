import { NextRequest, NextResponse } from 'next/server'
import { FEATURE_FLAGS, isFeatureEnabled } from '@/lib/feature-flags'

export async function GET(request: NextRequest) {
	try {
		const featureStatus = {}

		Object.entries(FEATURE_FLAGS).forEach(([key, value]) => {
			featureStatus[key] = {
				enabled: value,
				status: value ? '✅ ВКЛЮЧЕНА' : '❌ ОТКЛЮЧЕНА',
			}
		})

		return NextResponse.json({
			message: 'Feature Flags Status',
			features: featureStatus,
			instructions: {
				enable:
					'Создайте файл .env.local с NEXT_PUBLIC_PRODUCT_VISUALIZATION=true',
				restart: 'Перезапустите сервер: npm run dev',
				test: 'Откройте http://localhost:3000/proposals и создайте предложение',
			},
		})
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to get feature flags status' },
			{ status: 500 }
		)
	}
}
