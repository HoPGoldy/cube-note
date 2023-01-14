import React, { FC, useEffect } from 'react'
import { AppConfig } from '@/types/appConfig'
import { Loading } from 'react-vant'
import { useAppConfigQuery } from '../services/global'
import { useAppDispatch, useAppSelector } from '../store'
import { setAppConfig } from '../store/user'
import { Navigate, useLocation } from 'react-router-dom'

export const AppConfigContext = React.createContext<AppConfig | undefined>(undefined)

export const AppConfigProvider: FC = (props) => {
    const location = useLocation()
    const appConfig = useAppSelector(s => s.user.appConfig)
    const dispatch = useAppDispatch()

    const { data } = useAppConfigQuery()
    console.log('🚀 ~ file: AppConfigProvider.tsx:18 ~ appConfig', appConfig)

    useEffect(() => {
        if (!data) return
        dispatch(setAppConfig(data))
    }, [data])

    if (appConfig?.needInit && location.pathname !== '/init') {
        return <Navigate to="/init" replace />
    }

    return (
        <>{
            !appConfig 
                ? (<Loading className="my-24 dark:!text-gray-200" size="36px" vertical>
                    <span className='dark:text-gray-200'>加载中...</span>
                </Loading>)
                : props.children
        }</>
    )
}