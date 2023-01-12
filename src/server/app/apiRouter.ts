import Router from 'koa-router'
import { authRouter, loginLocker } from './auth'
import { globalRouter } from './global'
import { AppKoaContext } from '@/types/global'
import { middlewareJwt, middlewareJwtCatcher } from '../lib/auth'
import { createCheckReplayAttack } from '../lib/security'
import { OPEN_API } from '@/config'

export const createApiRouter = () => {
    const routes = [globalRouter, authRouter]
    const apiRouter = new Router<unknown, AppKoaContext>()

    apiRouter
        .use(loginLocker.createCheckLoginDisable({ excludePath: ['/global'] }))
        .use(createCheckReplayAttack({ excludePath: OPEN_API }))
        .use(middlewareJwtCatcher)
        .use(middlewareJwt.unless({ path: OPEN_API }))

    routes.forEach(route => apiRouter.use('/api', route.routes(), route.allowedMethods()))

    return apiRouter
}
