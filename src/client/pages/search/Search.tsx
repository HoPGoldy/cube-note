import { useLazyQueryArticleListQuery } from '@/client/services/article'
import { List } from 'react-vant'
import { blurOnEnter } from '@/client/utils/input'
import { ArticleContentResp, QueryArticleReqData } from '@/types/article'
import React, { FC, useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PageContent, PageAction, ActionButton } from '../../layouts/PageWithAction'
import { useTagArea } from './TagArea'
import { STATUS_CODE } from '@/config'
import { useGetTagListQuery } from '@/client/services/tag'
import { useTagDict } from '../tagManager/tagHooks'
import { Tag } from '@/client/components/Tag'

const getQueryByParams = (params: URLSearchParams) => {
    const query: QueryArticleReqData = {}
    const tagIds = params.get('tagIds')
    const keyword = params.get('keyword') 
    if (keyword) query.keyword = keyword
    if (tagIds) query.tagIds = tagIds.split(',').map((id) => id.trim())
    return query
}

/**
 * 搜索条件是否为空
 */
const isQueryEmpty = (query: QueryArticleReqData) => {
    return !query.keyword && (!query.tagIds || query.tagIds.length <= 0)
}

/**
 * 搜索页面
 * 可以通过关键字和标签来搜索笔记
 */
const Search: FC = () => {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    // 搜索关键字
    const [keyword, setKeyword] = useState(searchParams.get('keyword') || '')
    // 获取标签列表
    const { data: tagListResp, isLoading: isTagLoading } = useGetTagListQuery()
    // 标签映射
    const tagDict = useTagDict(tagListResp?.data || [])
    // 当前展示的搜索结果列表
    const [articleList, setArticleList] = useState<ArticleContentResp[]>([])
    // 是否搜索完成
    const [isSearchFinished, setIsSearchFinished] = useState(true)
    // 当前搜索的页码
    const pageRef = useRef(1)
    // 发起搜索
    const [fetchArticleList] = useLazyQueryArticleListQuery()

    const searchArticle = async () => {
        const query = getQueryByParams(searchParams)
        if (isQueryEmpty(query)) {
            setIsSearchFinished(true)
            return
        }
        query.page = pageRef.current

        const resp = await fetchArticleList(query).unwrap()
        if (resp.code !== STATUS_CODE.SUCCESS || !resp.data) return

        // 没有更多数据了
        if (resp.data.length <= 0) setIsSearchFinished(true)
        // 追加数据到列表
        else setArticleList(oldList => [...oldList, ...(resp.data || [])])
    }

    useEffect(() => {
        setIsSearchFinished(false)
        setArticleList([])
        pageRef.current = 1
    }, [searchParams])

    const onTagChange = (tagIds: string[]) => {
        searchParams.set('tagIds', tagIds.join(','))
        setSearchParams(searchParams)
    }

    // 功能 - 标签选择
    const { renderTagSelectPanel } = useTagArea({ onTagChange, isTagLoading, tagList: tagListResp?.data })

    const onInputChange = () => {
        searchParams.set('keyword', keyword)
        setSearchParams(searchParams)
    }

    const renderTagItem = (tagId: string) => {
        const item = tagDict.get(tagId)
        if (!item) return null

        return (
            <Tag
                key={item._id}
                label={item.title}
                id={item._id}
                color={item.color}
            />
        )
    }

    const renderSearchItem = (item: ArticleContentResp) => {
        const colorfulTitle = item.title.replace(keyword, `<span class='text-red-500'>${keyword}</span>`)
        const colorfulContent = item.content.replace(keyword, `<span class='text-red-500'>${keyword}</span>`)
        return (
            <Link to={`/article/${item._id}`} key={item._id}>
                <div className='p-4 border-b border-gray-200 cursor-pointer hover:bg-slate-300'>
                    <div
                        className='font-bold'
                        dangerouslySetInnerHTML={{ __html: colorfulTitle }}
                    />
                    <div
                        className='text-sm text-gray-600'
                        dangerouslySetInnerHTML={{ __html: colorfulContent }}
                    />
                    <div className='flex flex-warp'>
                        {item.tagIds.map(renderTagItem)}
                    </div>
                </div>
            </Link>
        )
    }

    const renderBottomTip = () => {
        const query = getQueryByParams(searchParams)
        if (isQueryEmpty(query)) {
            return <div>输入关键字或者选择标签来搜索内容</div>
        }

        if (!isSearchFinished) return null

        if (articleList.length > 0) {
            return <div>到底了</div>
        }

        return <div>未找到相关内容</div>
    }

    return (<>
        <PageContent>
            <div className='w-full p-4'>
                <input
                    className='font-bold w-full box-border'
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    onKeyUp={blurOnEnter}
                    onBlur={onInputChange}
                    placeholder='搜索关键字'
                />
            </div>
            <div>
                {renderTagSelectPanel()}
            </div>
            <div>
                <List
                    finished={isSearchFinished}
                    errorText='请求失败，点击重新加载'
                    onLoad={async () => {
                        await searchArticle()
                        pageRef.current += 1
                    }}
                >
                    {articleList.map(renderSearchItem)}
                </List>
                {renderBottomTip()}
            </div>
        </PageContent>
        <PageAction>
            <ActionButton onClick={() => navigate(-1)}>返回</ActionButton>
        </PageAction>
    </>)
}

export default Search