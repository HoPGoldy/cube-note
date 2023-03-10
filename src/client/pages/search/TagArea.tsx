import { Tag } from '@/client/components/Tag'
import Loading from '@/client/layouts/Loading'
import { useGetTagGroupQuery } from '@/client/services/tag'
import { TagGroupListItem, TagListItem } from '@/types/tag'
import React, { useState } from 'react'
import { useAllTagGroup, useGroupedTag } from '../tagManager/tagHooks'

interface Props {
    onTagChange: (tagIds: number[]) => void
    tagList?: TagListItem[]
    isTagLoading: boolean
}

export const useTagArea = (props: Props) => {
    const { tagList, isTagLoading, onTagChange } = props
    // 当前选中的标签
    const [selectedTag, setSelectedTag] = useState<number[]>([])
    // 是否展开面板
    const [isExpand, setIsExpand] = useState(false)
    // 获取标签分组
    const { data: tagGroupResp, isLoading: isLoadingGroup } = useGetTagGroupQuery()
    // 分组列表
    const { tagGroups } = useAllTagGroup(tagGroupResp?.data)
    // 分好组的标签
    const { groupedTagDict } = useGroupedTag(tagList)

    const isTagSelected = (id: number) => {
        return selectedTag.includes(id)
    }

    const onSelectTag = (id: number) => {
        if (!isExpand) return
        // 如果有了就删除，没有就添加
        const newTags = isTagSelected(id) ? selectedTag.filter(item => item !== id) : [...selectedTag, id]

        onTagChange(newTags)
        setSelectedTag(newTags)
    }

    const renderTag = (item: TagListItem) => {
        return (
            <Tag
                key={item.id}
                label={item.title}
                id={item.id}
                color={item.color}
                selected={isExpand ? isTagSelected(item.id) : true}
                onClick={onSelectTag}
            />
        )
    }

    const renderGroupItem = (item: TagGroupListItem) => {
        const tags = groupedTagDict[item.id] || []
        return (
            <div key={item.id} className='bg-slate-300 m-2'>
                <div>{item.title}</div>

                <div className='flex flex-wrap min-h-[50px]'>
                    {tags.map(renderTag)}
                </div>
            </div>
        )
    }

    const hasSubTag = (item: TagGroupListItem) => {
        const tags = groupedTagDict[item.id] || []
        return tags.length > 0
    }

    const renderTagSelectPanel = () => {
        if (!isExpand && isTagLoading) return <Loading tip='加载标签中...' />

        if (!isExpand) {
            const selectedTags = tagList?.filter(item => isTagSelected(item.id)) || []
            return (
                <div
                    className='flex flex-wrap min-h-[50px]'
                    onClick={() => setIsExpand(true)}
                >
                    {selectedTags.length === 0
                        ? <div>点击展开标签面板</div>
                        : selectedTags.map(renderTag)
                    }
                </div>
            )
        }

        if (isExpand && isLoadingGroup) return <Loading tip='加载分组中...' />

        return (
            <div>
                {tagGroups.filter(hasSubTag).map(renderGroupItem)}
                <div onClick={() => setIsExpand(false)}>收起标签面板</div>
            </div>
        )
    }

    return { renderTagSelectPanel }
}