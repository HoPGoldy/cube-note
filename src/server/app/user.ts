import { createRouter } from '@/server/modules/user/router'
import { createService } from '@/server/modules/user/service'
import { createToken } from '@/server/lib/auth'
import { getReplayAttackSecret } from '@/server/lib/replayAttackDefense'
import { loginLocker } from './LoginLocker'
import { articleService } from './article'
import { sqlDb } from './database'


export const userService = createService({
    loginLocker,
    createToken: createToken,
    getReplayAttackSecret,
    db: sqlDb,
    addArticle: articleService.addArticle
})

export const userRouter = createRouter({ service: userService })