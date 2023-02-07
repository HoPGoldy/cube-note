import React, { FC, useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageContent, PageAction, ActionButton } from '../layouts/PageWithAction'
import { SetTagGroup, SetTagGroupReqData, TagGroupListItem, TagListItem } from '@/types/tag'
import { useAddTagGroupMutation, useDeleteTagsMutation, useGetTagGroupQuery, useGetTagListQuery, useSetTagGroupMutation, useUpdateTagGroupMutation } from '../services/tag'
import Loading from '../layouts/Loading'
import groupBy from 'lodash/groupBy'
import cloneDeep from 'lodash/cloneDeep'
import debounce from 'lodash/debounce'
import { ReactSortable } from 'react-sortablejs'
import { Button } from '../components/Button'
import dayjs from 'dayjs'
import { Tag } from '../components/Tag'
import { blurOnEnter } from '../utils/input'
import { STATUS_CODE } from '@/config'
import { messageError, messageSuccess, messageWarning } from '../utils/message'
import { DEFAULT_TAG_GROUP } from '@/constants'

type FontendTagListItem = TagListItem & {
    id: string
}

/**
 * 获取哪些标签的分组发生了变化
 */
const diffTagGroup = (oldGroup: TagListItem[], newGroup: Record<string, FontendTagListItem[]>) => {
    // 找出两者的不同
    const oldTagMap = new Map<string, TagListItem>(
        oldGroup.map(item => [item._id, item])
    )
    const changedGroups: SetTagGroup[] = []
    for (const key in newGroup) {
        const changedGroup: SetTagGroup = {
            groupId: key,
            ids: [],
        }
        newGroup[key].forEach(item => {
            const oldTag = oldTagMap.get(item._id)
            if (!oldTag) return
            if (oldTag.groupId === key || (!oldTag.groupId && key === DEFAULT_TAG_GROUP)) return
            changedGroup.ids.push(item._id)
        })
        changedGroups.push(changedGroup)
    }

    return changedGroups.filter(item => item.ids.length > 0)
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
    // 是否为删除模式
    const [isDeleteMode, setIsDeleteMode] = useState(false)
    // 当前选中的删除标签
    const [selectedDeleteTagIds, setSelectedDeleteTagIds] = useState<string[]>([])
    // 新增分组
    const [addTagGroup] = useAddTagGroupMutation()
    // 标题输入框引用
    const titleInputRefs = useRef<Record<string, HTMLInputElement>>({})
    // 更新分组标题
    const [updateGroup] = useUpdateTagGroupMutation()
    // 更新标签分组
    const [updateTagGroup] = useSetTagGroupMutation()
    // 删除标签
    const [deleteTag] = useDeleteTagsMutation()

    useEffect(() => {
        if (!tagGroupResp?.data) return
        const groups = cloneDeep(tagGroupResp.data)
        groups.unshift({
            _id: DEFAULT_TAG_GROUP,
            title: '未分组'
        })
        setTagGroups(groups)
    }, [tagGroupResp?.data])

    useEffect(() => {
        if (!tagListResp?.data) return

        const groupedTagList = groupBy(
            tagListResp.data.map(item => ({ ...item, id: item._id })),
            item => item.groupId ? item.groupId : DEFAULT_TAG_GROUP
        )
        setGroupedTagDict(groupedTagList)
    }, [tagListResp?.data])

    const onSaveConfig = async () => {
        const oldTagGroup = tagListResp?.data
        if (!oldTagGroup) {
            console.error('找不到 oldTagGroup，更新失败')
            return
        }

        // 找出两者的不同
        const changedGroups = diffTagGroup(oldTagGroup, groupedTagDict)
        if (changedGroups.length === 0) {
            messageWarning('没有需要更新的内容')
            return
        }
        const resp = await updateTagGroup({ changeList: changedGroups }).unwrap()
        if (resp.code !== STATUS_CODE.SUCCESS) {
            messageError(resp.msg || '更新失败，请稍后再试')
            return
        }
        messageSuccess('更新成功')
    }

    const onUpdateTagList = (groupId: string, tags: FontendTagListItem[]) => {
        const newTagDict = {
            ...groupedTagDict,
            [groupId]: tags
        }

        setGroupedTagDict(newTagDict)
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

    const onStartDelete = () => {
        setIsDeleteMode(true)
    }

    const onSaveDelete = async () => {
        if (selectedDeleteTagIds.length === 0) {
            messageWarning('请选择需要删除的标签')
            return
        }
        const resp = await deleteTag({ ids: selectedDeleteTagIds }).unwrap()
        if (resp.code !== STATUS_CODE.SUCCESS) return

        messageSuccess('删除成功')
        setIsDeleteMode(false)
        setSelectedDeleteTagIds([])
    }

    const onCancelDelete = () => {
        setIsDeleteMode(false)
        setSelectedDeleteTagIds([])
    }

    const onClickTag = (item: FontendTagListItem) => {
        if (isDeleteMode) {
            setSelectedDeleteTagIds([...selectedDeleteTagIds, item._id])
        }
    }

    const renderTagItem = (item: FontendTagListItem) => {
        const selected = isDeleteMode && selectedDeleteTagIds.includes(item._id)
        return (
            <Tag
                key={item._id}
                label={item.title}
                id={item._id}
                color={selected ? 'red' : item.color}
                selected={isDeleteMode ? selected : true}
                onClick={() => onClickTag(item)}
            />
        )
    }

    const renderTagGroupItem = (item: TagGroupListItem) => {
        const tags = groupedTagDict[item._id] || []
        return (
            <div key={item._id} className='bg-slate-300 m-2'>
                <input
                    ref={ins => ins && (titleInputRefs.current[item._id] = ins)}
                    className='font-bold'
                    value={item.title}
                    onChange={e => onTitleChange(e.target.value, item)}
                    onKeyUp={blurOnEnter}
                    onBlur={() => onSaveGroupTitle(item)}
                    disabled={item._id === DEFAULT_TAG_GROUP}
                />
                <Button type="danger" onClick={onStartDelete}>删除分组</Button>
                <ReactSortable<FontendTagListItem>
                    list={tags}
                    setList={list => onUpdateTagList(item._id, list)}
                    className='flex flex-wrap min-h-[50px]'
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
            <Button onClick={onAddGroup}>新增分组</Button>
            {isDeleteMode
                ? (<>
                    <Button onClick={onCancelDelete}>放弃删除</Button>
                    <Button type='danger' onClick={onSaveDelete}>确认删除</Button>
                </>)
                : <Button onClick={onStartDelete}>删除标签</Button>
            }
            <Button onClick={onSaveConfig}>保存</Button>
            {tagGroups.map(renderTagGroupItem)}
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