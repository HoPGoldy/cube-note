import Router from 'koa-router'
import { AppKoaContext } from '@/types/global'
import { getIp, response } from '@/server/utils'
import { UserService } from './service'
import { validate } from '@/server/utils'
import Joi from 'joi'
import { ChangePasswordReqData, LoginReqData, SetThemeReqData } from '@/types/user'
import { getUsernameFromCtx } from '@/server/lib/auth'

interface Props {
    service: UserService
}

export const createRouter = (props: Props) => {
    const { service } = props
    const router = new Router<any, AppKoaContext>({ prefix: '/user' })

    const loginSchema = Joi.object<LoginReqData>({
        username: Joi.string().required(),
        password: Joi.string().required()
    })

    router.post('/login', async ctx => {
        const body = validate(ctx, loginSchema)
        if (!body) return
        const { username, password } = body

        const resp = await service.login(username, password, getIp(ctx) || 'anonymous')
        response(ctx, resp)
    })

    router.get('/getInfo', async ctx => {
        const username = getUsernameFromCtx(ctx)
        if (!username) return

        const resp = await service.getUserInfo(username, getIp(ctx) || 'anonymous')
        response(ctx, resp)
    })

    const registerSchema = Joi.object<LoginReqData>({
        username: Joi.string().required(),
        password: Joi.string().required()
    })

    router.post('/register', async ctx => {
        const body = validate(ctx, registerSchema)
        if (!body) return
        const { username, password } = body

        const resp = await service.register(username, password)
        response(ctx, resp)
    })

    router.post('/createAdmin', async ctx => {
        const body = validate(ctx, registerSchema)
        if (!body) return
        const { username, password } = body

        const resp = await service.createAdmin(username, password)
        response(ctx, resp)
    })

    const changePwdSchema = Joi.object<ChangePasswordReqData>({
        newP: Joi.string().required(),
        oldP: Joi.string().required()
    })

    router.put('/changePwd', async ctx => {
        const body = validate(ctx, changePwdSchema)
        if (!body) return
        const { newP, oldP } = body

        const username = ctx.state?.user?.username
        if (!username) {
            response(ctx, { code: 400, msg: '未知用户，请重新登录' })
            return
        }

        const resp = await service.changePassword(username, newP, oldP)
        response(ctx, resp)
    })

    const setThemeSchema = Joi.object<SetThemeReqData>({
        theme: Joi.any().valid('light', 'dark').required()
    })

    router.put('/setTheme', async ctx => {
        const body = validate(ctx, setThemeSchema)
        if (!body) return
        const { theme } = body

        const username = ctx.state?.user?.username
        if (!username) {
            response(ctx, { code: 400, msg: '未知用户，请重新登录' })
            return
        }

        const resp = await service.setTheme(username, theme)
        response(ctx, resp)
    })

    return router
}