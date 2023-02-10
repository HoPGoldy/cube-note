import { Cross } from '@react-vant/icons'
import React, { FC, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store'
import { addTab, removeTab, setCurrentTab, TabItem, updateCurrentTab } from '../store/tab'

const routeName: Record<string, string> = {
    '/setting': '设置',
    '/about': '关于',
    '/tags': '标签管理',
    '/search': '搜索',
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
        const payload = {
            path: location.pathname,
            search: location.search,
            // 优先用路由状态里传递的 tabTitle，这样可以直接显示出名字
            // 不然就要等待页面加载完成后，页面组件里主动设置名字了，这样会有延迟
            title: location.state?.tabTitle || routeName[location.pathname] || '新标签页'
        }

        const action = index === -1 ? addTab(payload) : updateCurrentTab(payload)
        dispatch(action)

        dispatch(setCurrentTab(location.pathname))
    }, [location.pathname, location.search])
}

interface Props {
    className?: string
}

/**
 * PC 端最上面的选项卡组件
 */
const TopTab: FC<Props> = (props) => {
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
        navigate(item.path + item.search)
    }

    const onCloseTab = (e: React.MouseEvent, item: TabItem) => {
        e.stopPropagation()
        dispatch(removeTab([item.path]))

        // 如果关闭的是当前选项卡，跳转到上一个选项卡
        if (item.path !== location.pathname || tabList.length <= 1) return
        const prevTab = tabList.find((item) => item.path === item.path)
        if (!prevTab) return

        navigate(prevTab.path + prevTab.search)
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
                {tabList.length > 1 && item.path === currentTab && (
                    <Cross className='inline' onClick={e => onCloseTab(e, item)} />
                )}
            </div>
        )
    }

    return (
        <div className={'flex ' + props?.className}>
            {tabList.map(renderTabItem)}
        </div>
    )
}

export default TopTab