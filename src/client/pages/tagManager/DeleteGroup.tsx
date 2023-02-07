import React, { useState } from 'react'
import { TagGroupListItem } from '@/types/tag'
import { useDeleteTagGroupMutation } from '../../services/tag'
import { Button } from '../../components/Button'
import { messageSuccess } from '../../utils/message'
import { DEFAULT_TAG_GROUP } from '@/constants'
import { Checkbox, Dialog } from 'react-vant'

export const useDeleteGroup = () => {
    // 要删除的分组信息
    const [deleteGroup, setDeleteGroup] = useState<TagGroupListItem | null>(null)
    // 是否删除子文章
    const [deleteChildren, setDeleteChildren] = useState(false)
    // 删除分组请求
    const [deleteTagGroup] = useDeleteTagGroupMutation()

    const onClickDelete = (item: TagGroupListItem) => {
        setDeleteGroup(item)
    }

    const onDelete = async() => {
        if (!deleteGroup) return
        await deleteTagGroup({
            id: deleteGroup._id,
            method: deleteChildren ? 'force' : 'move'
        })

        messageSuccess('分组删除成功')
    }

    const closeDeleteModal = () => {
        setDeleteGroup(null)
        setDeleteChildren(false)
    }

    const renderDeleteBtn = (item: TagGroupListItem) => {
        if (item._id === DEFAULT_TAG_GROUP) return null
        return (
            <Button
                type="danger"
                onClick={() => onClickDelete(item)}
            >删除分组</Button>
        )
    }

    const renderDeleteModal = () => {
        return (
            <Dialog
                visible={!!deleteGroup}
                title={`删除${deleteGroup?.title}`}
                showCancelButton
                confirmButtonText='删除'
                confirmButtonColor='red'
                cancelButtonText='取消'
                onConfirm={async () => {
                    await onDelete()
                    closeDeleteModal()
                }}
                onCancel={closeDeleteModal}
            >
                <div className='text-center'>删除后分组将无法恢复，请谨慎操作</div>
                <div className='text-center'>
                    {deleteChildren ? '子标签将会被删除' : '子标签将会被移动到默认分组'}
                </div>

                <Checkbox.Group value={deleteChildren ? ['deleteChildren'] : []}>
                    <div className='flex justify-center mt-4'>
                        删除下属标签 <Checkbox
                            name='deleteChildren'
                            onClick={() => setDeleteChildren(!deleteChildren)}
                        />
                    </div>
                </Checkbox.Group>
            </Dialog>
        )
    }

    return {
        renderDeleteBtn, renderDeleteModal
    }
}