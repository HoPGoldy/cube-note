import { STORAGE_PATH } from '@/config'
import { createRouter } from '@/server/modules/file/router'
import { createService } from '@/server/modules/file/service'

export const fileService = createService({ uploadTempDir: STORAGE_PATH })

export const fileRouter = createRouter({ service: fileService })