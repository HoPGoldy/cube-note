import { createRouter } from '@/server/modules/tag/router'
import { createService } from '@/server/modules/tag/service'
import { db } from './database'

export const tagService = createService({ db })

export const tagRouter = createRouter({ service: tagService })