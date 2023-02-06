import React, { FC, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageContent, PageAction, ActionButton } from '../layouts/PageWithAction'
import { SetTagGroupReqData, TagGroupListItem, TagListItem } from '@/types/tag'
import { useAddTagGroupMutation, useGetTagGroupQuery, useGetTagListQuery, useSetTagGroupMutation, useUpdateTagGroupMutation } from '../services/tag'
import Loading from '../layouts/Loading'
import groupBy from 'lodash/groupBy'
import cloneDeep from 'lodash/cloneDeep'
import { ReactSortable } from 'react-sortablejs'
import { Button } from '../components/Button'
import dayjs from 'dayjs'
import { Tag } from '../components/Tag'
import { blurOnEnter } from '../utils/input'

type FontendTagListItem = TagListItem & {
    id: string
}

/**
 * 标签管理
 * 可以新增标签分组，设置标签颜色，移动标签到指定分组
 */
const TagManager: FC = () => {
    const navigate = useNavigate()
    // 获取标签分组
    const { data: tagGroupResp, isLoading } = useGetTagGroupQuery()
    // 获取标签列表
    const { data: tagListResp, isLoading: isLoadingTagList } = useGetTagListQuery()
    // 当前显示的分组（会多一个未分组，用来存放所有没有设置分组的标签）
    const [tagGroups, setTagGroups] = useState<TagGroupListItem[]>([])
    // 分组后的标签列表
    const [groupedTagDict, setGroupedTagDict] = useState<Record<string, FontendTagListItem[]>>({})
    // 标签分组更新信息
    // 会监听 groupedTagDict，当其变化时会读取这个值来更新后端
    // 不能直接放在 onUpdateTagList 里，因为 sortablejs 的会在拖动时触发这个回调，导致频繁更新
    const tagGroupUpdateInfoRef = useRef<SetTagGroupReqData>()
    // 新增分组
    const [addTagGroup] = useAddTagGroupMutation()
    // 标题输入框引用
    const titleInputRefs = useRef<Record<string, HTMLInputElement>>({})
    // 更新分组标题
    const [updateGroup] = useUpdateTagGroupMutation()
    // 更新标签分组
    const [updateTagGroup] = useSetTagGroupMutation()

    useEffect(() => {
        if (!tagGroupResp?.data) return
        const groups = cloneDeep(tagGroupResp.data)
        groups.unshift({
            _id: 'default',
            title: '未分组'
        })
        setTagGroups(groups)
    }, [tagGroupResp?.data])

    useEffect(() => {
        if (!tagListResp?.data) return

        const groupedTagList = groupBy(
            tagListResp.data.map(item => ({ ...item, id: item._id })),
            item => item.groupId ? item.groupId : 'default'
        )
        setGroupedTagDict(groupedTagList)
    }, [tagListResp?.data])

    useEffect(() => {
        if (!tagGroupUpdateInfoRef.current) return

        updateTagGroup(tagGroupUpdateInfoRef.current)
        tagGroupUpdateInfoRef.current = undefined
    }, [groupedTagDict])

    const onUpdateTagList = (groupId: string, tags: FontendTagListItem[]) => {
        const newTagDict = {
            ...groupedTagDict,
            [groupId]: tags
        }

        setGroupedTagDict(newTagDict)
        tagGroupUpdateInfoRef.current = {
            groupId,
            ids: tags.map(item => item._id)
        }
    }

    const onAddGroup = async () => {
        const title = `新分组 ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`
        const resp = await addTagGroup({ title }).unwrap()
        if (!resp.data) return

        const timer = setTimeout(() => {
            const input = titleInputRefs.current[resp.data as string]
            input?.focus()
            input?.setSelectionRange(0, title.length)
        }, 200)

        return () => clearTimeout(timer)
    }

    const onTitleChange = (value: string, item: TagGroupListItem) => {
        item.title = value
        setTagGroups([...tagGroups])
    }

    const onSaveGroupTitle = async (item: TagGroupListItem) => {
        updateGroup({ id: item._id, title: item.title }) 
    }

    const renderTagItem = (item: FontendTagListItem) => {
        return (
            <Tag
                key={item._id}
                label={item.title}
                id={item._id}
                color={item.color}
                // selected={editing ? value.includes(item._id) : true}
                // onClick={() => onClickTag(item._id)}
            />
        )
    }

    const renderTagGroupItem = (item: TagGroupListItem) => {
        const tags = groupedTagDict[item._id] || []
        return (
            <div key={item._id} className='bg-slate-300 m-2 h-20'>
                <input
                    ref={ins => ins && (titleInputRefs.current[item._id] = ins)}
                    className='font-bold'
                    value={item.title}
                    onChange={e => onTitleChange(e.target.value, item)}
                    onKeyUp={blurOnEnter}
                    onBlur={() => onSaveGroupTitle(item)}
                />
                <ReactSortable<FontendTagListItem>
                    list={tags}
                    setList={list => onUpdateTagList(item._id, list)}
                    className='flex flex-wrap'
                    group='tagGroup'
                >
                    {tags.map(renderTagItem)}
                </ReactSortable>
            </div>
        )
    }

    const renderContent = () => {
        if (isLoading || isLoadingTagList) return <Loading />

        return (<>
            {tagGroups.map(renderTagGroupItem)}
            <Button onClick={onAddGroup}>新增分组</Button>
        </>)
    }

    return (<>
        <PageContent>
            {renderContent()}
        </PageContent>
        <PageAction>
            <ActionButton onClick={() => navigate(-1)}>返回</ActionButton>
        </PageAction>
    </>)
}

export default TagManager