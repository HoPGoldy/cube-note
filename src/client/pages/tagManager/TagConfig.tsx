import React, { useState } from 'react'
import { FontendTagListItem, TagGroupListItem } from '@/types/tag'
import { useSetTagColorMutation } from '../../services/tag'
import { Button } from '../../components/Button'
import { messageSuccess, messageWarning } from '../../utils/message'
import { ColorPicker } from '@/client/components/ColorPicker'
import { STATUS_CODE } from '@/config'

interface Props {
    groupedTagDict: Record<string, FontendTagListItem[]>
}

export const useTagConfig = (props: Props) => {
    // 是否显示颜色选择器
    const [showColorPicker, setShowColorPicker] = useState(false)
    // 当前选中的分组
    const [currentGroup, setCurrentGroup] = useState<TagGroupListItem | null>(null)
    // 批量设置分组颜色
    const [setGroupColor] = useSetTagColorMutation()

    const onClickSetGroupColor = (item: TagGroupListItem) => {
        setCurrentGroup(item)
        setShowColorPicker(true)
    }

    const onClosePicker = () => {
        setShowColorPicker(false)
        setCurrentGroup(null)
    }

    const onSelectedColor = async (color: string) => {
        if (!currentGroup) return
        const tagIds = props.groupedTagDict[currentGroup._id]
            ?.filter(item => item.color !== color)
            .map(item => item._id) || []
        
        if (tagIds.length === 0) {
            messageWarning('没有需要修改的标签')
            return
        }

        const resp = await setGroupColor({ ids: tagIds, color }).unwrap()
        if (resp.code !== STATUS_CODE.SUCCESS) return
        messageSuccess('修改成功')
    }

    const renderSetGroupColorBtn = (item: TagGroupListItem) => {
        return (
            <Button
                onClick={() => onClickSetGroupColor(item)}
            >设置分组颜色</Button>
        )
    }

    const renderColorPicker = () => {
        return (
            <ColorPicker
                onChange={onSelectedColor}
                visible={showColorPicker}
                onClose={onClosePicker}
            />
        )
    }

    return {
        renderSetGroupColorBtn, renderColorPicker
    }
}