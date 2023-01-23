import React, { FC, useEffect, useMemo } from 'react'
import { Menu } from 'antd'
import { ArticleMenuItem, ArticleTreeNode, TabTypes } from '@/types/article'
import { useAppDispatch, useAppSelector } from '../store'
import { setCurrentMenu, setLinkMenu } from '../store/menu'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { DesktopArea } from './Responsive'
import { useGetArticleLinkQuery, useGetArticleTreeQuery } from '../services/article'
import { cloneDeep } from 'lodash'

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

const menuItemClassname = 'cursor-pointer hover:bg-slate-600 dark:hover:bg-slate-800 border border-white p-2 my-2'

export const Sidebar: FC = () => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const currentTab = useAppSelector(s => s.menu.currentTab)
    const currentMenu = useAppSelector(s => s.menu[currentTab])
    const currentRootArticleId = useAppSelector(s => s.user.userInfo?.rootArticleId)
    const currentArticleId = useAppSelector(s => s.menu.currentArticleId)
    const { data: articleTree, isLoading: treeLoading } = useGetArticleTreeQuery(currentRootArticleId, {
        skip: !currentRootArticleId
    })
    const { data: articleLink, isLoading: linkLoading } = useGetArticleLinkQuery(currentArticleId, {
        skip: !currentArticleId
    })

    const selectedKeys = useMemo(() => [currentArticleId], [currentArticleId])

    const onClickTreeItem = ({ key }: { key: string }) => {
        navigate(`/article/${key}`)
    }

    useEffect(() => {
        if (!articleLink || !articleLink.data) return
        dispatch(setLinkMenu(articleLink.data))
    }, [articleLink])

    const treeMenuItems = useMemo(() => {
        if (!articleTree) return []
        const rootItem: ArticleTreeNode = {
            key: currentRootArticleId || '',
            label: '笔记树',
            children: cloneDeep(articleTree.data)
        }

        // 递归，为每一个有 children 的节点添加 onTitleClick 方法
        const addOnTitleClick = (item: ArticleTreeNode) => {
            if (item.children) {
                item.onTitleClick = onClickTreeItem
                item.children.forEach(addOnTitleClick)
            }
        }
        addOnTitleClick(rootItem)
        
        return [rootItem]
    }, [articleTree])

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
            <div
                key={item._id}
                className={menuItemClassname}
                onClick={() => onClickTreeItem({ key: item._id })}
            >
                {item.title}
            </div>
        )
    }

    return (
        <DesktopArea>
            <section className='
                p-4 transition h-screen overflow-y-auto 
                bg-slate-700 dark:bg-slate-900 text-white dark:text-gray-200
            '>
                <div className='flex justify-between font-bold text-lg h-[44px] leading-[44px]'>
                    <Link to='/'>
                        <div>记事本</div>
                    </Link>
                    <Link to='/setting'>
                        <div>设置</div>
                    </Link>
                </div>
                <div className='flex justify-between'>
                    {tabOptions.map(renderTabBtn)}
                </div>
                <div>
                    {(currentMenu || []).map(renderMenuItem)}
                    <div className={menuItemClassname + ' text-center'}>创建</div>
                </div>
                <Menu
                    mode='vertical'
                    theme='light'
                    items={treeMenuItems}
                    onClick={onClickTreeItem}
                    selectedKeys={selectedKeys}
                />
            </section>
        </DesktopArea>
    )
}
