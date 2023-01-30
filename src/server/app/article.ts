import { createRouter } from '@/server/modules/article/router'
import { createService } from '@/server/modules/article/service'
import { db } from './database'

export const articleService = createService({ db })

export const articleRouter = createRouter({ service: articleService })