import React, { FC, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store'
import { addTab, setCurrentTab, TabItem } from '../store/tab'

const routeName: Record<string, string> = {
    '/setting': '设置',
}

/**
 * 根据路由自动设置选项卡
 */
export const useTabControl = () => {
    const location = useLocation()
    const tabList = useAppSelector(s => s.tab.tabList)
    const dispatch = useAppDispatch()

    useEffect(() => {
        const index = tabList.findIndex((item) => item.path === location.pathname)
        if (index === -1) {
            dispatch(addTab({
                path: location.pathname,
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

    useEffect(() => {
        dispatch(setCurrentTab(location.pathname))
    }, [location.pathname])

    const renderTabItem = (item: TabItem) => {
        return (
            <Link to={item.path} key={item.path}>
                <div
                    className={
                        'm-1 p-1 ' +
                        (item.path === currentTab ? 'bg-slate-600 text-white' : '')
                    }
                    onClick={() => dispatch(setCurrentTab(item.path))}
                >
                    {item.title}
                </div>
            </Link>
        )
    }

    return (
        <div className='flex'>
            {tabList.map(renderTabItem)}
        </div>
    )
}

export default TopTab