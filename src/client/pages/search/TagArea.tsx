import { Tag } from '@/client/components/Tag'
import Loading from '@/client/layouts/Loading'
import { useQueryTagGroup } from '@/client/services/tag'
import { TagGroupListItem, TagListItem } from '@/types/tag'
import { Collapse, Space } from 'antd'
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAllTagGroup, useGroupedTag } from '../tagManager/tagHooks'

interface Props {
    tagList?: TagListItem[]
    isTagLoading: boolean
    setCurrentPage: (page: number) => void
}

export const useTagArea = (props: Props) => {
    const { tagList, isTagLoading, setCurrentPage } = props
    const [searchParams, setSearchParams] = useSearchParams()
    // 当前选中的标签
    const [selectedTag, setSelectedTag] = useState<number[]>(() => {
        return searchParams.get('tagIds')?.split(',')?.map((id) => +id.trim()) || []
    })
    // 获取标签分组
    const { data: tagGroupResp, isLoading: isLoadingGroup } = useQueryTagGroup()
    // 分组列表
    const { tagGroups } = useAllTagGroup(tagGroupResp?.data)
    // 分好组的标签
    const { groupedTagDict } = useGroupedTag(tagList)
    // 当前展开的标签分组
    const [expandedTagGroup, setExpandedTagGroup] = useState<string[]>()

    const isTagSelected = (id: number) => {
        return selectedTag.includes(id)
    }

    useEffect(() => {
        setExpandedTagGroup(tagGroups.map((item) => item.id as unknown as string))
    }, [tagGroups])

    useEffect(() => {
        if (selectedTag.join(',') === searchParams.get('tagIds')) return

        if (selectedTag.length > 0) searchParams.set('tagIds', selectedTag.join(','))
        else searchParams.delete('tagIds')
        setSearchParams(searchParams)
    }, [selectedTag])
    

    const onSelectTag = (id: number) => {
        // 如果有了就删除，没有就添加
        const newTags = isTagSelected(id) ? selectedTag.filter(item => item !== id) : [...selectedTag, id]

        setSelectedTag(newTags)
        setCurrentPage(1)
    }

    const renderTag = (item: TagListItem) => {
        return (
            <Tag
                key={item.id}
                color={item.color}
                selected={isTagSelected(item.id)}
                onClick={() => onSelectTag(item.id)}
            >{item.title}</Tag>
        )
    }

    const renderGroupItem = (item: TagGroupListItem) => {
        const tags = groupedTagDict[item.id] || []
        return (
            <Collapse.Panel header={item.title} key={item.id}>
                <Space wrap size={[0, 8]}>
                    {tags.map(renderTag)}
                </Space>
            </Collapse.Panel>
        )
    }

    const renderTagSelectPanel = () => {
        if (isTagLoading) return <Loading tip='加载标签中...' />
        if (isLoadingGroup) return <Loading tip='加载分组中...' />

        return (
            <Collapse
                expandIconPosition="start"
                activeKey={expandedTagGroup}
                onChange={keys => setExpandedTagGroup(keys as string[])}
            >
                {tagGroups.map(renderGroupItem)}
            </Collapse>
        )
    }

    return { renderTagSelectPanel, selectedTag }
}