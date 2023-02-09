import { useLazyQueryArticleListQuery } from '@/client/services/article'
import { List } from 'react-vant'
import { blurOnEnter } from '@/client/utils/input'
import { ArticleContentResp, QueryArticleReqData } from '@/types/article'
import React, { FC, useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PageContent, PageAction, ActionButton } from '../../layouts/PageWithAction'
import { useTagArea } from './TagArea'
import { STATUS_CODE } from '@/config'

const getQueryByParams = (params: URLSearchParams) => {
    const query: QueryArticleReqData = {}
    const tagIds = params.get('tagIds')
    const keyword = params.get('keyword') 
    if (keyword) query.keyword = keyword
    if (tagIds) query.tagIds = tagIds.split(',').map((id) => id.trim())
    return query
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
        query.page = pageRef.current

        console.log('发起查询', query)
        const resp = await fetchArticleList(query).unwrap()
        if (resp.code !== STATUS_CODE.SUCCESS || !resp.data) return

        if (resp.data.length <= 0) {
            setIsSearchFinished(true)
            console.log('🚀 ~ 搜索完成', query)
        }
        else {
            setArticleList(oldList => [...oldList, ...(resp.data || [])])
            console.log('🚀 ~ 搜索结果', query, resp.data)
        }
    }

    useEffect(() => {
        setIsSearchFinished(false)
        setArticleList([])
        pageRef.current = 1
        console.log('🚀 ~ 刷新 ', pageRef.current)
        searchArticle()
    }, [searchParams])

    const onTagChange = (tagIds: string[]) => {
        searchParams.set('tagIds', tagIds.join(','))
        setSearchParams(searchParams)
    }

    // 功能 - 标签选择
    const { renderTagSelectPanel } = useTagArea({ onTagChange })

    const onInputChange = () => {
        searchParams.set('keyword', keyword)
        setSearchParams(searchParams)
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
                </div>
            </Link>
        )
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
                        pageRef.current += 1
                        console.log('🚀 ~ 懒加载', pageRef.current)
                        await searchArticle()
                    }}
                >
                    {articleList.map(renderSearchItem)}
                </List>
            </div>
        </PageContent>
        <PageAction>
            <ActionButton onClick={() => navigate(-1)}>返回</ActionButton>
        </PageAction>
    </>)
}

export default Search