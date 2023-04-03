import React, { FC, useEffect } from 'react'
import { ArticleMenuItem, ArticleTreeNode, TabTypes } from '@/types/article'
import { useAppDispatch, useAppSelector } from '@/client/store'
import { setCurrentMenu, setParentArticle, setRelatedArticleIds } from '@/client/store/menu'
import { Link, useNavigate } from 'react-router-dom'
import {
    useAddArticle, useQueryArticleTree,
    useQueryArticleFavorite, useSetArticleRelated, useQueryArticleLink, useQueryArticleRelated
} from '@/client//services/article'
import { TreeMenu } from '@/client//components/TreeMenu'
import { PlusOutlined, RollbackOutlined, LinkOutlined } from '@ant-design/icons'
import { Button, Segmented, Space } from 'antd'
import s from './styles.module.css'

const tabOptions = [
    { label: '子级', value: TabTypes.Sub },
    { label: '相关', value: TabTypes.Related },
    { label: '收藏', value: TabTypes.Favorite },
]

/** 列表中工具按钮的样式 */
const TOOL_BTN_CLASSNAME = 'hover:bg-slate-500 bg-slate-600 transition-all p-1 cursor-pointer rounded truncate text-gray-200'

/** 空列表占位符样式 */
const EMPTY_CLASSNAME = 'text-gray-300 py-4 cursor-default'

