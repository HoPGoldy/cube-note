import { createRouter } from '@/server/modules/article/router'
import { createService } from '@/server/modules/article/service'
import { getArticleCollection } from '../lib/mongodb'

export const articleService = createService({ getArticleCollection })

export const articleRouter = createRouter({ service: articleService })