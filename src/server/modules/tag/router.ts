import Router from 'koa-router'
import { AppKoaContext } from '@/types/global'
import { response } from '@/server/utils'
import { TagService } from './service'
import { validate } from '@/server/utils'
import Joi from 'joi'
import { DeleteTagReqData, SetTagColorReqData, SetTagGroup, SetTagGroupReqData, TagGroupStorage, TagGroupUpdateReqData, TagStorage, TagUpdateReqData } from '@/types/tag'

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
        id: Joi.string().required(),
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

    const addGroupSchema = Joi.object<TagGroupStorage>({
        title: Joi.string().required(),
    })

    // 添加分组
    router.post('/group/add', async ctx => {
        const body = validate(ctx, addGroupSchema)
        if (!body) return

        const resp = await service.addGroup(body)
        response(ctx, resp)
    })

    // 删除分组
    router.delete('/:id/:method/removeGroup', async ctx => {
        const { id, method } = ctx.params
        const resp = await service.removeGroup(id, method)
        response(ctx, resp)
    })

    const updateGroupSchema = Joi.object<TagGroupUpdateReqData>({
        id: Joi.string().required(),
        title: Joi.string().allow(null),
    })

    // 更新标签
    router.put('/group/update', async ctx => {
        const body = validate(ctx, updateGroupSchema)
        if (!body) return

        const resp = await service.updateGroup(body)
        response(ctx, resp)
    })

    const batchSetColorSchema = Joi.object<SetTagColorReqData>({
        color: Joi.string().required(),
        ids: Joi.array().items(Joi.string()).required(),
    })

    // 批量设置标签颜色
    router.post('/batch/setColor', async ctx => {
        const body = validate(ctx, batchSetColorSchema)
        if (!body) return

        const resp = await service.batchSetColor(body.ids, body.color)
        response(ctx, resp)
    })

    const batchSetGroupSchema = Joi.object<SetTagGroupReqData>({
        changeList: Joi.array().items(Joi.object<SetTagGroup>({
            groupId: Joi.string().required(),
            ids: Joi.array().items(Joi.string()).required(),
        }))
    })

    // 批量设置标签分组
    router.post('/batch/setGroup', async ctx => {
        const body = validate(ctx, batchSetGroupSchema)
        if (!body) return

        const resp = await service.batchSetGroup(body.changeList)
        response(ctx, resp)
    })

    const batchRemoveSchema = Joi.object<DeleteTagReqData>({
        ids: Joi.array().items(Joi.string()).required(),
    })

    // 批量删除标签
    router.post('/batch/remove', async ctx => {
        const body = validate(ctx, batchRemoveSchema)
        if (!body) return

        const resp = await service.batchRemoveTag(body.ids)
        response(ctx, resp)
    })

    return router
}