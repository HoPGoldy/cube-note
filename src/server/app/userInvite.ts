import { createRouter } from '@/server/modules/userInvite/router'
import { createService } from '@/server/modules/userInvite/service'
import { db } from './database'

export const userInviteService = createService({ db })

export const userInviteRouter = createRouter({ service: userInviteService })