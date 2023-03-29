import React, { useState } from 'react'
import { useBatchDeleteTag, useBatchSetTagGroup, useBatchSetTagColor } from '../../services/tag'
import { Button, Dropdown } from 'antd'
import { messageSuccess, messageWarning } from '../../utils/message'
import { STATUS_CODE } from '@/config'
import { ColorPicker } from '@/client/components/ColorPicker'
import { SwapOutlined, BgColorsOutlined, DeleteOutlined, DiffOutlined, ExportOutlined } from '@ant-design/icons'
import { TagGroupListItem } from '@/types/tag'

interface Props {
    tagGroups: TagGroupListItem[]
}

export const useBatchOperation = (props: Props) => {
    // 是否处于批量操作模式
    const [isBatch, setIsBatch] = useState(false)
    // 当前选中的标签
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
    // 删除标签
    const { mutateAsync: deleteTag } = useBatchDeleteTag()
    // 批量设置标签颜色
    const { mutateAsync: updateTagColor } = useBatchSetTagColor()
    // 批量设置标签分组
    const { mutateAsync: updateTagGroup } = useBatchSetTagGroup()
    // 是否显示颜色选择弹窗
    const [showColorPicker, setShowColorPicker] = useState(false)

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
        const resp = await deleteTag({ ids: selectedTagIds })
        if (resp.code !== STATUS_CODE.SUCCESS) return

        messageSuccess('删除成功')
        setSelectedTagIds([])
    }

    const onSaveColor = async (color: string) => {
        if (selectedTagIds.length === 0) {
            messageWarning('请选择需要设置颜色的标签')
            return
        }

        const resp = await updateTagColor({ ids: selectedTagIds, color })
        if (resp.code !== STATUS_CODE.SUCCESS) return

        messageSuccess('设置成功')
        setSelectedTagIds([])
    }

    const onSaveGroup = async (groupId: number) => {
        if (selectedTagIds.length === 0) {
            messageWarning('请选择需要设置分组的标签')
            return
        }

        const resp = await updateTagGroup({ ids: selectedTagIds, groupId })
        if (resp.code !== STATUS_CODE.SUCCESS) return

        messageSuccess('设置成功')
        setSelectedTagIds([])
    }

    // 批量转移分组的待选项
    const moveGroupItems = props.tagGroups.map(item => {
        return {
            key: item.id,
            label: (
                <div onClick={() => onSaveGroup(item.id)}>
                    {item.title}
                </div>
            )
        }
    })

    const renderBatchBtn = () => {
        if (!isBatch) {
            return (
                <Button
                    onClick={() => setIsBatch(true)}
                    icon={<DiffOutlined />}
                >批量操作</Button>
            )
        }

        return (<>
            <Button
                onClick={() => {
                    setIsBatch(false)
                    setSelectedTagIds([])
                }}
                icon={<ExportOutlined />}
            >退出批量操作</Button>
            <Dropdown menu={{ items: moveGroupItems }} placement="bottom">
                <Button
                    icon={<SwapOutlined />}
                >批量移动分组</Button>
            </Dropdown>
            <Button
                onClick={() => setShowColorPicker(true)}
                icon={<BgColorsOutlined />}
            >批量设置颜色</Button>
            <Button
                onClick={onSaveDelete}
                danger
                icon={<DeleteOutlined />}
            >批量删除</Button>
        </>)
    }

    const renderBatchModal = () => {
        return (<>
            <ColorPicker
                onChange={onSaveColor}
                visible={showColorPicker}
                onClose={() => setShowColorPicker(false)}
            />
        </>)
    }

    return {
        isBatch, isTagSelected, renderBatchBtn, renderBatchModal, onSelectTag
    }
}