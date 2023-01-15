import { STORAGE_PATH } from '@/config'
import { AppKoaContext, AppResponse } from '@/types/global'
import { ensureFile } from 'fs-extra'
import { readFile, writeFile } from 'fs/promises'
import Joi from 'joi'
import { Context } from 'koa'
import { nanoid } from 'nanoid'
import path from 'path'

const initialResponse: AppResponse = {
    code: 200,
    msg: '',
    data: null
}

export const response = (ctx: Context, { code, msg, data }: AppResponse = initialResponse) => {
    ctx.body = {
        code,
        msg,
        data
    }
}

/**
 * 验证请求参数
 * GET 请求校验 query，POST 请求校验 body
 *
 * @param ctx koa上下文
 * @param schema joi验证对象
 *
 * @returns 验证通过则返回验证后的值，否则返回 undefined
 */
export const validate = <T>(ctx: Context, schema: Joi.ObjectSchema<T>) => {
    const { error, value } = schema.validate(ctx.method === 'GET' ? ctx.request.query : ctx.request.body)
    if (!value || error) {
        response(ctx, { code: 400, msg: '参数异常' })
        return
    }
    return value
}

/**
 * 获得请求发送方的 ip
 * @link https://juejin.cn/post/6844904056784175112
 * @param   {Context}  ctx
 * @return  {string}
 */
export function getIp(ctx: AppKoaContext) {
    const xRealIp = ctx.get('X-Real-Ip')
    const { ip } = ctx
    const { remoteAddress } = ctx.req.connection
    return xRealIp || ip || remoteAddress
}

/**
 * 获取请求访问的接口路由
 * 会把 params 里的值还原成对应的键名
 */
export function getRequestRoute (ctx: AppKoaContext) {
    const { url, params } = ctx
    const pureUrl = url.split('?')[0]
    if (!params) return pureUrl

    const route = Object.entries(params).reduce((prevUrl, param) => {
        const [ key, value ] = param
        return prevUrl.replace('/' + value as string, `/:${key}`)
    }, pureUrl)

    return route
}

interface CreateFileReaderProps {
    fileName: string
    getInitData?: () => Promise<string>
}

/**
 * 创建本地文件内容读取器
 */
export const createFileReader = (props: CreateFileReaderProps) => {
    const { fileName, getInitData = async () => nanoid() } = props
    let cache: string

    return async () => {
        // 使用缓存
        if (cache) return cache

        // 读取本地文件
        const filePath = path.join(STORAGE_PATH, fileName)
        await ensureFile(filePath)
        const content = await readFile(filePath)
        const contentStr = content.toString()
        if (contentStr.length > 0) return cache = contentStr

        // 没有内容，填充一下
        const initData = await getInitData()
        await writeFile(filePath, initData)
        return cache = initData
    }
}
