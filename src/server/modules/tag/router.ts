import Router from 'koa-router'
import { AppKoaContext } from '@/types/global'
import { response } from '@/server/utils'
import { TagService } from './service'
import { validate } from '@/server/utils'
import Joi from 'joi'
import { TagStorage, TagUpdateReqData } from '@/types/tag'

interface Props {
    service: TagService
}

export const createRouter = (props: Props) => {
    const { service } = props
    const router = new Router<any, AppKoaContext>({ prefix: '/tag' })

    const addSchema = Joi.object<TagStorage>({
        title: Joi.string().required(),
        color: Joi.string().required(),
        groupId: Joi.string().allow(null),
    })

    // 添加标签
    router.post('/add', async ctx => {
        const body = validate(ctx, addSchema)
        if (!body) return

        const resp = await service.addTag(body)
        response(ctx, resp)
    })

    const updateSchema = Joi.object<TagUpdateReqData>({
        title: Joi.string().allow(null),
        color: Joi.string().allow(null),
        groupId: Joi.string().allow(null),
    })

    // 更新标签
    router.put('/update', async ctx => {
        const body = validate(ctx, updateSchema)
        if (!body) return

        const resp = await service.updateTag(body)
        response(ctx, resp)
    })

    // 删除标签
    router.delete('/:id/remove', async ctx => {
        const { id } = ctx.params
        const resp = await service.removeTag(id)
        response(ctx, resp)
    })

    // 查询标签列表（不分页）
    router.get('/list', async ctx => {
        const resp = await service.getTagList()
        response(ctx, resp)
    })

    // 查询标签分组列表（不分页）
    router.get('/group/list', async ctx => {
        const resp = await service.getGroupList()
        response(ctx, resp)
    })

    return router
}