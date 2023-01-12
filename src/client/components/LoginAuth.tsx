import React, { FC, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { setToken } from '../services/base'
import { useAppSelector } from '../store'

export const useLogout = () => {
    /**
     * 统一登出方法
     * 会清除所有的数据
     */
    return () => {
        setToken(null)
    }
}

export const LoginAuth: FC = ({ children }) => {
    const userInfo = useAppSelector(s => s.user.userInfo)
    const logout = useLogout()

    useEffect(() => {
        if (userInfo) return
        logout()
    }, [userInfo])

    if (!userInfo) {
        return (
            <Navigate to="/login" replace />
        )
    }

    return (
        <>{children}</>
    )
}