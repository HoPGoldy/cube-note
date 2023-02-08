import React, { useState } from 'react'
import { FontendTagListItem, TagGroupListItem } from '@/types/tag'
import { useSetTagColorMutation } from '../../services/tag'
import { messageSuccess, messageWarning } from '../../utils/message'
import { ColorPicker } from '@/client/components/ColorPicker'
import { STATUS_CODE } from '@/config'

interface Props {
    groupedTagDict: Record<string, FontendTagListItem[]>
}

export const useSetGroupColor = (props: Props) => {
    // 当前选中的分组
    const [currentGroup, setCurrentGroup] = useState<TagGroupListItem | null>(null)
    // 批量设置分组颜色
    const [setGroupColor] = useSetTagColorMutation()

    const onClickSetGroupColor = (item: TagGroupListItem) => {
        setCurrentGroup(item)
    }

    const onClosePicker = () => {
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

    const renderColorPicker = () => {
        return (
            <ColorPicker
                onChange={onSelectedColor}
                visible={!!currentGroup}
                onClose={onClosePicker}
            />
        )
    }

    return {
        onClickSetGroupColor, renderColorPicker
    }
}