import { NextRequest, NextResponse } from 'next/server'
import { ZodError, type ZodSchema } from 'zod'
import { Prisma } from '@prisma/client'
import { logger } from '@/lib/logger'

export type ApiHandlerContext = { params?: Record<string, string | string[]> }
export type ApiHandler = (
	request: NextRequest,
	context: ApiHandlerContext
) => Promise<NextResponse>

export class ApiError extends Error {
	constructor(
		public status: number,
		message: string,
		public details?: unknown
	) {
		super(message)
	}
}

const prismaErrorStatusMap: Record<string, number> = {
	P2002: 409, // Unique constraint failed
	P2025: 404, // Record not found
}

function toJsonResponse(
	message: string,
	status: number,
	details?: unknown
): NextResponse {
	return NextResponse.json(
		{
			error: message,
			details: details ?? null,
		},
		{ status }
	)
}

export function withApiHandler(handler: ApiHandler) {
	return async (request: NextRequest, context: ApiHandlerContext) => {
		try {
			return await handler(request, context)
		} catch (error: unknown) {
			if (error instanceof ApiError) {
				const log =
					error.status >= 500
						? logger.error.bind(logger)
						: logger.warn.bind(logger)
				log(
					`API error: ${error.message}`,
					error.details as Record<string, unknown> | undefined
				)
				return toJsonResponse(error.message, error.status, error.details)
			}

			if (error instanceof ZodError) {
				logger.warn('Validation failed', error.flatten())
				return toJsonResponse('Validation error', 400, error.flatten())
			}

			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				const status = prismaErrorStatusMap[error.code] ?? 400
				logger.error('Prisma known error', error)
				return toJsonResponse('Database error', status, {
					code: error.code,
					meta: error.meta,
				})
			}

			logger.error('Unhandled API error', error)
			// В dev режиме показываем детали ошибки
			const errorDetails =
				process.env.NODE_ENV === 'development' && error instanceof Error
					? {
							message: error.message,
							stack: error.stack?.split('\n').slice(0, 5).join('\n'),
							name: error.name,
					  }
					: undefined
			return toJsonResponse('Internal server error', 500, errorDetails)
		}
	}
}

export async function parseJson<T>(
	request: NextRequest,
	schema: ZodSchema<T>
): Promise<T> {
	let body: unknown

	try {
		body = await request.json()
	} catch (error) {
		if (error instanceof SyntaxError) {
			throw new ApiError(400, 'Invalid JSON body', { cause: 'invalid_json' })
		}
		throw error
	}

	if (
		body === null ||
		(typeof body === 'object' && Object.keys(body as object).length === 0)
	) {
		throw new ApiError(400, 'Request body cannot be empty')
	}

	return schema.parse(body)
}

export function json(data: unknown, init?: number | ResponseInit) {
	if (typeof init === 'number') {
		return NextResponse.json(data, { status: init })
	}
	return NextResponse.json(data, init)
}

export function success(data: unknown, status = 200) {
	return json(data, status)
}
