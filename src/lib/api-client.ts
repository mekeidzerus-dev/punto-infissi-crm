/**
 * Профессиональный API клиент для авторизованных запросов
 *
 * Особенности:
 * - Автоматическая передача credentials
 * - Централизованная обработка ошибок
 * - Типизация ответов
 * - Retry логика для сетевых ошибок
 * - Обработка истечения сессии
 * - Единая точка конфигурации
 */

import { logger } from './logger'

export interface ApiClientOptions extends RequestInit {
	skipAuth?: boolean
	retries?: number
	retryDelay?: number
}

export interface ApiResponse<T = unknown> {
	data: T
	status: number
	ok: boolean
}

export class ApiError extends Error {
	constructor(
		public status: number,
		message: string,
		public details?: unknown
	) {
		super(message)
		this.name = 'ApiError'
	}
}

class ApiClient {
	private baseUrl: string
	private defaultOptions: ApiClientOptions

	constructor(baseUrl = '') {
		this.baseUrl = baseUrl
		this.defaultOptions = {
			credentials: 'include' as RequestCredentials,
			headers: {
				'Content-Type': 'application/json',
			},
			retries: 1,
			retryDelay: 300,
		}
	}

	/**
	 * Выполняет запрос с retry логикой
	 */
	private async request<T = unknown>(
		url: string,
		options: ApiClientOptions = {}
	): Promise<ApiResponse<T>> {
		const {
			retries = this.defaultOptions.retries,
			retryDelay = this.defaultOptions.retryDelay,
			skipAuth = false,
			...fetchOptions
		} = options

		const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`
		const requestOptions: RequestInit = {
			...this.defaultOptions,
			...fetchOptions,
			headers: {
				...this.defaultOptions.headers,
				...fetchOptions.headers,
			},
		}

		// Если skipAuth, убираем credentials
		if (skipAuth) {
			delete requestOptions.credentials
		}

		let lastError: Error | null = null

		for (let attempt = 0; attempt <= retries!; attempt++) {
			try {
				const response = await fetch(fullUrl, requestOptions)

				// Обработка истечения сессии
				if (response.status === 401 && !skipAuth) {
					// Перенаправляем на страницу входа только если это не публичный API
					if (typeof window !== 'undefined' && !url.includes('/auth/')) {
						window.location.href =
							'/auth/signin?callbackUrl=' +
							encodeURIComponent(window.location.pathname)
						throw new ApiError(401, 'Session expired')
					}
				}

				// Определяем тип ответа
				const contentType = response.headers.get('content-type')
				const isJson = contentType?.includes('application/json')
				let data: unknown = null

				if (isJson) {
					data = await response.json().catch(() => null)
				} else {
					const text = await response.text().catch(() => '')
					// Пытаемся распарсить как JSON, если не получилось - возвращаем текст
					try {
						data = text ? JSON.parse(text) : null
					} catch {
						data = text || null
					}
				}

				if (!response.ok) {
					const errorData = data as {
						error?: string
						message?: string
						details?: unknown
					} | null
					const errorMessage =
						errorData?.error || errorData?.message || `HTTP ${response.status}`
					throw new ApiError(response.status, errorMessage, errorData?.details)
				}

				return {
					data: data as T,
					status: response.status,
					ok: response.ok,
				}
			} catch (error) {
				lastError = error as Error

				// Retry только для сетевых ошибок и 5xx ошибок
				if (
					attempt < retries! &&
					(error instanceof TypeError ||
						(error instanceof ApiError && error.status >= 500))
				) {
					await new Promise(resolve =>
						setTimeout(resolve, retryDelay! * (attempt + 1))
					)
					continue
				}

				// Если это ApiError, пробрасываем дальше
				if (error instanceof ApiError) {
					throw error
				}

				// Для других ошибок логируем и пробрасываем
				logger.error('API request failed', {
					url: fullUrl,
					attempt: attempt + 1,
					error: error instanceof Error ? error.message : String(error),
				})
				throw error
			}
		}

		throw lastError || new Error('Request failed after retries')
	}

	/**
	 * GET запрос
	 */
	async get<T = unknown>(url: string, options?: ApiClientOptions): Promise<T> {
		const response = await this.request<T>(url, { ...options, method: 'GET' })
		return response.data
	}

	/**
	 * POST запрос
	 */
	async post<T = unknown>(
		url: string,
		data?: unknown,
		options?: ApiClientOptions
	): Promise<T> {
		const isFormData = data instanceof FormData
		const requestOptions: ApiClientOptions = {
			...options,
			method: 'POST',
			body: isFormData ? data : data ? JSON.stringify(data) : undefined,
		}

		// Для FormData не устанавливаем Content-Type (браузер установит автоматически с boundary)
		if (isFormData) {
			requestOptions.headers = {
				...options?.headers,
			}
			// Удаляем Content-Type из дефолтных заголовков для FormData
			delete (requestOptions.headers as Record<string, string>)['Content-Type']
		}

		const response = await this.request<T>(url, requestOptions)
		return response.data
	}

	/**
	 * PUT запрос
	 */
	async put<T = unknown>(
		url: string,
		data?: unknown,
		options?: ApiClientOptions
	): Promise<T> {
		const isFormData = data instanceof FormData
		const requestOptions: ApiClientOptions = {
			...options,
			method: 'PUT',
			body: isFormData ? data : data ? JSON.stringify(data) : undefined,
		}

		// Для FormData не устанавливаем Content-Type (браузер установит автоматически с boundary)
		if (isFormData) {
			requestOptions.headers = {
				...options?.headers,
			}
			// Удаляем Content-Type из дефолтных заголовков для FormData
			delete (requestOptions.headers as Record<string, string>)['Content-Type']
		}

		const response = await this.request<T>(url, requestOptions)
		return response.data
	}

	/**
	 * DELETE запрос
	 */
	async delete<T = unknown>(
		url: string,
		data?: unknown,
		options?: ApiClientOptions
	): Promise<T> {
		const isFormData = data instanceof FormData
		const requestOptions: ApiClientOptions = {
			...options,
			method: 'DELETE',
			body: isFormData ? data : data ? JSON.stringify(data) : undefined,
		}

		// Для FormData не устанавливаем Content-Type
		if (isFormData) {
			requestOptions.headers = {
				...options?.headers,
			}
			delete (requestOptions.headers as Record<string, string>)['Content-Type']
		} else if (data) {
			// Для JSON body устанавливаем Content-Type
			requestOptions.headers = {
				'Content-Type': 'application/json',
				...options?.headers,
			}
		}

		const response = await this.request<T>(url, requestOptions)
		return response.data
	}

	/**
	 * PATCH запрос
	 */
	async patch<T = unknown>(
		url: string,
		data?: unknown,
		options?: ApiClientOptions
	): Promise<T> {
		const response = await this.request<T>(url, {
			...options,
			method: 'PATCH',
			body: data ? JSON.stringify(data) : undefined,
		})
		return response.data
	}
}

// Экспортируем singleton instance
export const apiClient = new ApiClient()

// Экспортируем класс для тестирования
export { ApiClient }
