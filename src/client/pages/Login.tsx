import { STATUS_CODE } from '@/config'
import React, { useContext, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Notify } from 'react-vant'
import { AppConfigContext } from '../components/AppConfigProvider'
import { Button } from '../components/Button'
import { UserContext } from '../components/UserProvider'
import { setToken } from '../services/base'
import { fetchLoginFail, login, requireLogin } from '../services/user'
import { useQuery } from 'react-query'
import { LoginErrorResp } from '@/types/user'
import { getAesMeta } from '@/utils/crypto'

const fieldClassName = 'block grow px-3 py-2 w-full transition ' +
    'border border-slate-300 rounded-md shadow-sm placeholder-slate-400 ' +
    'focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500 ' +
    'dark:border-slate-500 dark:bg-slate-700 dark:hover:bg-slate-800 '

const Register = () => {
    const navigate = useNavigate()
    // 密码
    const [password, setPassword] = useState('')
    // 密码输入框
    const passwordInputRef = useRef<HTMLInputElement>(null)
    const config = useContext(AppConfigContext)
    const { data: logFailInfo, refetch } = useQuery('loginFailInfo', fetchLoginFail, {
        retry: false
    })

    // 临时功能，开发自动登录
    // useEffect(() => {
    //     if (!password) setPassword('123456')
    //     else onSubmit()
    // }, [password])

    const onSubmit = async () => {
        // const resp = await requireLogin().catch(error => {
        //     if (error.code === STATUS_CODE.NOT_REGISTER) {
        //         Notify.show({ type: 'danger', message: error.msg || '请先注册' })
        //         location.pathname = 'register.html'
        //     }
        // })

        // if (!resp) return
        // const { salt, challenge } = resp
        // const loginResp = await login(password, salt, challenge, code).catch(error => {
        //     passwordInputRef.current?.focus()
        //     setPassword('')
        //     refetch()
        // })

        // if (!loginResp) return
        // const {
        //     replayAttackSecret, token, defaultGroupId, groups, unReadNoticeCount, unReadNoticeTopLevel, theme,
        //     createPwdAlphabet, createPwdLength
        // } = loginResp

        // // 请求发起那边访问不到 context，所以需要保存到 sessionStorage 里
        // sessionStorage.setItem('replayAttackSecret', replayAttackSecret)
        // setToken(token)
        // const { key, iv } = getAesMeta(password)
        // setUserProfile({ pwdKey: key, pwdIv: iv, pwdSalt: salt, token, defaultGroupId, theme, createPwdAlphabet, createPwdLength })
        // setNoticeInfo({ unReadNoticeCount, unReadNoticeTopLevel})
        // setGroupList(groups)
        // setSelectedGroup(defaultGroupId)
        // navigate('/group', { replace: true })
    }

    return (
        <div className="h-screen w-screen bg-background flex flex-col justify-center items-center dark:text-gray-100">
            <header className="w-screen text-center min-h-[236px]">
                <div className="text-5xl font-bold text-mainColor">密码本</div>
                <div className="mt-4 text-xl text-mainColor">管理任何需要加密的内容</div>
            </header>
            {!logFailInfo?.appLock && (
                <div className='w-[70%] md:w-[40%] lg:w-[30%] xl:w-[20%] flex flex-col items-center'>
                    <input
                        ref={passwordInputRef}
                        className={fieldClassName}
                        type='password'
                        autoFocus
                        placeholder="请输入密码"
                        value={password}
                        onInput={e => setPassword((e.target as any).value)}
                        onKeyUp={e => {
                            if (e.key === 'Enter') onSubmit()
                        }}
                    />

                    <div className='shrink-0 w-full mt-2'>
                        <Button
                            block
                            color={config?.buttonColor}
                            onClick={onSubmit}
                        >登 录</Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Register