import React, { ComponentType, FC, lazy, Suspense } from 'react'
import { useRoutes } from 'react-router-dom'
import Loading from './components/Loading'
import { LoginAuth } from './components/LoginAuth'
import { AppContainer } from './components/AppContainer'

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
                { path: '/group', element: lazyLoad(() => import('./pages/CertificateList')) },
                { path: '/addGroup', element: lazyLoad(() => import('./pages/AddGroup')) },
                { path: '/securityEntry', element: lazyLoad(() => import('./pages/SecurityMonitor')) },
                { path: '/LogRequest', element: lazyLoad(() => import('./pages/LogRequest')) },
                { path: '/LogLogin', element: lazyLoad(() => import('./pages/LogLogin')) },
                { path: '/LogCertificate', element: lazyLoad(() => import('./pages/LogCertificate')) },
                { path: '/NoticeList', element: lazyLoad(() => import('./pages/NoticeList')) },
                { path: '/Setting', element: lazyLoad(() => import('./pages/Setting')) },
                { path: '/About', element: lazyLoad(() => import('./pages/About')) },
                { path: '/ChangePassword', element: lazyLoad(() => import('./pages/ChangePassword')) },
                { path: '/OtpManage', element: lazyLoad(() => import('./pages/OtpManage')) },
                { path: '/GroupManage', element: lazyLoad(() => import('./pages/GroupManage')) },
                { path: '/CreatePwdSetting', element: lazyLoad(() => import('./pages/CreatePwdSetting')) },
            ],
            element: (
                <LoginAuth>
                    <AppContainer />
                </LoginAuth>
            )
        },
        {
            path: '/login',
            element: lazyLoad(() => import('./pages/Login'))
        }
    ])

    return routes
}
