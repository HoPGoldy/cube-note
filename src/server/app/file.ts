import { createRouter } from '@/server/modules/file/router'
import { createService } from '@/server/modules/file/service'
import { db } from './database'
import { getStoragePath } from '../lib/fileAccessor'

export const fileService = createService({
    getSaveDir: getStoragePath,
    db
})

export const fileRouter = createRouter({ service: fileService })