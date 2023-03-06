import { createRouter } from '@/server/modules/file/router'
import { createService } from '@/server/modules/file/service'
import { getStoragePath } from '../utils'
import { db } from './database'

export const fileService = createService({ saveDir: getStoragePath(), db })

export const fileRouter = createRouter({ service: fileService })