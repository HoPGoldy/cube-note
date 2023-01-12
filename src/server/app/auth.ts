import { createRouter } from '../modules/auth/router'
import { createService } from '../modules/auth/service'
import { getAppStorage, getCertificateCollection, saveLoki, updateAppStorage } from '@/server/lib/loki'
import { createOTP, createToken } from '@/server/lib/auth'
import { createLoginLock, getReplayAttackSecret } from '@/server/lib/security'
import { CertificateDetail } from '@/types/app'
import { setAlias } from './routeAlias'
import { groupService } from './group'

export const loginLocker = createLoginLock()

export const authService = createService({
    createOTP,
    saveData: saveLoki,
    getAppStorage,
    updateAppStorage,
    loginLocker,
    createToken: createToken,
    getReplayAttackSecret,
    getCertificateGroupList: groupService.getCertificateGroupList,
    getAllCertificate: async () => {
        const collection = await getCertificateCollection()
        return collection.chain().data()
    },
    updateCertificate: async (certificates: CertificateDetail[]) => {
        const collection = await getCertificateCollection()
        collection.update(certificates)
    }
})

export const authRouter = createRouter({
    service: authService,
    setAlias
})