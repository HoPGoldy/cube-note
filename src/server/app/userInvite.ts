import { createRouter } from '@/server/modules/userManage/router'
import { createService } from '@/server/modules/userManage/service'
import { db } from './database'
import { banLocker } from './LoginLocker'

export const userInviteService = createService({
    db,
    // 封禁中间件那边有缓存，所以这边状态更新后需要刷掉缓存
    onUserBanned: (data) => banLocker.clearBanCache(data.userId),
})

export const userInviteRouter = createRouter({ service: userInviteService })