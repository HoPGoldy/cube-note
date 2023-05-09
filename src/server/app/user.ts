import { createRouter } from '@/server/modules/user/router'
import { createService } from '@/server/modules/user/service'
import { createToken } from '@/server/lib/auth'
import { secretFile } from '@/server/lib/replayAttackDefense'
import { loginLocker } from './LoginLocker'
import { articleService } from './article'
import { db } from './database'
import { userInviteService } from './userInvite'


export const userService = createService({
    loginLocker,
    createToken: createToken,
    getReplayAttackSecret: secretFile.read,
    db,
    addArticle: articleService.addArticle,
    finishUserInvite: userInviteService.userRegister,
})

export const userRouter = createRouter({ service: userService })