import { sha } from '@/utils/crypto'
import { ArrowLeft } from '@react-vant/icons'
import React, { FC, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Notify, Swiper, SwiperInstance } from 'react-vant'
import { Button } from '../components/Button'
import { useCreateAdminMutation } from '../services/user'
import { useAppDispatch, useAppSelector } from '../store'
import { initSuccess } from '../store/user'

const GobackBtn: FC<{ onClick: () => unknown }> = (props) => {
    return (
        <div
            className='
                flex items-center justify-center w-24 mx-auto py-1 pl-1 pr-2 rounded transition cursor-pointer
                text-slate-700
                hover:bg-slate-300
            '
            onClick={props.onClick}
        ><ArrowLeft className='inline mr-2' />返回</div>
    )
}

const Register = () => {
    const dispatch = useAppDispatch()
    // 副标题及介绍轮播
    const titleSwiperRef = useRef<SwiperInstance>(null)
    // 输入框轮播
    const contentSwiperRef = useRef<SwiperInstance>(null)
    // 密码输入框
    const passwordInputRef = useRef<HTMLInputElement>(null)
    // 重复密码输入框
    const repeatPasswordInputRef = useRef<HTMLInputElement>(null)
    // 用户名
    const [username, setUsername] = useState('')
    // 密码
    const [password, setPassword] = useState('')
    // 密码错误提示
    const [pwdError, setPwdError] = useState('')
    // 重复密码
    const [repeatPassword, setRepeatPassword] = useState('')
    // 重复密码错误提示
    const [repeatPwdError, setRepeatPwdError] = useState('')
    // 提交注册
    const [createAdmin, { isLoading: isCreating }] = useCreateAdminMutation()
    // 是否需要初始化，初始化完成后这个值就变成 false 了
    const needInit = useAppSelector(s => s.user.appConfig?.needInit)

    const setSwiperIndex = (index: number) => {
        titleSwiperRef.current?.swipeTo(index)
        contentSwiperRef.current?.swipeTo(index)
    }

    const onInputedUsername = () => {
        setSwiperIndex(1)
        // 要延迟一会再触发下个输入框的获取焦点事件，不然会破坏轮播的滚动效果
        setTimeout(() => {
            passwordInputRef.current?.focus()
        }, 600)
    }

    const onInputedPassword = () => {
        if (password.length < 6) {
            setPwdError('密码长度应大于 6 位')
            return
        }
        setSwiperIndex(2)
        setTimeout(() => {
            repeatPasswordInputRef.current?.focus()
        }, 600)
    }

    const onInputedRepeatPassword = () => {
        if (repeatPassword !== password) {
            setRepeatPwdError('两次密码不一致')
            return
        }
        setSwiperIndex(3)
    }

    const onSubmit = async () => {
        const resp = await createAdmin({ username, password: sha(password) })
        console.log('resp', resp)
        Notify.show({ type: 'success', message: '初始化完成' })
        dispatch(initSuccess())
    }

    if (needInit === false) {
        return (
            <Navigate to='/login' replace />
        )
    }

    return (
        <div className="h-screen w-screen bg-background flex flex-col justify-center items-center">
            <header className="text-center w-4/5 mb-16 flex flex-col items-center">
                <div className="text-5xl font-bold text-mainColor">应用初始化</div>
                <div className="mt-4 text-xl text-mainColor">
                    <Swiper
                        ref={titleSwiperRef}
                        indicator={false}
                        touchable={false}
                    >
                        <Swiper.Item key={0}>
                            设置管理员
                            <div className='text-slate-600 text-base mt-6'>
                                欢迎使用！
                                <br />
                                安全起见，本应用将不设置默认管理员账号，请手动设置。
                            </div>
                        </Swiper.Item>
                        <Swiper.Item key={1}>
                            设置管理员密码
                            <div className='text-slate-600 text-base mt-6'>
                                请设置一个至少 6 位的强密码，并牢记在心。
                                <br />
                                不要使用生日、姓名缩写等常见信息。
                            </div>
                        </Swiper.Item>
                        <Swiper.Item key={2}>
                            重复密码
                            <div className='text-slate-600 text-base mt-6'>
                                请牢记管理员密码。
                            </div>
                        </Swiper.Item>
                        <Swiper.Item key={3}>
                            告知
                            <div className='text-slate-600 text-base mt-6'>
                                管理员账号可以邀请、管理、删除其他用户账号。
                                <br />
                                除此之外管理员和其他账号功能并无区别，推荐直接当作自己的常用账号使用。
                                <br />
                                该页面不会再次出现，请确保 <b>账号密码已可靠保存</b> 后点击下方按钮。
                            </div>
                        </Swiper.Item>
                    </Swiper>
                </div>
            </header>
            <div className='w-[90%] md:w-1/2 lg:w-1/3'>
                <Swiper
                    ref={contentSwiperRef}
                    indicator={false}
                    touchable={false}
                >
                    <Swiper.Item key={0}>
                        <div className='py-8 px-2 flex items-center relative'>
                            <input
                                className={
                                    'block grow mr-2 px-3 py-2 transition ' +
                                    'border rounded-md shadow-sm placeholder-slate-400 border-slate-300 ' +
                                    'focus:outline-none focus:bg-white  ' +
                                    (pwdError ? 'focus:ring-1 focus:border-red-500 focus:ring-red-500 border-red-500' : 'focus:ring-1 focus:border-sky-500 focus:ring-sky-500')
                                }
                                autoFocus
                                placeholder="请输入用户名"
                                value={username}
                                onChange={e => {
                                    setUsername(e.target.value)
                                    if (pwdError) setPwdError('')
                                    if (repeatPwdError) setRepeatPwdError('')
                                    if (repeatPassword) setRepeatPassword('')
                                }}
                                onKeyUp={e => {
                                    if (e.key === 'Enter') onInputedUsername()
                                }}
                            />

                            {pwdError && <div className='absolute text-sm bottom-1 text-red-500'>
                                {pwdError}    
                            </div>}

                            <Button
                                disabled={!username || isCreating}
                                className='shrink-0'
                                type='primary'
                                onClick={onInputedUsername}
                            >下一步</Button>
                        </div>
                    </Swiper.Item>
                    <Swiper.Item key={1}>
                        <div>
                            <div className='py-8 px-2 flex items-center relative'>
                                <input
                                    ref={passwordInputRef}
                                    type='password'
                                    className={
                                        'block grow mr-2 px-3 py-2 transition ' +
                                        'border rounded-md shadow-sm placeholder-slate-400 border-slate-300 ' +
                                        'focus:outline-none focus:bg-white  ' +
                                        (pwdError ? 'focus:ring-1 focus:border-red-500 focus:ring-red-500 border-red-500' : 'focus:ring-1 focus:border-sky-500 focus:ring-sky-500')
                                    }
                                    placeholder="请输入密码"
                                    value={password}
                                    onChange={e => {
                                        setPassword(e.target.value)
                                        if (pwdError) setPwdError('')
                                        if (repeatPwdError) setRepeatPwdError('')
                                        if (repeatPassword) setRepeatPassword('')
                                    }}
                                    onKeyUp={e => {
                                        if (e.key === 'Enter') onInputedPassword()
                                    }}
                                />

                                {pwdError && <div className='absolute text-sm bottom-1 text-red-500'>
                                    {pwdError}    
                                </div>}

                                <Button
                                    disabled={!password || isCreating}
                                    className='shrink-0'
                                    type='primary'
                                    onClick={onInputedPassword}
                                >下一步</Button>
                            </div>
                            <GobackBtn onClick={() => setSwiperIndex(0)} />
                        </div>
                    </Swiper.Item>
                    <Swiper.Item key={2}>
                        <div>
                            <div className={'pt-8 px-2 flex items-center relative ' + (repeatPwdError ? 'pb-8' : 'pb-4')}>
                                <input
                                    ref={repeatPasswordInputRef}
                                    type='password'
                                    className={
                                        'block grow mr-2 px-3 py-2 transition ' +
                                        'border rounded-md shadow-sm placeholder-slate-400 border-slate-300 ' +
                                        'focus:outline-none focus:bg-white  ' +
                                        (repeatPwdError ? 'focus:ring-1 focus:border-red-500 focus:ring-red-500 border-red-500' : 'focus:ring-1 focus:border-sky-500 focus:ring-sky-500')
                                    }
                                    placeholder="重复密码"
                                    value={repeatPassword}
                                    onChange={e => {
                                        setRepeatPassword(e.target.value)
                                        if (repeatPwdError) setRepeatPwdError('')
                                    }}
                                    onKeyUp={e => {
                                        if (e.key === 'Enter') onInputedRepeatPassword()
                                    }}
                                />

                                {repeatPwdError && <div className='absolute text-sm bottom-1 text-red-500'>
                                    {repeatPwdError}    
                                </div>}

                                <Button
                                    disabled={!repeatPassword || isCreating}
                                    className='shrink-0'
                                    type='primary'
                                    onClick={onInputedRepeatPassword}
                                >下一步</Button>
                            </div>
                            <GobackBtn onClick={() => setSwiperIndex(1)} />
                        </div>
                    </Swiper.Item>
                    <Swiper.Item key={3}>
                        <div>
                            <div className='pt-8 pb-4 px-2'>
                                <Button
                                    type='primary'
                                    block
                                    onClick={onSubmit}
                                    disabled={isCreating}
                                >完成初始化</Button>
                            </div>
                            <div
                                className='
                                    flex items-center justify-center w-24 mx-auto py-1 pl-1 pr-2 rounded transition cursor-pointer
                                    text-slate-700 hover:bg-slate-300
                                '
                                onClick={() => setSwiperIndex(1)}
                            ><ArrowLeft className='inline mr-2' />返回</div>
                        </div>
                    </Swiper.Item>
                </Swiper>
            </div>
        </div>
    )
}

export default Register