export const Sidebar: FC = () => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const currentTab = useAppSelector(s => s.menu.currentTab)
    const currentRootArticleId = useAppSelector(s => s.user.userInfo?.rootArticleId)
    const currentArticleId = useAppSelector(s => s.menu.currentArticleId)
    const parentArticleId = useAppSelector(s => s.menu.parentArticleId)
    const parentArticleTitle = useAppSelector(s => s.menu.parentArticleTitle)
    const selectedRelatedArticleIds = useAppSelector(s => s.menu.selectedRelatedArticleIds)
    // 获取左下角菜单树
    const { data: articleTree } = useQueryArticleTree(currentRootArticleId)
    // 获取当前文章的子级、父级文章
    const { data: articleLink, isLoading: linkLoading } = useQueryArticleLink(
        currentArticleId,
        !!(currentArticleId && currentTab === TabTypes.Sub)
    )
    // 获取当前文章的相关文章
    const { data: articleRelatedLink, isLoading: relatedLinkLoading } = useQueryArticleRelated(
        currentArticleId,
        !!(currentArticleId && currentTab === TabTypes.Related)
    )
    // 获取收藏文章
    const { data: articleFavorite, isLoading: favoriteLoading } = useQueryArticleFavorite(
        currentTab === TabTypes.Favorite
    )
    // 新增文章
    const { mutateAsync: addArticle } = useAddArticle()
    // 更新选中的相关文章
    const { mutateAsync: setArticleRelated } = useSetArticleRelated()

    const onClickTreeItem = (item: ArticleTreeNode) => {
        navigate(`/article/${item.value}`, { state: { tabTitle: item.title }})
    }

    const createArticle = async () => {
        if (!currentArticleId) {
            console.error('当前文章不存在，无法创建子文章')
            return
        }

        const title = `新笔记-${new Date().toLocaleString()}`
        const resp = await addArticle({
            title,
            content: '',
            parentId: currentArticleId,
        })
        if (!resp.data) return

        navigate(`/article/${resp.data}?mode=edit`)
    }

    // 选择了新的文章，把该文章的父级信息更新到 store
    useEffect(() => {
        if (!articleLink || !articleLink.data) return
        dispatch(setParentArticle(articleLink.data))
    }, [articleLink])

    // 查看了相关条目，更新信息，让设置相关条目时可以高亮已关联文章
    useEffect(() => {
        if (!articleRelatedLink || !articleRelatedLink.data) return
        dispatch(setRelatedArticleIds(articleRelatedLink.data.relatedArticles.map(item => item.id)))
    }, [articleRelatedLink])

    // 把选择的相关文章更新到后端
    const onUpdateRelatedArticleIds = (newIds: number[]) => {
        dispatch(setRelatedArticleIds(newIds))
    }

    // 把选择的相关文章更新到相关列表
    const onUpdateRelatedList = (newItem: ArticleTreeNode) => {
        const currentLinks = articleRelatedLink?.data?.relatedArticles || []
        // 如果已经关联了，就移除
        const hasLink = currentLinks.find(item => item.id === newItem.value)

        if (!currentArticleId) {
            console.error('当前文章不存在，无法更新相关文章')
            return
        }

        setArticleRelated({
            link: !hasLink,
            fromArticleId: currentArticleId,
            toArticleId: newItem.value
        })
    }

    const renderMenuItem = (item: ArticleMenuItem) => {
        return (
            <div
                key={item.id}
                className="hover:bg-slate-500 text-left transition-all py-1 px-2 cursor-pointer rounded truncate"
                title={item.title}
                onClick={() => onClickTreeItem({ value: item.id, title: item.title })}
            >
                {item.title}
            </div>
        )
    }

    /** 渲染下属文章列表 */
    const renderSubMenu = () => {
        if (linkLoading) return <div className="my-8">加载中...</div>
        const currentMenu = articleLink?.data?.childrenArticles || []
        // console.log('🚀 ~ 下属文章列表', currentMenu)

        return (<>
            {parentArticleId && (
                <Link to={`/article/${parentArticleId}`}>
                    {/* <Button ghost type="dashed" block>
                        返回{parentArticleTitle}
                    </Button> */}
                    <div
                        className={TOOL_BTN_CLASSNAME}
                    >
                        <RollbackOutlined /> 返回{parentArticleTitle}
                    </div>
                </Link>
            )}
            {currentMenu.length === 0
                ? (<div className={EMPTY_CLASSNAME}>暂无笔记</div>)
                : currentMenu.map(renderMenuItem)
            }

            <div
                className={TOOL_BTN_CLASSNAME}
                onClick={createArticle}
            >
                <PlusOutlined /> 创建子笔记
            </div>
        </>)
    }

    const renderRelatedMenuList = () => {
        if (relatedLinkLoading) return <div className="my-8">加载中...</div>
        const currentMenu = articleRelatedLink?.data?.relatedArticles || []
        // console.log('🚀 ~ 相关文章列表', currentMenu)

        if (currentMenu.length === 0) return <div className={EMPTY_CLASSNAME}>暂无相关笔记</div>
        return currentMenu.map(renderMenuItem)
    }

    /** 渲染相关文章列表 */
    const renderRelatedMenu = () => {
        return (<>
            {renderRelatedMenuList()}
            <TreeMenu
                key="related-tree"
                value={selectedRelatedArticleIds}
                onChange={onUpdateRelatedArticleIds}
                onClickNode={onUpdateRelatedList}
                treeData={articleTree?.data || []}
            >
                <div
                    className={TOOL_BTN_CLASSNAME}
                    onClick={createArticle}
                >
                    <LinkOutlined /> 关联其他笔记
                </div>
            </TreeMenu>
        </>)
    }

    /** 渲染收藏文章列表 */
    const renderFavoriteMenu = () => {
        if (favoriteLoading) return <div className="my-8">加载中...</div>
        const currentMenu = articleFavorite?.data || []
        // console.log('🚀 ~ 收藏文章列表', currentMenu)

        return (<>
            {currentMenu.length === 0
                ? (<div className={EMPTY_CLASSNAME}>暂无收藏</div>)
                : currentMenu.map(renderMenuItem)
            }
        </>)
    }

    const renderCurrentMenu = () => {
        switch (currentTab) {
        case TabTypes.Sub:
            return renderSubMenu()
        case TabTypes.Related:
            return renderRelatedMenu()
        case TabTypes.Favorite:
            return renderFavoriteMenu()
        default:
            return null
        }
    }

    const renderTabBtns = () => {
        return (
            <div className={s.tabArea}>
                {tabOptions.map(item => (
                    <div
                        className={[s.tabBtn, currentTab === item.value ? s.selectedTabBtn : s.unselectedTabBtn].join(' ')}
                        onClick={() => dispatch(setCurrentMenu(item.value))}
                        key={item.value}
                    >{item.label}</div>
                ))}
            </div>
        )
    }

    return (
        <section className={s.sideberBox}>
            <Segmented
                className={s.tabBox}
                options={tabOptions}
                block
                onChange={value => dispatch(setCurrentMenu(value as TabTypes))}
            />
            {/* {renderTabBtns()} */}

            <div className="flex-grow flex-shrink overflow-y-auto noscrollbar overflow-x-hidden" style={{ marginTop: '0.5rem', flexGrow: 1 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    {renderCurrentMenu()}
                </Space>
            </div>
            <TreeMenu
                treeData={articleTree?.data || []}
                onClickNode={onClickTreeItem}
            >
                <Button className={s.treeBtn} type="primary" block>侧边栏菜单</Button>
            </TreeMenu>
        </section>
    )
}
