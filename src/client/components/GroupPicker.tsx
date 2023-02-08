import { TagGroupListItem } from '@/types/tag'
import React, { FC } from 'react'
import { Popup } from 'react-vant'
import { useGetTagGroupQuery } from '../services/tag'

interface Props {
  value?: string
  onChange?: (item: TagGroupListItem) => void
  visible: boolean
  onClose: () => void
}

export const GroupPicker: FC<Props> = (props) => {
    const { value, onChange, visible, onClose } = props
    // 获取标签分组
    const { data: tagGroupResp } = useGetTagGroupQuery()

    const renderGroupItem = (item: TagGroupListItem) => {
        return (
            <div
                key={item._id}
                className={
                    'rounded-lg  ring-slate-300 py-2 mt-2 transition border border-slate-300 cursor-pointer ' +
                    'hover:ring hover:ring-slate-500 active:scale-90 dark:text-slate-200 ' +
                    (value === item._id
                        // 选中样式
                        ? 'bg-slate-500 text-white hover:bg-slate-500 dark:hover:bg-slate-800'
                        // 未选中样式
                        : 'hover:bg-slate-300 dark:hover:bg-slate-500 hover:text-black '
                    )
                }
                onClick={() => {
                    onChange?.(item)
                    onClose()
                }}
            >{item.title}</div>
        )
    }

    return (
        <Popup
            round
            className='w-[90%] md:w-1/2'
            visible={visible}
            onClose={onClose}
        >
            <div className='text-center p-4'>
                {tagGroupResp?.data?.map(renderGroupItem)}
            </div>
        </Popup>
    )
}