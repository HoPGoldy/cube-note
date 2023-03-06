import Router from 'koa-router'
import { AppKoaContext } from '@/types/global'
import { response } from '@/server/utils'
import { ArticleService } from './service'
import { validate } from '@/server/utils'
import Joi from 'joi'
import { AddArticleReqData, DeleteArticleMutation, QueryArticleReqData, UpdateArticleReqData } from '@/types/article'
import { getJwtPayload } from '@/server/lib/auth'

interface Props {
    service: ArticleService
}

export const createRouter = (props: Props) => {
    const { service } = props
    const router = new Router<any, AppKoaContext>({ prefix: '/article' })

    const addArticleSchema = Joi.object<AddArticleReqData>({
        title: Joi.string().required(),
        content: Joi.string().allow('').required(),
        parentId: Joi.string().required(),
    })

    // 添加文章
    router.post('/add', async ctx => {
        const body = validate(ctx, addArticleSchema)
        if (!body) return
        const { title, content, parentId } = body

        const payload = getJwtPayload(ctx)
        if (!payload) return

        const resp = await service.addArticle(title, content, payload.userId, parentId)
        response(ctx, resp)
    })

    const removeArticleSchema = Joi.object<DeleteArticleMutation>({
        id: Joi.string().required(),
        force: Joi.boolean().required(),
    })

    // 删除文章
    router.post('/remove', async ctx => {
        const body = validate(ctx, removeArticleSchema)
        if (!body) return

        const resp = await service.removeArticle(body.id, body.force)
        response(ctx, resp)
    })

    const updateArticleSchema = Joi.object<UpdateArticleReqData>({
        id: Joi.string(),
        title: Joi.string().allow(null),
        content: Joi.string().allow('', null),
        relatedArticleIds: Joi.array().items(Joi.string()).allow(null),
        parentArticleId: Joi.string().allow(null),
        tagIds: Joi.array().items(Joi.string()).allow(null),
    })

    // 更新文章
    router.put('/update', async ctx => {
        const body = validate(ctx, updateArticleSchema)
        if (!body) return

        const resp = await service.updateArticle(body)
        response(ctx, resp)
    })

    // 查询文章详情
    // 包含内容、标题等正文详情
    router.get('/:id/getContent', async ctx => {
        const { id } = ctx.params
        const resp = await service.getArticleContent(id)
        response(ctx, resp)
    })

    const queryArticleSchema = Joi.object<QueryArticleReqData>({
        keyword: Joi.string().allow(null),
        tagIds: Joi.array().items(Joi.string()).allow(null),
        page: Joi.number().allow(null),
    })

    // 获取文章列表
    router.post('/getList', async ctx => {
        const body = validate(ctx, queryArticleSchema)
        if (!body) return

        const resp = await service.getArticleList(body)
        response(ctx, resp)
    })

    // 获取文章子级、父级文章信息
    router.get('/:id/getLink', async ctx => {
        const { id } = ctx.params
        const resp = await service.getChildren(id)
        response(ctx, resp)
    })

    // 获取相关文章信息
    router.get('/:id/getRelated', async ctx => {
        const { id } = ctx.params
        const resp = await service.getRelatives(id)
        response(ctx, resp)
    })

    // 批量设置文章的父文章
    router.get('/setParentId', async ctx => {
        response(ctx)
    })

    // 查询文章树
    router.get('/:rootArticleId/tree', async ctx => {
        const { rootArticleId } = ctx.params

        const resp = await service.getArticleTree(rootArticleId)
        response(ctx, resp)
    })

    // 获取所有收藏的文章
    router.get('/favorite', async ctx => {
        const payload = getJwtPayload(ctx)
        if (!payload) return

        const resp = await service.getFavoriteArticles(payload.userId)
        response(ctx, resp)
    })

    return router
}