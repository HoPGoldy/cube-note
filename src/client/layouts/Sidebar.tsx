import React, { FC, useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plus, Gem, Coupon, Lock, Setting } from '@react-vant/icons'
import { ArticleMenuItem, TabTypes } from '@/types/article'
import { useAppDispatch, useAppSelector } from '../store'
import { setCurrentTab } from '../store/menu'

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
                onClick={() => dispatch(setCurrentTab(item.type))}
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
            <header className='text-center font-bold text-lg h-[44px] leading-[44px]'>
                记事本
            </header>
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
