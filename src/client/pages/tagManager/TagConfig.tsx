import React, { useState } from 'react'
import { TagListItem } from '@/types/tag'
import { useDeleteTagsMutation, useUpdateTagMutation } from '../../services/tag'
import { Button } from '../../components/Button'
import { messageSuccess } from '../../utils/message'
import { ColorPicker } from '@/client/components/ColorPicker'
import { STATUS_CODE } from '@/config'
import { Popup } from 'react-vant'
import { blurOnEnter } from '@/client/utils/input'
import { GroupPicker } from '@/client/components/GroupPicker'

export const useTagConfig = () => {
    // 当前选中的标签详情
    const [currentTag, setCurrentTag] = useState<TagListItem | null>(null)
    // 是否显示颜色选择弹窗
    const [showColorPicker, setShowColorPicker] = useState(false)
    // 是否显示分组选择弹窗
    const [showGroupPicker, setShowGroupPicker] = useState(false)
    // 删除标签
    const [deleteTag] = useDeleteTagsMutation()
    // 更新标签
    const [updateTag, { isLoading: isSavingTag }] = useUpdateTagMutation()

    const showTagDetail = (item: TagListItem) => {
        setCurrentTag(item)
    }

    const onClose = () => {
        setCurrentTag(null)
    }

    const onChangeDetail = (value: Partial<TagListItem>) => {
        setCurrentTag(prev => {
            if (!prev) return null
            return {
                ...prev,
                ...value
            }
        })
    }

    const onDeleteTag = async () => {
        if (!currentTag) return
        const resp = await deleteTag({ ids: [currentTag._id] }).unwrap()
        if (resp.code !== STATUS_CODE.SUCCESS) return
        messageSuccess('删除成功')
        onClose()
    }

    const saveChange = async () => {
        if (!currentTag) return
        const resp = await updateTag(currentTag).unwrap()
        if (resp.code !== STATUS_CODE.SUCCESS) return
        messageSuccess('保存成功')
        onClose()
    }

    const renderTagDetail = () => {
        return (<>
            <Popup
                round
                visible={!!currentTag}
                onClose={onClose}
            >
                <div className='p-4'>
                    <div>
                        标签名称：<input
                            className='font-bold'
                            value={currentTag?.title || ''}
                            onChange={e => onChangeDetail({ title: e.target.value })}
                            onKeyUp={blurOnEnter}
                        />
                    </div>
                    <div>
                        标签颜色：
                        <div
                            className='inline-block w-6 h-6 ml-2 rounded-full'
                            style={{ backgroundColor: currentTag?.color }}
                            onClick={() => setShowColorPicker(true)}
                        />
                    </div>
                    <div>
                        当前分组 id：
                        {currentTag?.groupId || '无分组'}
                    </div>
                    <div>
                        <Button
                            type="danger"
                            onClick={onDeleteTag}
                        >删除标签</Button>
                        <Button
                            type="primary"
                            onClick={() => setShowGroupPicker(true)}
                        >转移分组</Button>
                        <Button
                            type="primary"
                            onClick={saveChange}
                            loading={isSavingTag}
                        >保存</Button>
                    </div>
                </div>
            </Popup>
            <ColorPicker
                onChange={color => onChangeDetail({ color })}
                visible={showColorPicker}
                onClose={() => setShowColorPicker(false)}
            />
            <GroupPicker
                value={currentTag?.groupId || ''}
                onChange={group => onChangeDetail({ groupId: group._id })}
                visible={showGroupPicker}
                onClose={() => setShowGroupPicker(false)}
            />
        </>
        )
    }

    return {
        showTagDetail, renderTagDetail
    }
}