import Router from 'koa-router'
import { globalRouter } from './global'
import { AppKoaContext } from '@/types/global'
import { middlewareJwt, middlewareJwtCatcher } from '../lib/auth'
import { createCheckReplayAttack } from '../lib/replayAttackDefense'
import { AUTH_EXCLUDE, REPLAY_ATTACK_EXCLUDE } from '@/config'
import { loginLocker } from './LoginLocker'
import { userRouter } from './user'

export const createApiRouter = () => {
    const routes = [globalRouter, userRouter]
    const apiRouter = new Router<unknown, AppKoaContext>()

    apiRouter
        .use(loginLocker.checkLoginDisable)
        .use(createCheckReplayAttack({ excludePath: REPLAY_ATTACK_EXCLUDE }))
        .use(middlewareJwtCatcher)
        .use(middlewareJwt.unless({ path: AUTH_EXCLUDE }))

    routes.forEach(route => apiRouter.use('/api', route.routes(), route.allowedMethods()))

    return apiRouter
}
