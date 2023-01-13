import { createRouter } from '@/server/modules/user/router'
import { createService } from '@/server/modules/user/service'
import { createToken } from '@/server/lib/auth'
import { getReplayAttackSecret } from '@/server/lib/replayAttackDefense'
import { loginLocker } from './LoginLocker'
import { getUserStorage, updateUserStorage } from '../lib/mongodb'


export const userService = createService({
    loginLocker,
    createToken: createToken,
    getReplayAttackSecret,
    getUserStorage,
    updateUserStorage,
})

export const userRouter = createRouter({ service: userService })