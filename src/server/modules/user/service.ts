import { AppTheme, UserStorage, LoginSuccessResp } from '@/types/user'
import { AppResponse } from '@/types/global'
import { STATUS_CODE } from '@/config'
import { sha } from '@/utils/crypto'
import { LoginLocker } from '@/server/lib/LoginLocker'
import { nanoid } from 'nanoid'
import { Collection } from 'mongodb'

interface Props {
    loginLocker: LoginLocker
    createToken: (payload: Record<string, any>) => Promise<string>
    getReplayAttackSecret: () => Promise<string>
    getUserCollection: () => Collection<UserStorage>
    getUserStorage: (username: string) => Promise<UserStorage | null>
    updateUserStorage: (username: string, newStorage: Partial<UserStorage>) => Promise<unknown>
}

export const createService = (props: Props) => {
    const {
        loginLocker, createToken,
        getReplayAttackSecret,
        getUserCollection,
        getUserStorage, updateUserStorage,
    } = props

    const loginFail = (ip: string) => {
        const lockInfo = loginLocker.recordLoginFail(ip)
        const retryNumber = 3 - lockInfo.length
        const message = retryNumber > 0 ? `将在 ${retryNumber} 次后锁定登录` : '账号已被锁定'
        return { code: 401, msg: `账号或密码错误，${message}` }
    }

    /**
     * 登录
     */
    const login = async (username: string, password: string, ip: string): Promise<AppResponse> => {
        const userStorage = await getUserStorage(username)
        if (!userStorage) return loginFail(ip)

        const { passwordHash, passwordSalt, theme } = userStorage
        if (passwordHash !== sha(passwordSalt + password)) return loginFail(ip)

        const token = await createToken({ username })
        const replayAttackSecret = await getReplayAttackSecret()

        const data: LoginSuccessResp = {
            token,
            theme,
            replayAttackSecret,
        }

        loginLocker.clearRecord(ip)

        return { code: 200, data }
    }

    /**
     * 注册
     */
    const register = async (username: string, passwordHash: string): Promise<AppResponse> => {
        const userStorage = await getUserStorage(username)
        if (userStorage) {
            return { code: STATUS_CODE.ALREADY_REGISTER, msg: '已经注册' }
        }

        const passwordSalt = nanoid()
        const initStorage: UserStorage = {
            username,
            passwordHash: sha(passwordSalt + passwordHash),
            passwordSalt,
            initTime: Date.now(),
            theme: AppTheme.Light
        }

        await updateUserStorage(username, initStorage)

        return { code: 200 }
    }

    /**
     * 创建管理员
     */
    const createAdmin = async (username: string, passwordHash: string): Promise<AppResponse> => {
        const userCollection = getUserCollection()
        const userNumber = await userCollection.countDocuments()
        if (userNumber > 0) {
            return { code: 400, msg: '管理员已存在' }
        }

        const registerResult = await register(username, passwordHash)
        if (registerResult.code !== 200) {
            return registerResult
        }

        await updateUserStorage(username, { isAdmin: true })
        return { code: 200 }
    }

    /**
     * 修改密码 - 更新密码
     */
    const changePassword = async (
        username: string,
        oldPasswordHash: string,
        newPasswordHash: string
    ): Promise<AppResponse> => {
        const userStorage = await getUserStorage(username)
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

        await updateUserStorage(username, newStorage)
        return { code: 200 }
    }

    /**
     * 设置应用主题色
     */
    const setTheme = async (username: string, theme: AppTheme) => {
        const userStorage = await getUserStorage(username)
        if (!userStorage) {
            return { code: 400, msg: '用户不存在' }
        }

        await updateUserStorage(username, { theme })
        return { code: 200 }
    }

    return { login, register, createAdmin, changePassword, setTheme }
}

export type AuthService = ReturnType<typeof createService>