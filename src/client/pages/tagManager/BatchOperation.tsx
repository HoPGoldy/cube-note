import React, { useState } from 'react'
import { useDeleteTagsMutation } from '../../services/tag'
import { Button } from '../../components/Button'
import { messageSuccess, messageWarning } from '../../utils/message'
import { STATUS_CODE } from '@/config'

export const useBatchOperation = () => {
    // 是否处于批量操作模式
    const [isBatch, setIsBatch] = useState(false)
    // 当前选中的标签
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
    // 删除标签
    const [deleteTag] = useDeleteTagsMutation()

    const isTagSelected = (id: string) => {
        return selectedTagIds.includes(id)
    }

    const onSelectTag = (id: string) => {
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
                onClick={() => setIsBatch(true)}
            >批量移动分组</Button>
            <Button
                onClick={() => setIsBatch(true)}
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

    return {
        isBatch, isTagSelected, renderBatchBtn, onSelectTag
    }
}