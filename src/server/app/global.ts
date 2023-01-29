import { createRouter } from '../modules/global/router'
import { createService } from '../modules/global/service'
import { DEFAULT_COLOR } from '@/constants'
import { getUserCollection, getArticleCollection, getUserStorage } from '../lib/mongodb'
import { getAppConfig } from '../lib/appConfig'

export const globalService = createService({
    mainColor: DEFAULT_COLOR,
    getUserCollection,
    getConfig: getAppConfig,
    getArticleCollection,
    getUserStorage
})

export const globalRouter = createRouter({
    service: globalService
})