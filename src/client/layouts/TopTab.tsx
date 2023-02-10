import { Cross } from '@react-vant/icons'
import React, { FC, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ReactSortable } from 'react-sortablejs'
import { useAppDispatch, useAppSelector } from '../store'
import { addTab, removeTab, setCurrentTab, setTabList, TabItem, updateCurrentTab } from '../store/tab'

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

        const index = tabList.findIndex((item) => item.id === location.pathname)

        // 标签没有就新建
        if (index === -1) {
            dispatch(addTab({
                id: location.pathname,
                search: location.search,
                // 优先用路由状态里传递的 tabTitle，这样可以直接显示出名字
                // 不然就要等待页面加载完成后，页面组件里主动设置名字了，这样会有延迟
                title: location.state?.tabTitle || routeName[location.pathname] || '新标签页'
            }))
        }
        // 有的话就把最新的搜索参数更新进去
        else {
            dispatch(updateCurrentTab({ search: location.search }))
        }

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
        if (item.id === currentTab) return
        dispatch(setCurrentTab(item.id))
        navigate(item.id + item.search)
    }

    const onCloseTab = (e: React.MouseEvent, closedItem: TabItem) => {
        e.stopPropagation()
        dispatch(removeTab([closedItem.id]))

        // 如果关闭的是当前选项卡，跳转到上一个选项卡
        if (closedItem.id !== location.pathname || tabList.length <= 1) return
        const prevTab = tabList.find(item => item.id === item.id)
        if (!prevTab) return

        navigate(prevTab.id + prevTab.search)
    }

    const renderTabItem = (item: TabItem) => {
        return (
            <div
                className={
                    'm-1 p-1 cursor-pointer ' +
                    (item.id === currentTab ? 'bg-slate-600 text-white' : '')
                }
                key={item.id}
                onClick={() => onClickTab(item)}
            >
                {item.title}
                {tabList.length > 1 && item.id === currentTab && (
                    <Cross className='inline' onClick={e => onCloseTab(e, item)} />
                )}
            </div>
        )
    }

    return (
        <ReactSortable
            className={'flex ' + props?.className}
            list={tabList}
            setList={newList => dispatch(setTabList(newList))}
        >
            {tabList.map(renderTabItem)}
        </ReactSortable>
    )
}

export default TopTab