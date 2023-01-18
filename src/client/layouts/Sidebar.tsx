import React, { FC } from 'react'
import { ArticleMenuItem, TabTypes } from '@/types/article'
import { useAppDispatch, useAppSelector } from '../store'
import { setCurrentMenu } from '../store/menu'
import { Link } from 'react-router-dom'

interface TabDetail {
    name: string
    type: TabTypes
    prefix?: () => JSX.Element
}

const tabOptions: TabDetail[] = [
    { name: '下属条目', type: TabTypes.Sub },
    { name: '相关条目', type: TabTypes.Link },
    { name: '收藏条目', type: TabTypes.Favorite },
]

export const Sidebar: FC = () => {
    const currentTab = useAppSelector(s => s.menu.currentTab)
    const currentMenu = useAppSelector(s => s.menu[currentTab])
    const dispatch = useAppDispatch()

    const renderTabBtn = (item: TabDetail) => {
        return (
            <div
                className={
                    'backdrop-brightness-75 cursor-pointer ' +
                    (currentTab === item.type ? 'bg-slate-600 dark:bg-slate-800' : 'bg-slate-500 dark:bg-slate-700')
                }
                key={item.name}
                onClick={() => dispatch(setCurrentMenu(item.type))}
            >{item.name}</div>
        )
    }

    const renderMenuItem = (item: ArticleMenuItem) => {
        return (
            <div key={item.id}>{item.title}</div>
        )
    }

    return (
        <section className='
            p-4 transition h-screen overflow-y-auto 
            bg-slate-700 dark:bg-slate-900 text-white dark:text-gray-200
        '>
            <div className='text-center font-bold text-lg h-[44px] leading-[44px]'>
                记事本
                <Link to='/setting'>
                    <div>设置</div>
                </Link>
            </div>
            <div className='flex justify-between'>
                {tabOptions.map(renderTabBtn)}
            </div>
            <div>
                {(currentMenu || []).map(renderMenuItem)}
                <div>创建</div>
            </div>
            {/* {(groupList || []).map(formatGroupItem).map(renderGroupItem)} */}
            {/* <div className='my-4 mx-4 mr-8 bg-slate-400 h-[1px]'></div> */}
            {/* {STATIC_TABS.map(renderGroupItem)} */}
        </section>
    )
}
