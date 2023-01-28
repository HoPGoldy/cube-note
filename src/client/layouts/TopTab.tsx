import React, { FC, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store'
import { addTab, setCurrentTab, TabItem } from '../store/tab'

const routeName: Record<string, string> = {
    '/setting': '设置',
    '/about': '关于',
}

/**
 * 根据路由自动设置选项卡
 */
export const useTabControl = () => {
    const location = useLocation()
    const tabList = useAppSelector(s => s.tab.tabList)
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (location.pathname === '/') return

        const index = tabList.findIndex((item) => item.path === location.pathname)
        if (index === -1) {
            dispatch(addTab({
                path: location.pathname,
                search: location.search,
                title: routeName[location.pathname] || '新标签页'
            }))
        }

        dispatch(setCurrentTab(location.pathname))
    }, [location.pathname])
}

/**
 * PC 端最上面的选项卡组件
 */
const TopTab: FC = () => {
    const location = useLocation()
    const tabList = useAppSelector(s => s.tab.tabList)
    const currentTab = useAppSelector(s => s.tab.currentTabIndex)
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        dispatch(setCurrentTab(location.pathname))
    }, [location.pathname])

    const onClickTab = (item: TabItem) => {
        if (item.path === currentTab) return
        dispatch(setCurrentTab(item.path))
        navigate(item.path)
    }

    const renderTabItem = (item: TabItem) => {
        return (
            <div
                className={
                    'm-1 p-1 cursor-pointer ' +
                    (item.path === currentTab ? 'bg-slate-600 text-white' : '')
                }
                key={item.path}
                onClick={() => onClickTab(item)}
            >
                {item.title}
            </div>
        )
    }

    return (
        <div className='flex'>
            {tabList.map(renderTabItem)}
        </div>
    )
}

export default TopTab