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
import { Button, Segmented, Space } from 'antd'
import s from './styles.module.css'

const tabOptions = [
    { label: '子级', value: TabTypes.Sub },
    { label: '相关', value: TabTypes.Related },
    { label: '收藏', value: TabTypes.Favorite },
]

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
            <Button
                block
                ghost
                key={item.id}
                onClick={() => onClickTreeItem({ value: item.id, title: item.title })}
            >
                {item.title}
            </Button>
        )
    }

    const renderSubMenu = () => {
        if (linkLoading) return <div>加载中...</div>
        const currentMenu = articleLink?.data?.childrenArticles || []

        return (<>
            {parentArticleId && (
                <Link to={`/article/${parentArticleId}`} style={{ width: '100%' }}>
                    <Button ghost type="dashed" block>
                        返回{parentArticleTitle}
                    </Button>
                </Link>
            )}
            {currentMenu.length === 0
                ? (<div>暂无笔记</div>)
                : currentMenu.map(renderMenuItem)
            }
            <Button ghost block type="dashed" onClick={createArticle}>
                创建子笔记
            </Button>
        </>)
    }

    const renderRelatedMenuList = () => {
        if (relatedLinkLoading) return <div>加载中...</div>
        const currentMenu = articleRelatedLink?.data?.relatedArticles || []

        if (currentMenu.length === 0) return <div>暂无相关笔记</div>
        return currentMenu.map(renderMenuItem)
    }

    const renderRelatedMenu = () => {
        return (<>
            {renderRelatedMenuList()}
            <TreeMenu
                key={currentArticleId}
                value={selectedRelatedArticleIds}
                onChange={onUpdateRelatedArticleIds}
                onClickNode={onUpdateRelatedList}
                treeData={articleTree?.data || []}
            >
                <Button ghost block type="dashed">关联其他笔记</Button>
            </TreeMenu>
        </>)
    }   

    const renderFavoriteMenu = () => {
        if (favoriteLoading) return <div>加载中...</div>
        const currentMenu = articleFavorite?.data || []

        return (<>
            {currentMenu.length === 0
                ? (<div>暂无收藏</div>)
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

    return (
        <section className={s.sideberBox}>
            <Segmented
                options={tabOptions}
                block
                onChange={value => dispatch(setCurrentMenu(value as TabTypes))}
            />

            <div style={{ marginTop: '0.5rem', flexGrow: 1 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    {renderCurrentMenu()}
                </Space>
            </div>
            <TreeMenu
                treeData={articleTree?.data || []}
                onClickNode={onClickTreeItem}
            >
                <Button type="primary" block>侧边栏菜单</Button>
            </TreeMenu>
        </section>
    )
}
