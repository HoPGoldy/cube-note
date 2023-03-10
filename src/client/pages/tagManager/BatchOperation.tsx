import React, { useState } from 'react'
import { useDeleteTagsMutation, useSetTagColorMutation, useSetTagGroupMutation } from '../../services/tag'
import { Button } from '../../components/Button'
import { messageSuccess, messageWarning } from '../../utils/message'
import { STATUS_CODE } from '@/config'
import { ColorPicker } from '@/client/components/ColorPicker'
import { GroupPicker } from '@/client/components/GroupPicker'

export const useBatchOperation = () => {
    // 是否处于批量操作模式
    const [isBatch, setIsBatch] = useState(false)
    // 当前选中的标签
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
    // 删除标签
    const [deleteTag] = useDeleteTagsMutation()
    // 批量设置标签颜色
    const [updateTagColor] = useSetTagColorMutation()
    // 批量设置标签分组
    const [updateTagGroup] = useSetTagGroupMutation()
    // 是否显示颜色选择弹窗
    const [showColorPicker, setShowColorPicker] = useState(false)
    // 是否显示分组选择弹窗
    const [showGroupPicker, setShowGroupPicker] = useState(false)

    const isTagSelected = (id: number) => {
        return selectedTagIds.includes(id)
    }

    const onSelectTag = (id: number) => {
        // 如果有了就删除，没有就添加
        if (isTagSelected(id)) setSelectedTagIds(selectedTagIds.filter(item => item !== id))
        else setSelectedTagIds([...selectedTagIds, id])
    }

    const onSaveDelete = async () => {
        if (selectedTagIds.length === 0) {
            messageWarning('请选择需要删除的标签')
            return
        }
        const resp = await deleteTag({ ids: selectedTagIds }).unwrap()
        if (resp.code !== STATUS_CODE.SUCCESS) return

        messageSuccess('删除成功')
        setSelectedTagIds([])
    }

    const onSaveColor = async (color: string) => {
        if (selectedTagIds.length === 0) {
            messageWarning('请选择需要设置颜色的标签')
            return
        }

        const resp = await updateTagColor({ ids: selectedTagIds, color }).unwrap()
        if (resp.code !== STATUS_CODE.SUCCESS) return

        messageSuccess('设置成功')
        setSelectedTagIds([])
    }

    const onSaveGroup = async (groupId: number) => {
        if (selectedTagIds.length === 0) {
            messageWarning('请选择需要设置分组的标签')
            return
        }

        const resp = await updateTagGroup({ ids: selectedTagIds, groupId }).unwrap()
        if (resp.code !== STATUS_CODE.SUCCESS) return

        messageSuccess('设置成功')
        setSelectedTagIds([])
    }

    const renderBatchBtn = () => {
        if (!isBatch) {
            return (
                <Button
                    onClick={() => setIsBatch(true)}
                >批量操作</Button>
            )
        }

        return (<>
            <Button
                onClick={() => setShowGroupPicker(true)}
            >批量移动分组</Button>
            <Button
                onClick={() => setShowColorPicker(true)}
            >批量设置颜色</Button>
            <Button
                onClick={onSaveDelete}
            >批量删除</Button>
            <Button
                onClick={() => {
                    setIsBatch(false)
                    setSelectedTagIds([])
                }}
            >退出批量操作</Button>
        </>)
    }

    const renderBatchModal = () => {
        return (<>
            <ColorPicker
                onChange={onSaveColor}
                visible={showColorPicker}
                onClose={() => setShowColorPicker(false)}
            />
            <GroupPicker
                onChange={group => onSaveGroup(group.id)}
                visible={showGroupPicker}
                onClose={() => setShowGroupPicker(false)}
            />
        </>)
    }

    return {
        isBatch, isTagSelected, renderBatchBtn, renderBatchModal, onSelectTag
    }
}