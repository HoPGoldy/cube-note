import { AppStorage, CertificateDetail } from '@/types/app'
import { CreateOtpFunc } from '@/server/lib/auth'
import { AppResponse } from '@/types/global'
import { STATUS_CODE } from '@/config'
import { CertificateGroupDetail, ChangePasswordData, LoginErrorResp, LoginResp } from '@/types/http'
import { aes, aesDecrypt, getAesMeta, sha } from '@/utils/crypto'
import { LoginLocker } from '@/server/lib/security'
import { authenticator } from 'otplib'
import { nanoid } from 'nanoid'
import { DEFAULT_PASSWORD_ALPHABET, DEFAULT_PASSWORD_LENGTH } from '@/constants'

interface Props {
    createOTP: CreateOtpFunc
    saveData: () => Promise<void>
    getAppStorage: () => Promise<AppStorage>
    updateAppStorage: (data: Partial<AppStorage>) => Promise<void>
    loginLocker: LoginLocker
    createToken: () => Promise<string>
    getReplayAttackSecret: () => Promise<string>
    getCertificateGroupList: () => Promise<CertificateGroupDetail[]>
    getAllCertificate: () => Promise<CertificateDetail[]>
    updateCertificate: (certificates: CertificateDetail[]) => Promise<void>
}

export const createService = (props: Props) => {
    const {
        createOTP, getAppStorage, updateAppStorage, saveData,
        loginLocker, createToken,
        getCertificateGroupList, getReplayAttackSecret,
        getAllCertificate, updateCertificate
    } = props

    const challengeManager = createOTP()

    /**
     * 登录
     */
    const login = async (username: string, password: string): Promise<AppResponse> => {
        const {
            passwordHash, defaultGroupId, theme,
            createPwdAlphabet = DEFAULT_PASSWORD_ALPHABET, createPwdLength = DEFAULT_PASSWORD_LENGTH
        } = await getAppStorage()

        if (!passwordHash) {
            return { code: STATUS_CODE.NOT_REGISTER, msg: '请先注册' }
        }

        if (sha(passwordHash) !== password) {
            loginLocker.recordLoginFail()
            return { code: 401, msg: '密码错误，请检查主密码是否正确' }
        }

        const token = await createToken()
        const groups = await getCertificateGroupList()
        const replayAttackSecret = await getReplayAttackSecret()

        const data: LoginResp = {
            token,
            groups,
            defaultGroupId,
            theme,
            replayAttackSecret,
            createPwdAlphabet,
            createPwdLength
        }

        saveData()
        loginLocker.clearRecord()

        return { code: 200, data }
    }

    /**
     * 注册
     */
    const register = async (code: string, salt: string): Promise<AppResponse> => {
        const { passwordSalt, passwordHash } = await getAppStorage()
        if (passwordSalt && passwordHash) {
            return { code: STATUS_CODE.ALREADY_REGISTER, msg: '已经注册' }
        }

        await updateAppStorage({
            passwordSalt: salt,
            passwordHash: code,
            initTime: Date.now()
        })

        saveData()
        return { code: 200 }
    }

    /**
     * 查询登录失败接口信息
     */
    const getLogInfo = (): LoginErrorResp => {
        const lockDetail = loginLocker.getLockDetail()

        return {
            loginFailure: lockDetail.records,
            appLock: lockDetail.disable,
            appFullLock: lockDetail.dead
        }
    }

    /**
     * 修改密码 - 更新密码
     * aes 加密，密钥为(sha(主密码 + 盐) + 挑战码 + jwt token)
     * 
     * @param changePwdData 被前端加密的修改密码信息
     */
    const changePassword = async (changePwdDataStr: string, token: string): Promise<AppResponse> => {
        const { passwordHash, totpSecret } = await getAppStorage()
        const challengeCode = challengeManager.pop('changePwd')
        if (!passwordHash || !challengeCode) {
            return { code: 400, msg: '参数错误' }
        }

        const postKey = passwordHash + challengeCode + token
        const { key, iv } = getAesMeta(postKey)
        const changeData = aesDecrypt(changePwdDataStr, key, iv)
    
        if (!changeData) return { code: 400, msg: '无效的密码修改凭证' }
    
        const { oldPwd, newPwd, code } = JSON.parse(changeData) as ChangePasswordData
        // 如果绑定了令牌，就需要进行验证
        if (totpSecret) {
            if (!code) {
                return { code: 400, msg: '请填写动态验证码' }
            }
    
            const codeConfirmed = authenticator.check(code, totpSecret)
            if (!codeConfirmed) {
                return { code: 400, msg: '验证码已过期' }
            }
        }
    
        const oldMeta = getAesMeta(oldPwd)
        const newMeta = getAesMeta(newPwd)
    
        try {
            // 重新加密所有凭证
            const allCertificates = await getAllCertificate()
            const newDatas = allCertificates.map(item => {
                const { content } = item
                const data = aesDecrypt(content, oldMeta.key, oldMeta.iv)
                if (!data) return item
    
                return {
                    ...item,
                    content: aes(data, newMeta.key, newMeta.iv)
                }
            })
    
            updateCertificate(newDatas)
    
            // 把主密码信息更新上去
            const passwordSalt = nanoid()
            await updateAppStorage({ passwordHash: sha(passwordSalt + newPwd), passwordSalt })
    
            saveData()
            loginLocker.clearRecord()
            return { code: 200 }
        }
        catch (e) {
            console.error(e)
            return { code: 500, msg: '修改密码失败' }
        }
    }

    return { login, register, getLogInfo, changePassword }
}

export type AuthService = ReturnType<typeof createService>