import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react'
import { Menu, TreeSelect } from 'antd'
import { ArticleMenuItem, ArticleTreeNode, TabTypes } from '@/types/article'
import { useAppDispatch, useAppSelector } from '../store'
import { setCurrentMenu, setParentArticle } from '../store/menu'
import { Link, useNavigate } from 'react-router-dom'
import { DesktopArea } from './Responsive'
import { useAddArticleMutation, useGetArticleLinkQuery, useGetArticleTreeQuery } from '../services/article'
import { cloneDeep } from 'lodash'
import { SideMenu } from '../components/SideMenu'

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
    const currentRootArticleId = useAppSelector(s => s.user.userInfo?.rootArticleId)
    const currentArticleId = useAppSelector(s => s.menu.currentArticleId)
    const parentArticleId = useAppSelector(s => s.menu.parentArticleId)
    const parentArticleTitle = useAppSelector(s => s.menu.parentArticleTitle)

    const { data: articleTree, isLoading: treeLoading } = useGetArticleTreeQuery(currentRootArticleId, {
        skip: !currentRootArticleId
    })
    const { data: articleLink, isFetching: linkLoading } = useGetArticleLinkQuery(currentArticleId, {
        skip: !currentArticleId,
    })
    // 新增文章
    const [addArticle, { isLoading: addingArticle }] = useAddArticleMutation()
    // 菜单树需要的树形数据结构
    const treeMenuItems = useMemo(() => {
        // if (!articleTree) return []
        // const rootItem: ArticleTreeNode = {
        //     key: currentRootArticleId || '',
        //     title: '笔记树',
        //     children: cloneDeep(articleTree.data)
        // }

        // // 递归，为每一个有 children 的节点添加 onTitleClick 方法
        // const addOnTitleClick = (item: ArticleTreeNode) => {
        //     if (item.children) {
        //         item.children.forEach(addOnTitleClick)
        //     }
        // }
        // addOnTitleClick(rootItem)
        
        return articleTree?.data || []
    }, [articleTree])

    const selectedKeys = useMemo(() => [currentArticleId], [currentArticleId])

    const onClickTreeItem = (item: { key: string, title?: string, keyPath?: string[] }) => {
        // let title = item.title
        // if (!title && treeMenuItems[0]) {
        //     // 使用 keypath reduce 获取到 title
        //     const keyPath = item.keyPath || []
        //     const node = keyPath.reduce((acc, cur) => {
        //         if (!acc) return acc
        //         return acc.children?.find(c => c.key === cur) || { children: [] }
        //     }, treeMenuItems[0])
        // }
        navigate(`/article/${item.key}`, { state: { tabTitle: item.title }})
    }

    const createArticle = async () => {
        const title = `新笔记-${new Date().toLocaleString()}`
        const resp = await addArticle({
            title,
            content: '',
            parentId: currentArticleId
        }).unwrap()
        if (!resp.data) return

        navigate(`/article/${resp.data}?mode=edit`)
    }

    useEffect(() => {
        if (!articleLink || !articleLink.data) return
        dispatch(setParentArticle(articleLink.data))
    }, [articleLink])

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
                onClick={() => onClickTreeItem({ key: item._id, title: item.title })}
            >
                {item.title}
            </div>
        )
    }

    const renderSubMenu = () => {
        if (linkLoading) return <div className='text-center'>加载中...</div>
        const currentMenu = articleLink?.data?.childrenArticles || []

        return (<>
            {parentArticleId && (
                <Link to={`/article/${parentArticleId}`}>
                    <div
                        className={menuItemClassname + ' text-center'}
                    >返回{parentArticleTitle}</div>
                </Link>
            )}
            {currentMenu.length === 0
                ? (<div className='text-center'>暂无笔记</div>)
                : currentMenu.map(renderMenuItem)
            }
            <div
                className={menuItemClassname + ' text-center'}
                onClick={createArticle}
            >创建子笔记</div>
        </>)
    }

    const renderLinkMenu = () => {
        return (<>
            <Link to={`/articleLink/${currentArticleId}`} state={{ tabTitle: '123321' }}>
                <div className={menuItemClassname + ' text-center'}>
                    关联其他笔记
                </div>
            </Link>
        </>)
    }

    const renderFavoriteMenu = () => {
        return (<>666</>)
    }

    const renderCurrentMenu = () => {
        switch (currentTab) {
        case TabTypes.Sub:
            return renderSubMenu()
        case TabTypes.Link:
            return renderLinkMenu()
        case TabTypes.Favorite:
            return renderFavoriteMenu()
        default:
            return null
        }
    }

    const [value, setValue] = useState<string>()

    const onChange = (newValue: string, label: ReactNode[]) => {
        console.log('🚀 ~ file: Sidebar.tsx:172 ~ onChange ~ newValue', newValue, label)
        setValue(newValue)
    }

    return (
        <DesktopArea>
            <section className='
                p-4 transition h-screen overflow-y-auto flex flex-col flex-nowrap 
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
                <div className='mt-2 flex-grow'>
                    {renderCurrentMenu()}
                </div>
                <SideMenu />
            </section>
        </DesktopArea>
    )
}
