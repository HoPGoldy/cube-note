import { STATUS_CODE } from '@/config'
import { LoginSuccessResp } from '@/types/user'
import { sha } from '@/utils/crypto'
import React, { useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Notify } from 'react-vant'
import { Button } from '../components/Button'
import { usePostLoginMutation } from '../services/user'
import { useAppDispatch, useAppSelector } from '../store'
import { login } from '../store/user'
import { messageError, messageSuccess } from '../utils/message'

const fieldClassName = 'block grow px-3 py-2 mb-2 w-full transition ' +
    'border border-slate-300 rounded-md shadow-sm placeholder-slate-400 ' +
    'focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500 ' +
    'dark:border-slate-500 dark:bg-slate-700 dark:hover:bg-slate-800 '

const Register = () => {
    const dispatch = useAppDispatch()
    // 用户名
    const [username, setUsername] = useState('')
    // 密码
    const [password, setPassword] = useState('')
    // 用户名输入框
    const usernameInputRef = useRef<HTMLInputElement>(null)
    // 密码输入框
    const passwordInputRef = useRef<HTMLInputElement>(null)
    // 应用配置
    const config = useAppSelector(s => s.user.appConfig)
    // 提交登录
    const [postLogin, { isLoading: isLogin }] = usePostLoginMutation()
    // store 里的用户信息
    const userInfo = useAppSelector(s => s.user.userInfo)

    const onSubmit = async () => {
        const resp = await postLogin({ username, password: sha(password) }).unwrap()
        if (resp.code !== STATUS_CODE.SUCCESS) {
            messageError(resp.msg || '登录失败')
            return
        }

        messageSuccess(`登录成功，欢迎回来，${resp?.data?.username}`)
        dispatch(login(resp.data as LoginSuccessResp))
    }

    if (userInfo) {
        return <Navigate to="/" replace />
    }

    return (
        <div className="h-screen w-screen bg-background flex flex-col justify-center items-center dark:text-gray-100">
            <header className="w-screen text-center min-h-[236px]">
                <div className="text-5xl font-bold text-mainColor">{config?.appName}</div>
                <div className="mt-4 text-xl text-mainColor">{config?.loginSubtitle}</div>
            </header>
            <div className='w-[70%] md:w-[40%] lg:w-[30%] xl:w-[20%] flex flex-col items-center'>
                <input
                    ref={usernameInputRef}
                    className={fieldClassName}
                    autoFocus
                    placeholder="请输入用户名"
                    value={username}
                    onInput={e => setUsername((e.target as any).value)}
                    onKeyUp={e => {
                        if (e.key === 'Enter') {
                            passwordInputRef.current?.focus()
                        }
                    }}
                />

                <input
                    ref={passwordInputRef}
                    className={fieldClassName}
                    type='password'
                    placeholder="请输入密码"
                    value={password}
                    onInput={e => setPassword((e.target as any).value)}
                    onKeyUp={e => {
                        if (e.key === 'Enter') onSubmit()
                    }}
                />

                <div className='shrink-0 w-full'>
                    <Button
                        block
                        disabled={isLogin}
                        color={config?.buttonColor}
                        onClick={onSubmit}
                    >登 录</Button>
                </div>
            </div>
        </div>
    )
}

export default Register