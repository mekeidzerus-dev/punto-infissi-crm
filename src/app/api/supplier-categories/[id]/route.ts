import { prisma } from '@/lib/prisma'
import { ApiError, success, withApiHandler } from '@/lib/api-handler'
import { ensureSupplierCategoryId } from '../helpers'

export const GET = withApiHandler(async (_request, { params }) => {
	const id = ensureSupplierCategoryId(params?.id as string)

	const supplierCategory = await prisma.supplierProductCategory.findUnique({
		where: { id },
		include: {
			supplier: true,
			category: true,
		},
	})

	if (!supplierCategory) {
		throw new ApiError(404, 'Supplier category not found')
	}

	return success(supplierCategory)
})

export const DELETE = withApiHandler(async (_request, { params }) => {
	const id = ensureSupplierCategoryId(params?.id as string)

	const existingSupplierCategory = await prisma.supplierProductCategory.findUnique({
		where: { id },
	})

	if (!existingSupplierCategory) {
		throw new ApiError(404, 'Supplier category not found')
	}

	const usedInProposals = await prisma.proposalPosition.findFirst({
		where: { supplierCategoryId: id },
	})

	if (usedInProposals) {
		throw new ApiError(
			400,
			'Невозможно удалить связь: она используется в предложениях. Сначала удалите все связанные позиции.'
		)
	}

	await prisma.supplierProductCategory.delete({
		where: { id },
	})

	return success({ success: true })
})
