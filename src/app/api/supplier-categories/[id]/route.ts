import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE - удалить связь поставщик-категория
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params
		console.log(`🗑️ Deleting supplier category: ${id}`)

		// Проверяем что связь существует
		const existingSupplierCategory =
			await prisma.supplierProductCategory.findUnique({
				where: { id },
			})

		if (!existingSupplierCategory) {
			console.log(`❌ Supplier category not found: ${id}`)
			return NextResponse.json(
				{ error: 'Supplier category not found' },
				{ status: 404 }
			)
		}

		// Проверяем, используется ли связь в предложениях
		const usedInProposals = await prisma.proposalPosition.findFirst({
			where: { supplierCategoryId: id },
		})

		if (usedInProposals) {
			console.log(`⚠️ Cannot delete: supplier category is used in proposals`)
			return NextResponse.json(
				{
					error:
						'Невозможно удалить связь: она используется в предложениях. Сначала удалите все связанные позиции.',
				},
				{ status: 400 }
			)
		}

		// Удаляем связь
		await prisma.supplierProductCategory.delete({
			where: { id },
		})

		console.log(`✅ Deleted supplier category: ${id}`)
		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('❌ Error deleting supplier category:', error)
		return NextResponse.json(
			{ error: 'Failed to delete supplier category' },
			{ status: 500 }
		)
	}
}
