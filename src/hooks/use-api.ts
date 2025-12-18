/**
 * React hook для работы с API
 * Предоставляет удобный интерфейс для компонентов
 */

import { useState, useCallback } from 'react'
import { apiClient, ApiError } from '@/lib/api-client'
import { logger } from '@/lib/logger'

interface UseApiOptions {
	onSuccess?: (data: unknown) => void
	onError?: (error: ApiError) => void
	skipInitialLoad?: boolean
}

export function useApi<T = unknown>(endpoint: string, options: UseApiOptions = {}) {
	const [data, setData] = useState<T | null>(null)
	const [isLoading, setIsLoading] = useState(!options.skipInitialLoad)
	const [error, setError] = useState<ApiError | null>(null)

	const execute = useCallback(
		async (method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET', body?: unknown) => {
			setIsLoading(true)
			setError(null)

			try {
				let result: T

				switch (method) {
					case 'GET':
						result = await apiClient.get<T>(endpoint)
						break
					case 'POST':
						result = await apiClient.post<T>(endpoint, body)
						break
					case 'PUT':
						result = await apiClient.put<T>(endpoint, body)
						break
					case 'DELETE':
						result = await apiClient.delete<T>(endpoint)
						break
					case 'PATCH':
						result = await apiClient.patch<T>(endpoint, body)
						break
				}

				setData(result)
				options.onSuccess?.(result)
				return result
			} catch (err) {
				const apiError = err instanceof ApiError ? err : new ApiError(500, 'Unknown error')
				setError(apiError)
				options.onError?.(apiError)
				logger.error('API request failed', { endpoint, error: apiError })
				throw apiError
			} finally {
				setIsLoading(false)
			}
		},
		[endpoint, options]
	)

	const refetch = useCallback(() => execute('GET'), [execute])

	return {
		data,
		isLoading,
		error,
		execute,
		refetch,
		setData,
	}
}

