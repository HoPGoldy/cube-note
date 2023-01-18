import { createRouter } from '@/server/modules/user/router'
import { createService } from '@/server/modules/user/service'
import { createToken } from '@/server/lib/auth'
import { getReplayAttackSecret } from '@/server/lib/replayAttackDefense'
import { loginLocker } from './LoginLocker'
import { getUserCollection, getUserStorage, updateUserStorage } from '../lib/mongodb'
import { articleService } from './article'


export const userService = createService({
    loginLocker,
    createToken: createToken,
    getReplayAttackSecret,
    getUserStorage,
    updateUserStorage,
    getUserCollection,
    addArticle: articleService.addArticle
})

export const userRouter = createRouter({ service: userService })