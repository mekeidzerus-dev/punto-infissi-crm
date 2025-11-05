/**
 * Production-ready logger with structured logging
 * Best practices:
 * - No recursion (uses console directly)
 * - Structured logging in production (JSON for log aggregation)
 * - Human-readable in development
 * - Proper error handling
 * - Performance optimized
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
	[key: string]: unknown
}

interface LogEntry {
	timestamp: string
	level: LogLevel
	message: string
	context?: LogContext
	error?: {
		message: string
		stack?: string
		name?: string
	}
}

const isProduction = process.env.NODE_ENV === 'production'
const isDevelopment = !isProduction

/**
 * Safe stringify that handles circular references and errors
 */
function safeStringify(obj: unknown): string {
	const seen = new WeakSet()

	try {
		return JSON.stringify(
			obj,
			(key, value) => {
				if (typeof value === 'object' && value !== null) {
					if (seen.has(value)) {
						return '[Circular]'
					}
					seen.add(value)
				}

				// Handle Error objects
				if (value instanceof Error) {
					return {
						name: value.name,
						message: value.message,
						stack: value.stack,
					}
				}

				return value
			},
			2
		)
	} catch (error) {
		return `[Stringify Error: ${error}]`
	}
}

/**
 * Format error for logging
 */
function formatError(error: unknown): LogEntry['error'] | undefined {
	if (!error) return undefined

	if (error instanceof Error) {
		return {
			name: error.name,
			message: error.message,
			stack: error.stack,
		}
	}

	if (typeof error === 'object' && error !== null) {
		const errorObj = error as Error
		return {
			message: errorObj.message || String(error),
			stack: errorObj.stack,
			name: errorObj.name,
		}
	}

	return {
		message: String(error),
	}
}

/**
 * Create structured log entry
 */
function createLogEntry(
	level: LogLevel,
	message: string,
	context?: LogContext,
	error?: unknown
): LogEntry {
	const entry: LogEntry = {
		timestamp: new Date().toISOString(),
		level,
		message,
	}

	if (context && Object.keys(context).length > 0) {
		entry.context = context
	}

	if (error) {
		entry.error = formatError(error)
	}

	return entry
}

/**
 * Logger implementation following best practices
 */
export const logger = {
	/**
	 * Debug level - detailed information for debugging
	 */
	debug: (message: string, context?: LogContext) => {
		if (isDevelopment) {
			console.debug(`🔍 ${message}`, context || '')
		} else if (process.env.LOG_LEVEL === 'debug') {
			const entry = createLogEntry('debug', message, context)
			console.debug(JSON.stringify(entry))
		}
	},

	/**
	 * Info level - general informational messages
	 */
	info: (message: string, context?: LogContext) => {
		if (isProduction) {
			const entry = createLogEntry('info', message, context)
			console.log(JSON.stringify(entry))
		} else {
			console.log(`✅ ${message}`, context || '')
		}
	},

	/**
	 * Warn level - warning messages for unexpected situations
	 */
	warn: (message: string, context?: LogContext) => {
		if (isProduction) {
			const entry = createLogEntry('warn', message, context)
			console.warn(JSON.stringify(entry))
		} else {
			console.warn(`⚠️  ${message}`, context || '')
		}
	},

	/**
	 * Error level - error messages with optional error object
	 */
	error: (message: string, error?: unknown, context?: LogContext) => {
		if (isProduction) {
			const entry = createLogEntry('error', message, context, error)
			console.error(JSON.stringify(entry))
		} else {
			console.error(`❌ ${message}`, error || context || '')
		}
	},

	/**
	 * Performance timing helper
	 */
	time: (label: string) => {
		if (isDevelopment && console.time) {
			console.time(label)
		}
	},

	/**
	 * Performance timing end helper
	 */
	timeEnd: (label: string) => {
		if (isDevelopment && console.timeEnd) {
			console.timeEnd(label)
		}
	},

	/**
	 * Create a child logger with additional context
	 */
	child: (context: LogContext) => {
		return {
			debug: (message: string, ctx?: LogContext) =>
				logger.debug(message, { ...context, ...ctx }),
			info: (message: string, ctx?: LogContext) =>
				logger.info(message, { ...context, ...ctx }),
			warn: (message: string, ctx?: LogContext) =>
				logger.warn(message, { ...context, ...ctx }),
			error: (message: string, error?: unknown, ctx?: LogContext) =>
				logger.error(message, error, { ...context, ...ctx }),
		}
	},
}

// Export for testing
export type { LogLevel, LogContext, LogEntry }
