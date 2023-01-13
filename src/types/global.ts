import { Context } from 'koa'

/**
 * 后端接口返回的数据格式
 */
export type AppResponse<T = unknown> = {
    code?: number
    msg?: string
    data?: T
}

export interface MyJwtPayload {
    groups?: number[]
    lat: number
    exp: number
}

export type AppKoaContext = Context & {
    request: { body: Record<string, unknown> }
    /**
     * 用于存储 jwt 解析后的数据
     */
    state?: { user: MyJwtPayload }
}