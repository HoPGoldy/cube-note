import Router from 'koa-router'
import { AppKoaContext } from '@/types/global'
import { response } from '@/server/utils'
import { ArticleService } from './service'
import { validate } from '@/server/utils'
import Joi from 'joi'
import { AddArticlePostData, DeleteArticleMutation, UpdateArticlePostData } from '@/types/article'

interface Props {
    service: ArticleService
}

export const createRouter = (props: Props) => {
    const { service } = props
    const router = new Router<any, AppKoaContext>({ prefix: '/article' })

    const addArticleSchema = Joi.object<AddArticlePostData>({
        title: Joi.string().required(),
        content: Joi.string().allow('').required(),
        parentId: Joi.string().required(),
    })

    // 添加文章
    router.post('/add', async ctx => {
        const body = validate(ctx, addArticleSchema)
        if (!body) return
        const { title, content, parentId } = body

        const resp = await service.addArticle(title, content, parentId)
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

    const updateArticleSchema = Joi.object<UpdateArticlePostData>({
        id: Joi.string(),
        title: Joi.string(),
        content: Joi.string().allow(''),
        parentId: Joi.string(),
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

    // 获取文章链接信息
    // 文章下属文章列表、相关文章列表
    router.get('/:id/getLink', async ctx => {
        const { id } = ctx.params
        const resp = await service.getArticleLink(id)
        response(ctx, resp)
    })

    // 批量设置文章的父文章
    router.get('/setParentId', async ctx => {
        response(ctx)
    })

    // 关联两个文章
    router.get('/link', async ctx => {
        response(ctx)
    })

    // 取消关联两个文章
    router.get('/unlink', async ctx => {
        response(ctx)
    })

    // 查询文章树
    router.get('/:rootArticleId/tree', async ctx => {
        const { rootArticleId } = ctx.params
        const resp = await service.getArticleTree(rootArticleId)
        response(ctx, resp)
    })

    return router
}