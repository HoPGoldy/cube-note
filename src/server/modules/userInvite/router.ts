import Router from 'koa-router'
import { AppKoaContext } from '@/types/global'
import { response } from '@/server/utils'
import { UserInviteService } from './service'

interface Props {
    service: UserInviteService
}

export const createRouter = (props: Props) => {
    const { service } = props
    const router = new Router<any, AppKoaContext>({ prefix: '/userInvite' })

    router.post('/addInvite', async ctx => {
        const resp = await service.addInvite()
        response(ctx, resp)
    })

    router.get('/getInviteList', async ctx => {
        const resp = await service.getInviteList()
        response(ctx, resp)
    })

    router.post('/delete/:id', async ctx => {
        const { id } = ctx.params

        const resp = await service.deleteInvite(Number(id))
        response(ctx, resp)
    })

    return router
}