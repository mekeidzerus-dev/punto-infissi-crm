import { z } from 'zod'

export const logoUploadSchema = z.object({
	file: z.instanceof(File),
})
