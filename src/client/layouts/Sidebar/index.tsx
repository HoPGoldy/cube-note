import React, { FC } from 'react'
import { ArticleMenuItem, TabTypes } from '@/types/article'
import { useAppDispatch } from '@/client/store'
import { setCurrentMenu } from '@/client/store/menu'
import { Link, useNavigate } from 'react-router-dom'
import { TreeMenu } from '@/client//components/TreeMenu'
import { PlusOutlined, RollbackOutlined, LinkOutlined } from '@ant-design/icons'
import { Button, Segmented, Space } from 'antd'
import s from './styles.module.css'
import { EMPTY_CLASSNAME, tabOptions, TOOL_BTN_CLASSNAME, useMenu } from './useMenu'
import Loading from '../Loading'

export const Sidebar: FC = () => {
    const dispatch = useAppDispatch()
    const menu = useMenu()
    const navigate = useNavigate()

    const renderMenuItem = (item: ArticleMenuItem) => {
        return (
            <Link key={item.id} to={`/article/${item.id}`}>
                <div
                    className="hover:bg-slate-500 text-white text-left transition-all py-1 px-2 cursor-pointer rounded flex items-center justify-between"
                    title={item.title}
                >
                    <span className="truncate">{item.title}</span>
                    {item.color && (
                        <div
                            className="flex-shrink-0 w-3 h-3 bg-gray-300 rounded"
                            style={{ backgroundColor: item.color }}
                        />
                    )}
                </div>
            </Link>
        )
    }

    /** 渲染下属文章列表 */
    const renderSubMenu = () => {
        if (menu.linkLoading) {
            return <Loading tip='加载中...' className='my-8' />
        }
        const currentMenu = menu.articleLink?.data?.childrenArticles || []
        // console.log('🚀 ~ 下属文章列表', currentMenu)

        return (<>
            {menu.parentArticleIds && (
                <Link to={`/article/${menu.parentArticleIds[menu.parentArticleIds.length - 1]}`}>
                    {/* <Button ghost type="dashed" block>
                        返回{parentArticleTitle}
                    </Button> */}
                    <div
                        className={TOOL_BTN_CLASSNAME}
                    >
                        <RollbackOutlined /> 返回{menu.parentArticleTitle}
                    </div>
                </Link>
            )}
            {currentMenu.length === 0
                ? (<div className={EMPTY_CLASSNAME}>暂无子笔记</div>)
                : currentMenu.map(renderMenuItem)
            }

            <div
                className={TOOL_BTN_CLASSNAME}
                onClick={menu.createArticle}
            >
                <PlusOutlined /> 创建子笔记
            </div>
        </>)
    }

    /** 渲染相关文章列表 */
    const renderRelatedMenu = () => {
        if (menu.relatedLinkLoading) {
            return <Loading tip='加载中...' className='my-8' />
        }
        const currentMenu = menu.articleRelatedLink?.data?.relatedArticles || []
        // console.log('🚀 ~ 相关文章列表', currentMenu)

        if (currentMenu.length === 0) return <div className={EMPTY_CLASSNAME}>暂无相关笔记</div>
        return (<>
            {currentMenu.map(renderMenuItem)}
            <TreeMenu
                key="related-tree"
                value={menu.selectedRelatedArticleIds}
                onChange={menu.onUpdateRelatedArticleIds}
                onClickNode={menu.onUpdateRelatedList}
                treeData={menu.articleTree?.data?.children || []}
            >
                <div className={TOOL_BTN_CLASSNAME}>
                    <LinkOutlined /> 关联其他笔记
                </div>
            </TreeMenu>
        </>)
    }

    /** 渲染收藏文章列表 */
    const renderFavoriteMenu = () => {
        if (menu.favoriteLoading) {
            return <Loading tip='加载中...' className='my-8' />
        }
        const currentMenu = menu.articleFavorite?.data || []
        // console.log('🚀 ~ 收藏文章列表', currentMenu)

        return (<>
            {currentMenu.length === 0
                ? (<div className={EMPTY_CLASSNAME}>暂无收藏</div>)
                : currentMenu.map(renderMenuItem)
            }
        </>)
    }

    const renderCurrentMenu = () => {
        switch (menu.currentTab) {
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

    // const renderTabBtns = () => {
    //     return (
    //         <div className={s.tabArea}>
    //             {tabOptions.map(item => (
    //                 <div
    //                     className={[s.tabBtn, menu.currentTab === item.value ? s.selectedTabBtn : s.unselectedTabBtn].join(' ')}
    //                     onClick={() => dispatch(setCurrentMenu(item.value))}
    //                     key={item.value}
    //                 >{item.label}</div>
    //             ))}
    //         </div>
    //     )
    // }

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
                treeData={menu.articleTree?.data?.children || []}
                onClickNode={node => navigate(`/article/${node.value}`)}
            >
                <Button className={s.treeBtn} type="primary" block>笔记树</Button>
            </TreeMenu>
        </section>
    )
}
