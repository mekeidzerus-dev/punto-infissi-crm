import { z } from 'zod'

export const faviconUploadSchema = z.object({
	file: z.instanceof(File),
})

export const faviconDeleteSchema = z.object({})
