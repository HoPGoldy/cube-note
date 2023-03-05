import { createRouter } from '@/server/modules/article/router'
import { createService } from '@/server/modules/article/service'
import { sqlDb } from './database'

export const articleService = createService({ db: sqlDb })

export const articleRouter = createRouter({ service: articleService })