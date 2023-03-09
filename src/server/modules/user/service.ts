import { AppTheme, UserStorage, LoginSuccessResp } from '@/types/user'
import { AppResponse } from '@/types/global'
import { STATUS_CODE } from '@/config'
import { sha } from '@/utils/crypto'
import { LoginLocker } from '@/server/lib/LoginLocker'
import { nanoid } from 'nanoid'
import { ArticleService } from '../article/service'
import { DatabaseAccessor } from '@/server/lib/sqlite'

interface Props {
    loginLocker: LoginLocker
    createToken: (payload: Record<string, any>) => Promise<string>
    getReplayAttackSecret: () => Promise<string>
    db: DatabaseAccessor
    addArticle: ArticleService['addArticle']
}

export const createService = (props: Props) => {
    const {
        loginLocker, createToken,
        getReplayAttackSecret,
        addArticle,
    } = props
    const { queryUser } = props.db

    const loginFail = (ip: string, msg = '账号或密码错误') => {
        const lockInfo = loginLocker.recordLoginFail(ip)
        const retryNumber = 3 - lockInfo.length
        const message = retryNumber > 0 ? `将在 ${retryNumber} 次后锁定登录` : '账号已被锁定'
        return { code: 401, msg: `${msg}，${message}` }
    }

    /**
     * 直接获取用户信息
     */
    const getUserInfo = async (userId: number, ip: string): Promise<AppResponse> => {
        const userStorage = await queryUser().select().where({ id: userId }).first()
        if (!userStorage) return loginFail(ip, '用户不存在')

        const { username, theme, initTime, isAdmin, rootArticleId } = userStorage

        // 用户每次重新进入页面都会刷新 token
        const token = await createToken({ userId })
        const replayAttackSecret = await getReplayAttackSecret()

        const data: LoginSuccessResp = {
            token,
            theme,
            initTime,
            isAdmin,
            username,
            rootArticleId,
            replayAttackSecret,
        }

        loginLocker.clearRecord(ip)

        return { code: 200, data }
    }

    /**
     * 登录
     */
    const login = async (username: string, password: string, ip: string): Promise<AppResponse> => {
        const userStorage = await queryUser().select().where({ username }).first()
        if (!userStorage) return loginFail(ip)

        const { passwordHash, passwordSalt } = userStorage
        if (passwordHash !== sha(passwordSalt + password)) return loginFail(ip)

        return getUserInfo(userStorage.id, ip)
    }

    /**
     * 注册
     */
    const register = async (username: string, passwordHash: string, isAdmin = false): Promise<AppResponse> => {
        const userStorage = await queryUser().select('id').where({ username }).first()
        if (userStorage) {
            return { code: STATUS_CODE.ALREADY_REGISTER, msg: '已经注册' }
        }

        const passwordSalt = nanoid()
        const initStorage: Omit<UserStorage, 'id'> = {
            username,
            passwordHash: sha(passwordSalt + passwordHash),
            passwordSalt,
            initTime: Date.now(),
            rootArticleId: -1,
            theme: AppTheme.Light,
            isAdmin,
        }

        // 获取新用户的 id
        const [id] = await queryUser().insert(initStorage)

        // 给这个用户创建一个根节点文章
        const createResp = await addArticle('首页', '第一个笔记', id)
        if (!createResp.data) return createResp

        // 把根节点文章 id 存到用户表
        await queryUser().update({ rootArticleId: createResp.data }).where({ id })
        return { code: 200 }
    }

    /**
     * 创建管理员
     */
    const createAdmin = async (username: string, passwordHash: string): Promise<AppResponse> => {
        const [{ ['count(*)']: userCount }] = await queryUser().count()
        if (userCount > 0) {
            return { code: 400, msg: '管理员已存在' }
        }

        return await register(username, passwordHash, true)
    }

    /**
     * 修改密码 - 更新密码
     */
    const changePassword = async (
        userId: number,
        oldPasswordHash: string,
        newPasswordHash: string
    ): Promise<AppResponse> => {
        const userStorage = await queryUser().select().where({ id: userId }).first()
        if (!userStorage) {
            return { code: 400, msg: '用户不存在' }
        }

        const { passwordHash, passwordSalt } = userStorage
        if (sha(passwordSalt + oldPasswordHash) !== passwordHash) {
            return { code: 400, msg: '旧密码错误' }
        }

        const newPasswordSalt = nanoid()
        const newStorage: Partial<UserStorage> = {
            passwordHash: sha(newPasswordHash + newPasswordSalt),
            passwordSalt: newPasswordSalt
        }

        await queryUser().update(newStorage).where({ id: userId })
        return { code: 200 }
    }

    /**
     * 设置应用主题色
     */
    const setTheme = async (userId: number, theme: AppTheme) => {
        const userStorage = await queryUser().select().where({ id: userId }).first()
        if (!userStorage) {
            return { code: 400, msg: '用户不存在' }
        }

        await queryUser().update({ theme }).where({ id: userId })
        return { code: 200 }
    }

    return { getUserInfo, login, register, createAdmin, changePassword, setTheme }
}

export type UserService = ReturnType<typeof createService>