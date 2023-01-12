import { Middleware } from 'koa'
import send from 'koa-send'
import path from 'path'

export const serveStatic: Middleware = async (ctx, next) => {
    await next()

    if (ctx.method !== 'HEAD' && ctx.method !== 'GET') return
    // 请求已经被处理了
    if (ctx.body != null || ctx.status !== 404) return

    try {
        await send(ctx, ctx.path, {
            root: path.resolve('./dist/client')
        })
    } catch (err) {
        if (err.status !== 404) {
            throw err
        }
    }
}
