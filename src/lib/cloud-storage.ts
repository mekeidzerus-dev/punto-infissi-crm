/**
 * Cloud Storage Integration (AWS S3 / CloudFlare R2)
 *
 * Для использования установите:
 * npm install @aws-sdk/client-s3
 *
 * Переменные окружения (.env):
 * CLOUD_STORAGE_ENABLED=true
 * CLOUD_STORAGE_PROVIDER=s3  # или r2
 * AWS_REGION=us-east-1
 * AWS_ACCESS_KEY_ID=your-key
 * AWS_SECRET_ACCESS_KEY=your-secret
 * S3_BUCKET=your-bucket-name
 * CDN_URL=https://cdn.example.com  # опционально
 */

interface CloudStorageConfig {
	enabled: boolean
	provider: 's3' | 'r2' | 'local'
	region: string
	bucket: string
	cdnUrl?: string
}

export function getCloudStorageConfig(): CloudStorageConfig {
	return {
		enabled: process.env.CLOUD_STORAGE_ENABLED === 'true',
		provider: (process.env.CLOUD_STORAGE_PROVIDER as any) || 'local',
		region: process.env.AWS_REGION || 'us-east-1',
		bucket: process.env.S3_BUCKET || '',
		cdnUrl: process.env.CDN_URL,
	}
}

export async function uploadToCloudStorage(
	buffer: Buffer,
	fileName: string,
	contentType: string
): Promise<{ success: boolean; url?: string; error?: string }> {
	const config = getCloudStorageConfig()

	if (!config.enabled) {
		return {
			success: false,
			error: 'Cloud storage не включен. Используйте локальное хранилище.',
		}
	}

	if (config.provider === 's3' || config.provider === 'r2') {
		try {
			// Динамический импорт для опциональной зависимости
			const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')

			const s3Client = new S3Client({
				region: config.region,
				credentials: {
					accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
					secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
				},
				// Для CloudFlare R2
				...(config.provider === 'r2' && {
					endpoint: process.env.R2_ENDPOINT,
				}),
			})

			const key = `favicons/${fileName}`

			await s3Client.send(
				new PutObjectCommand({
					Bucket: config.bucket,
					Key: key,
					Body: buffer,
					ContentType: contentType,
					ACL: 'public-read',
					CacheControl: 'public, max-age=31536000, immutable',
				})
			)

			const url = config.cdnUrl
				? `${config.cdnUrl}/${key}`
				: `https://${config.bucket}.s3.${config.region}.amazonaws.com/${key}`

			return {
				success: true,
				url,
			}
		} catch (error) {
			console.error('Ошибка загрузки в S3:', error)
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Ошибка загрузки в cloud storage',
			}
		}
	}

	return {
		success: false,
		error: `Неподдерживаемый провайдер: ${config.provider}`,
	}
}

export async function deleteFromCloudStorage(
	fileName: string
): Promise<{ success: boolean; error?: string }> {
	const config = getCloudStorageConfig()

	if (!config.enabled) {
		return {
			success: false,
			error: 'Cloud storage не включен',
		}
	}

	if (config.provider === 's3' || config.provider === 'r2') {
		try {
			const { S3Client, DeleteObjectCommand } = await import(
				'@aws-sdk/client-s3'
			)

			const s3Client = new S3Client({
				region: config.region,
				credentials: {
					accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
					secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
				},
				...(config.provider === 'r2' && {
					endpoint: process.env.R2_ENDPOINT,
				}),
			})

			await s3Client.send(
				new DeleteObjectCommand({
					Bucket: config.bucket,
					Key: `favicons/${fileName}`,
				})
			)

			return { success: true }
		} catch (error) {
			console.error('Ошибка удаления из S3:', error)
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Ошибка удаления из cloud storage',
			}
		}
	}

	return {
		success: false,
		error: `Неподдерживаемый провайдер: ${config.provider}`,
	}
}

/**
 * Проверка подключения к cloud storage
 */
export async function testCloudStorageConnection(): Promise<{
	success: boolean
	error?: string
}> {
	const config = getCloudStorageConfig()

	if (!config.enabled) {
		return { success: true } // Локальное хранилище всегда доступно
	}

	try {
		const { S3Client, HeadBucketCommand } = await import('@aws-sdk/client-s3')

		const s3Client = new S3Client({
			region: config.region,
			credentials: {
				accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
				secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
			},
			...(config.provider === 'r2' && {
				endpoint: process.env.R2_ENDPOINT,
			}),
		})

		await s3Client.send(
			new HeadBucketCommand({
				Bucket: config.bucket,
			})
		)

		return { success: true }
	} catch (error) {
		console.error('Ошибка подключения к cloud storage:', error)
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: 'Не удалось подключиться к cloud storage',
		}
	}
}


