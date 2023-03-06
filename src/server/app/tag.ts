import { createRouter } from '@/server/modules/tag/router'
import { createService } from '@/server/modules/tag/service'
import { sqlDb } from './database'

export const tagService = createService({ db: sqlDb })

export const tagRouter = createRouter({ service: tagService })