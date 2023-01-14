import { createRouter } from '../modules/global/router'
import { createService } from '../modules/global/service'
import { DEFAULT_COLOR } from '@/constants'
import { getUserCollection } from '../lib/mongodb'

export const globalService = createService({
    mainColor: DEFAULT_COLOR,
    getUserCollection,
})

export const globalRouter = createRouter({
    service: globalService
})