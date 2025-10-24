'use client'

import { DashboardLayoutStickerV2 } from '@/components/dashboard-layout-sticker-v2'
import { ProductCategoriesManager } from '@/components/product-categories-manager'

export default function CategoriesPage() {
	return (
		<DashboardLayoutStickerV2 hideTopNav={true}>
			<div className='space-y-6'>
				<div className='flex items-center gap-2 mb-6'>
					<h1 className='text-2xl font-bold text-gray-900'>Категории продуктов</h1>
					<span className='text-sm text-gray-500'>Управление категориями товаров</span>
				</div>
				
				<ProductCategoriesManager />
			</div>
		</DashboardLayoutStickerV2>
	)
}
