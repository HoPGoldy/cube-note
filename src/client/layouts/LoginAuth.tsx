import { STATUS_CODE } from '@/config'
import { LoginSuccessResp } from '@/types/user'
import React, { FC, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useLazyGetUserInfoQuery } from '../services/user'
import { useAppDispatch, useAppSelector } from '../store'
import { login } from '../store/user'
import Loading from './Loading'

export const LoginAuth: FC = ({ children }) => {
    const userInfo = useAppSelector(s => s.user.userInfo)
    const token = useAppSelector(s => s.user.token)
    const dispatch = useAppDispatch()
    const [getUserInfo, { data: userInfoResp }] = useLazyGetUserInfoQuery()

    useEffect(() => {
        if (!token || userInfo) return
        getUserInfo()
    }, [token])

    useEffect(() => {
        if (!userInfoResp || userInfoResp.code !== STATUS_CODE.SUCCESS) return
        dispatch(login(userInfoResp.data as LoginSuccessResp))
    }, [userInfoResp])

    if ((!userInfo && !token) || userInfoResp?.code === 401) {
        return (
            <Navigate to="/login" replace />
        )
    }

    if (!userInfo && token) {
        return (
            <Loading tip="正在加载用户信息..." />
        )
    }

    return (
        <>{children}</>
    )
}