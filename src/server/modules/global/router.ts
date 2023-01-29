import Router from 'koa-router'
import { AppKoaContext } from '@/types/global'
import { response } from '@/server/utils'
import { GlobalService } from './service'

interface Props {
    service: GlobalService
}

export const createRouter = (props: Props) => {
    const { service } = props
    const router = new Router<any, AppKoaContext>()

    /**
     * 获取全局应用配置
     * 该接口不需要鉴权
     */
    router.get('/global', async ctx => {
        const data = await service.getAppConfig()
        response(ctx, { code: 200, data })
    })

    router.get('/userDataInfo', async ctx => {
        const username = ctx.state?.user?.username
        const data = await service.getUserDataInfo(username)
        response(ctx, data)
    })

    return router
}