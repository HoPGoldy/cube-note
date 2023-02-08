import React, { FC, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageContent, PageAction, ActionButton } from '../../layouts/PageWithAction'
import { FontendTagListItem, TagGroupListItem, TagStorage } from '@/types/tag'
import { useAddTagGroupMutation, useAddTagMutation, useGetTagGroupQuery, useGetTagListQuery, useUpdateTagGroupMutation } from '../../services/tag'
import Loading from '../../layouts/Loading'
import groupBy from 'lodash/groupBy'
import cloneDeep from 'lodash/cloneDeep'
import { Button } from '../../components/Button'
import dayjs from 'dayjs'
import { AddTag, Tag } from '../../components/Tag'
import { blurOnEnter } from '../../utils/input'
import { DEFAULT_TAG_GROUP } from '@/constants'
import { useDeleteGroup } from './DeleteGroup'
import { useSetGroupColor } from './SetGroupColor'
import { useTagConfig } from './TagConfig'
import { useBatchOperation } from './BatchOperation'

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
    // 新增分组
    const [addTagGroup, { isLoading: isAddingGroup }] = useAddTagGroupMutation()
    // 标题输入框引用
    const titleInputRefs = useRef<Record<string, HTMLInputElement>>({})
    // 更新分组标题
    const [updateGroup] = useUpdateTagGroupMutation()
    // 新增标签
    const [addTag, { isLoading: isAddingTag }] = useAddTagMutation()
    // 功能 - 删除分组
    const { onClickDeleteGroup, renderDeleteModal } = useDeleteGroup()
    // 功能 - 设置分组内标签颜色
    const { renderColorPicker, onClickSetGroupColor } = useSetGroupColor({ groupedTagDict })
    // 功能 - 标签详情管理
    const { renderTagDetail, showTagDetail } = useTagConfig()
    // 功能 - 批量操作
    const { isBatch, isTagSelected, onSelectTag, renderBatchBtn } = useBatchOperation()

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

    const onClickTag = (item: FontendTagListItem) => {
        if (isBatch) onSelectTag(item._id)
        else showTagDetail(item)
    }

    const onClickAddBtn = async (title: string, groupId: string) => {
        if (!title) return

        const data: TagStorage = { title, color: '#404040' }
        if (groupId !== DEFAULT_TAG_GROUP) data.groupId = groupId

        const resp = await addTag(data).unwrap()
        if (!resp?.data) return
    }

    const renderTagItem = (item: FontendTagListItem) => {
        return (
            <Tag
                key={item._id}
                label={item.title}
                id={item._id}
                color={item.color}
                selected={isBatch ? isTagSelected(item._id) : undefined}
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

                {!isBatch && <Button
                    type="danger"
                    onClick={() => onClickDeleteGroup(item)}
                >删除分组</Button>}

                {!isBatch && <Button
                    onClick={() => onClickSetGroupColor(item)}
                >设置分组颜色</Button>}

                <div className='flex flex-wrap min-h-[50px]'>
                    {tags.map(renderTagItem)}
                    {!isBatch && <AddTag
                        onFinish={title => onClickAddBtn(title, item._id)}
                        loading={isAddingTag}
                    />}
                </div>
            </div>
        )
    }

    const renderContent = () => {
        if (isLoading || isLoadingTagList) return <Loading />

        return (<>
            <Button onClick={onAddGroup} loading={isAddingGroup}>新增分组</Button>
            {renderBatchBtn()}
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

        {renderDeleteModal()}
        {renderColorPicker()}
        {renderTagDetail()}
    </>)
}

export default TagManager