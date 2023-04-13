import { createRouter } from '../modules/global/router'
import { createService } from '../modules/global/service'
import { getAppConfig } from '../lib/fileAccessor'
import { db } from './database'

export const globalService = createService({
    getConfig: getAppConfig,
    db
})

export const globalRouter = createRouter({
    service: globalService
})