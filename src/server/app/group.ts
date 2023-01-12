import { createRouter } from '../modules/group/router'
import { createService } from '../modules/group/service'
import { getAppStorage, getCertificateCollection, getGroupCollection, saveLoki, updateAppStorage } from '@/server/lib/loki'
import { createOTP, createToken } from '@/server/lib/auth'
import { setAlias } from './routeAlias'

export const groupService = createService({
    createOTP,
    saveData: saveLoki,
    getCertificateCollection,
    getGroupCollection,
    getAppStorage,
    updateAppStorage,
    createToken
})

export const groupRouter = createRouter({
    service: groupService,
    setAlias
})