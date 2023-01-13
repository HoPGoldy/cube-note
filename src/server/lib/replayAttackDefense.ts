import { STATUS_CODE } from '@/config'
import { AppKoaContext } from '@/types/global'
import { getReplayAttackData, validateReplayAttackData } from '@/utils/crypto'
import { Next } from 'koa'
import { createFileReader, response } from '../utils'
import { getReplayAttackNonceCollection } from './mongodb'

/**
 * 获取防重放密钥
 */
export const getReplayAttackSecret = createFileReader({ fileName: 'replayAttackSecret' })

/**
 * 创建检查中间件 - 防重放攻击
 */
export const createCheckReplayAttack = (options: { excludePath: string[] }) => {
    const checkReplayAttack = async (ctx: AppKoaContext, next: Next) => {
        const isAccessPath = !!options.excludePath.find(path => ctx.url.endsWith(path))
        // 允许 excludePath 接口正常访问
        if (isAccessPath) return await next()

        try {
            const replayAttackData = getReplayAttackData(ctx)
            if (!replayAttackData) {
                throw new Error(`伪造请求攻击，请求路径：${ctx.path}。已被拦截，原因为未提供防重放攻击 header。`)
            }

            const replayAttackSecret = await getReplayAttackSecret()
            const nonceCollection = await getReplayAttackNonceCollection()
            // 如果有重复的随机码
            if (await nonceCollection.findOne({ value: replayAttackData.nonce })) {
                throw new Error(`伪造请求攻击，请求路径：${ctx.path}。已被拦截，原因为重复的 nonce。`)
            }

            const isValidate = validateReplayAttackData(replayAttackData, replayAttackSecret)
            if (!isValidate) {
                throw new Error(`伪造请求攻击，请求路径：${ctx.path}。已被拦截，原因为请求签名异常。`)
            }

            await next()
        }
        catch (e) {
            console.error(e)
            response(ctx, { code: STATUS_CODE.REPLAY_ATTACK, msg: '请求异常，请稍后再试' })
        }
    }

    return checkReplayAttack
}
