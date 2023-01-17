import Router from 'koa-router'
import { AppKoaContext } from '@/types/global'
import { response } from '@/server/utils'
import { TagService } from './service'
import { validate } from '@/server/utils'
import Joi from 'joi'

interface Props {
    service: TagService
}

export const createRouter = (props: Props) => {
    const { service } = props
    const router = new Router<any, AppKoaContext>({ prefix: '/article' })

    const addSchema = Joi.object<{ title: string }>({
        title: Joi.string().required()
    })

    // 添加标签
    router.post('/add', async ctx => {
        const body = validate(ctx, addSchema)
        if (!body) return
        const { title } = body

        const resp = await service.addTag(title)
        response(ctx, resp)
    })

    // 删除标签
    router.delete('/remove/:id', async ctx => {
        const body = validate(ctx, addSchema)
        if (!body) return
        const { title } = body

        const resp = await service.removeTag(title)
        response(ctx, resp)
    })

    // 查询标签列表（不分页）
    router.get('/list', async ctx => {
        const resp = await service.getTagList()
        response(ctx, resp)
    })

    return router
}