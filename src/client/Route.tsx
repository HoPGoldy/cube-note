import React, { ComponentType, FC, lazy, MouseEventHandler, RefAttributes, Suspense } from 'react'
import { NavigateOptions, useNavigate, useRoutes, Link, LinkProps } from 'react-router-dom'
import Loading from './layouts/Loading'
import { LoginAuth } from './layouts/LoginAuth'
import { AppContainer } from './layouts/AppContainer'
import { useAppDispatch } from './store'
import { addTab } from './store/tab'
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
                { path: '/setting', element: lazyLoad(() => import('./pages/Setting')) },
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