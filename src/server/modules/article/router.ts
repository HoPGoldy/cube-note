import Router from 'koa-router'
import { AppKoaContext } from '@/types/global'
import { response } from '@/server/utils'
import { ArticleService } from './service'
import { validate } from '@/server/utils'
import Joi from 'joi'
import { AddArticlePostData } from '@/types/article'

interface Props {
    service: ArticleService
}

export const createRouter = (props: Props) => {
    const { service } = props
    const router = new Router<any, AppKoaContext>({ prefix: '/article' })

    const addArticleSchema = Joi.object<AddArticlePostData>({
        title: Joi.string().required(),
        content: Joi.string().required(),
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

    // 删除文章
    router.delete('/remove/:id', async ctx => {
        response(ctx)
    })

    // 更新文章
    router.put('/update/:id', async ctx => {
        response(ctx)
    })

    // 查询文章详情
    // 包含内容、标题等正文详情
    router.get('/get/content/:id', async ctx => {
        response(ctx)
    })

    // 获取文章链接信息
    // 文章下属文章列表、相关文章列表
    router.get('/get/link/:id', async ctx => {
        response(ctx)
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
    router.get('/tree', async ctx => {
        response(ctx)
    })

    return router
}