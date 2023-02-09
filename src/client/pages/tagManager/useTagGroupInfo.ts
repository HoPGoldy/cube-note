import { useGetTagGroupQuery, useGetTagListQuery } from '@/client/services/tag'
import { TagGroupListItem, TagListItem } from '@/types/tag'
import { useEffect, useState } from 'react'
import cloneDeep from 'lodash/cloneDeep'
import groupBy from 'lodash/groupBy'
import { DEFAULT_TAG_GROUP } from '@/constants'

/**
 * 获取包含 “未分组” 选项的标签分组列表
 */
export const useAllTagGroup = () => {
    // 获取标签分组
    const { data: tagGroupResp, isLoading } = useGetTagGroupQuery()
    // 当前显示的分组（会多一个未分组，用来存放所有没有设置分组的标签）
    const [tagGroups, setTagGroups] = useState<TagGroupListItem[]>([])

    useEffect(() => {
        if (!tagGroupResp?.data) return
        const groups = cloneDeep(tagGroupResp.data)
        groups.unshift({
            _id: DEFAULT_TAG_GROUP,
            title: '未分组'
        })
        setTagGroups(groups)
    }, [tagGroupResp?.data])

    return { tagGroupResp, isLoading, tagGroups, setTagGroups }
}

/**
 * 获取分组后的标签列表
 */
export const useGroupedTag = () => {
    // 获取标签列表
    const { data: tagListResp, isLoading } = useGetTagListQuery()
    // 分组后的标签列表
    const [groupedTagDict, setGroupedTagDict] = useState<Record<string, TagListItem[]>>({})

    useEffect(() => {
        if (!tagListResp?.data) return
        const groupedTagList = groupBy(
            tagListResp.data,
            item => item.groupId ? item.groupId : DEFAULT_TAG_GROUP
        )
        setGroupedTagDict(groupedTagList)
    }, [tagListResp?.data])

    return { tagListResp, isLoading, groupedTagDict, setGroupedTagDict }
}