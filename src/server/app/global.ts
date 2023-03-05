import { createRouter } from '../modules/global/router'
import { createService } from '../modules/global/service'
import { getAppConfig } from '../lib/appConfig'
import { sqlDb } from './database'

export const globalService = createService({
    getConfig: getAppConfig,
    db: sqlDb
})

export const globalRouter = createRouter({
    service: globalService
})