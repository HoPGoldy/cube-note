import React, { ComponentType, FC, lazy, MouseEventHandler, RefAttributes, Suspense } from 'react'
import { NavigateOptions, useNavigate, useRoutes, Link, LinkProps } from 'react-router-dom'
import Loading from './layouts/Loading'
import { LoginAuth } from './layouts/LoginAuth'
import { AppContainer } from './layouts/AppContainer'
import { useAppDispatch } from './store'
import { addTab } from './store/tab'

const lazyLoad = (compLoader: () => Promise<{ default: ComponentType<any> }>) => {
    const Comp = lazy(compLoader)
    return (
        <Suspense fallback={<Loading />}>
            <Comp />
        </Suspense>
    )
}

export const Routes: FC = () => {
    const routes = useRoutes([
        {
            path: '/',
            children: [
                { index: true, element: lazyLoad(() => import('./pages/JumpToDefaultDataEntry')) },
                { path: '/article/:articleId', element: lazyLoad(() => import('./pages/Article')) },
                // { path: '/addGroup', element: lazyLoad(() => import('./pages/AddGroup')) },
                // { path: '/LogRequest', element: lazyLoad(() => import('./pages/LogRequest')) },
                // { path: '/LogLogin', element: lazyLoad(() => import('./pages/LogLogin')) },
                // { path: '/LogCertificate', element: lazyLoad(() => import('./pages/LogCertificate')) },
                // { path: '/NoticeList', element: lazyLoad(() => import('./pages/NoticeList')) },
                { path: '/Setting', element: lazyLoad(() => import('./pages/Setting')) },
                // { path: '/About', element: lazyLoad(() => import('./pages/About')) },
                // { path: '/ChangePassword', element: lazyLoad(() => import('./pages/ChangePassword')) },
                // { path: '/OtpManage', element: lazyLoad(() => import('./pages/OtpManage')) },
                // { path: '/GroupManage', element: lazyLoad(() => import('./pages/GroupManage')) },
                // { path: '/CreatePwdSetting', element: lazyLoad(() => import('./pages/CreatePwdSetting')) },
            ],
            element: (
                <LoginAuth>
                    <AppContainer />
                </LoginAuth>
            )
        },
        { path: '/login', element: lazyLoad(() => import('./pages/Login')) },
        { path: '/init', element: lazyLoad(() => import('./pages/CreateAdmin')) },
    ])

    return routes
}

export interface NavigateFunction {
    (title: string, to: string, options?: NavigateOptions): void;
    (delta: number): void;
}

export const useNamedNavigate = (): NavigateFunction => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    return (title: string | number, to?: string, options?: NavigateOptions) => {
        if (typeof title === 'string') {
            if (!to) {
                console.log('to is undefined')
                return
            }
            dispatch(addTab({
                title,
                path: to
            }))
            navigate(to, options)
        }
        else {
            navigate(title)
        }
    }
}

export const NamedLink: FC<{ title: string } & LinkProps & RefAttributes<HTMLAnchorElement>> = (props) => {
    const dispatch = useAppDispatch()

    const onClick: MouseEventHandler<HTMLAnchorElement> = e => {
        props.onClick?.(e)
        dispatch(addTab({
            title: props.title,
            path: props.to as string
        }))
    }

    return <Link {...props} onClick={onClick} />
}