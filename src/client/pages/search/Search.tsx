import { useQueryArticleList } from '@/client/services/article'
import { SearchArticleDetail } from '@/types/article'
import React, { FC, useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PageContent, PageAction, ActionButton } from '../../layouts/PageWithAction'
import { useTagArea } from './TagArea'
import { useQueryTagList } from '@/client/services/tag'
import { useTagDict } from '../tagManager/tagHooks'
import { Tag } from '@/client/components/Tag'
import { Card, Col, Input, List, Row } from 'antd'
import { PAGE_SIZE } from '@/constants'

/**
 * 搜索页面
 * 可以通过关键字和标签来搜索笔记
 */
const SearchArticle: FC = () => {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    // 搜索关键字
    const [keyword, setKeyword] = useState(() => (searchParams.get('keyword') || ''))
    // 获取标签列表
    const { data: tagListResp, isLoading: isTagLoading } = useQueryTagList()
    // 标签映射
    const tagDict = useTagDict(tagListResp?.data || [])
    // 当前分页
    const [currentPage, setCurrentPage] = useState(1)
    // 功能 - 标签选择
    const { selectedTag, renderTagSelectPanel } = useTagArea({ setCurrentPage, isTagLoading, tagList: tagListResp?.data })
    // 搜索结果列表
    const { data: articleListResp, isLoading: isSearching } = useQueryArticleList({
        keyword,
        tagIds: selectedTag,
        page: currentPage,
    })

    useEffect(() => {
        if (keyword) searchParams.set('keyword', keyword)
        else searchParams.delete('keyword')
        setSearchParams(searchParams)
    }, [keyword])

    const renderTagItem = (tagId: number) => {
        const item = tagDict.get(tagId)
        if (!item) return null

        return (
            <Tag
                key={item.id}
                color={item.color}
            >{item.title}</Tag>
        )
    }

    const renderSearchItem = (item: SearchArticleDetail) => {
        const colorfulTitle = item.title.replace(keyword, `<span class='text-red-500'>${keyword}</span>`)
        const colorfulContent = item.content.replace(keyword, `<span class='text-red-500'>${keyword}</span>`)
        return (
            <Link to={`/article/${item.id}`} key={item.id}>
                <Card className='mb-4 hover:ring-2 ring-gray-300 transition-shadow' size='small'>
                    <Row justify="space-between">
                        <Col>
                            <div
                                className='font-bold text-lg'
                                dangerouslySetInnerHTML={{ __html: colorfulTitle }}
                            />
                        </Col>
                        <Col flex="1">
                            <div className='flex flex-warp flex-row-reverse mt-2'>
                                {item.tagIds?.map(renderTagItem)}
                            </div>
                        </Col>
                        <Col span={24}>
                            <div
                                className='text-sm text-gray-600 mt-2'
                                dangerouslySetInnerHTML={{ __html: colorfulContent }}
                            />
                        </Col>
                    </Row>
                </Card>
            </Link>
        )
    }

    return (<>
        <PageContent>
            <Input.Search
                placeholder="请输入标题或者正文，回车搜索"
                enterButton="搜索"
                size="large"
                onSearch={value => {
                    setKeyword(value)
                    setCurrentPage(1)
                }}
            />
            <Row gutter={[16, 16]} className="py-4">
                <Col span={18}>
                    <List
                        loading={isSearching}
                        dataSource={articleListResp?.data?.rows || []}
                        renderItem={renderSearchItem}
                        pagination={{
                            total: articleListResp?.data?.total || 0,
                            pageSize: PAGE_SIZE,
                            current: currentPage,
                            onChange: setCurrentPage,
                            align: 'center',
                        }}
                    />
                </Col>
                <Col span={6}>
                    {renderTagSelectPanel()}
                </Col>
            </Row>
        </PageContent>
        <PageAction>
            <ActionButton onClick={() => navigate(-1)}>返回</ActionButton>
        </PageAction>
    </>)
}

export default SearchArticle