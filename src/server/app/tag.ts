import { createRouter } from '@/server/modules/tag/router'
import { createService } from '@/server/modules/tag/service'
import { getTagCollection } from '../lib/mongodb'

export const tagService = createService({ getTagCollection })

export const tagRouter = createRouter({ service: tagService })