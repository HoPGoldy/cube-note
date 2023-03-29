import React, { ComponentType, FC, lazy, Suspense } from 'react'
import { useRoutes } from 'react-router-dom'
import Loading from './layouts/Loading'
import { LoginAuth } from './layouts/LoginAuth'
import { AppContainer } from './layouts/AppContainer'
import Search from './pages/search/Search'
import Article from './pages/article/Article'
import Entry from './pages/JumpToDefaultDataEntry'

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
                { index: true, element: <Entry /> },
                { path: '/article/:articleId', element: <Article /> },
                { path: '/search', element: <Search /> },
                { path: '/tags', element: lazyLoad(() => import('./pages/tagManager/TagManager')) },
                { path: '/setting', element: lazyLoad(() => import('./pages/userSetting')) },
                // 修改密码
                { path: '/changePassword', element: lazyLoad(() => import('./pages/changePassword')) },
                { path: '/about', element: lazyLoad(() => import('./pages/About')) },
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
