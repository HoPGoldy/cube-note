import { STATUS_CODE } from '@/config'
import { LoginSuccessResp } from '@/types/user'
import React, { FC, useEffect, PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import { useQueryUserInfo } from '../services/user'
import { stateCurrentArticleId } from '../store/menu'
import { login, stateUser, stateUserToken } from '../store/user'
import Loading from './Loading'
import { useAtomValue, useSetAtom } from 'jotai'

export const LoginAuth: FC<PropsWithChildren> = ({ children }) => {
    const userInfo = useAtomValue(stateUser)
    const token = useAtomValue(stateUserToken)
    const setCurrentArticleId = useSetAtom(stateCurrentArticleId)
    const { data: userInfoResp } = useQueryUserInfo(!!(token && !userInfo))

    useEffect(() => {
        if (!userInfoResp || userInfoResp.code !== STATUS_CODE.SUCCESS) return
        const userInfo = userInfoResp.data as LoginSuccessResp
        login(userInfo)
        setCurrentArticleId(userInfo.rootArticleId)
    }, [userInfoResp])

    if ((!userInfo && !token) || userInfoResp?.code === 401) {
        return (
            <Navigate to="/login" replace />
        )
    }

    if (!userInfo && token) {
        return (
            <Loading tip="正在加载用户信息..." className="mt-24" />
        )
    }

    return (
        <>{children}</>
    )
}