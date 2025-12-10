import { prisma } from '@/lib/prisma'
import { ApiError } from '@/lib/api-handler'
import { Prisma } from '@prisma/client'
import {
	supplierParameterOverrideCreateSchema,
	supplierParameterOverrideUpdateSchema,
	type SupplierParameterOverrideCreateInput,
	type SupplierParameterOverrideUpdateInput,
} from '@/lib/validation/supplier-parameter-override'

export const supplierParameterOverrideCreateBodySchema =
	supplierParameterOverrideCreateSchema
export const supplierParameterOverrideUpdateBodySchema =
	supplierParameterOverrideUpdateSchema

const toNullableJson = (
	value: SupplierParameterOverrideCreateInput['customValues']
): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue => {
	if (value === null || value === undefined) {
		return Prisma.JsonNull
	}
	return value as Prisma.InputJsonValue
}

export function ensureSupplierId(value: string | null): number {
	if (!value) {
		throw new ApiError(400, 'supplierId is required')
	}
	const parsed = Number(value)
	if (!Number.isInteger(parsed) || parsed <= 0) {
		throw new ApiError(400, 'supplierId must be a positive integer')
	}
	return parsed
}

export async function ensureSupplierExists(id: number) {
	const supplier = await prisma.supplier.findUnique({ where: { id } })
	if (!supplier) {
		throw new ApiError(404, 'Supplier not found')
	}
}

export async function ensureParameterExists(parameterId: string) {
	const parameter = await prisma.parameterTemplate.findUnique({
		where: { id: parameterId },
	})

	if (!parameter) {
		throw new ApiError(404, 'Parameter not found')
	}
}

export async function ensureNoDuplicateOverride(
	supplierId: number,
	parameterId: string
) {
	const existing = await prisma.supplierParameterOverride.findFirst({
		where: { supplierId, parameterId },
	})

	if (existing) {
		throw new ApiError(400, 'Override for this parameter already exists')
	}
}

export function buildSupplierParameterOverrideCreateData(
	supplierId: number,
	input: SupplierParameterOverrideCreateInput
): Prisma.SupplierParameterOverrideCreateInput {
	return {
		supplier: { connect: { id: supplierId } },
		parameter: { connect: { id: input.parameterId } },
		customValues: toNullableJson(input.customValues ?? null),
		minValue: input.minValue ?? null,
		maxValue: input.maxValue ?? null,
		isAvailable: input.isAvailable ?? true,
	}
}

export function buildSupplierParameterOverrideUpdateData(
	input: SupplierParameterOverrideUpdateInput
): Prisma.SupplierParameterOverrideUpdateInput {
	const data: Prisma.SupplierParameterOverrideUpdateInput = {}

	if (input.customValues !== undefined)
		data.customValues = toNullableJson(input.customValues ?? null)
	if (input.minValue !== undefined) data.minValue = input.minValue ?? null
	if (input.maxValue !== undefined) data.maxValue = input.maxValue ?? null
	if (input.isAvailable !== undefined) data.isAvailable = input.isAvailable ?? true

	return data
}

export function ensureOverrideId(value: string | null): string {
	if (!value) {
		throw new ApiError(400, 'id is required')
	}
	const trimmed = value.trim()
	if (!trimmed) {
		throw new ApiError(400, 'id must be non-empty string')
	}
	return trimmed
}

export function ensureOverrideIdFromParams(
	params?: Record<string, string | string[]>
): string {
	const raw = params?.id
	const value = Array.isArray(raw) ? raw[0] ?? null : raw ?? null
	return ensureOverrideId(value)
}
