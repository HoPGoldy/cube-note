import React, { FC, useState, FocusEvent } from 'react'
import { blurOnEnter } from '../utils/input'

interface Props {
    label: string
    id: number
    color?: string
    /** 是否被选中 */
    selected?: boolean
    /** 标签被点击 */
    onClick?: (id: number) => void
}

export const Tag: FC<Props> = (props) => {
    const { label, onClick, id, color = 'blue', selected = true } = props

    return (
        <div
            className='rounded px-2 mb-1 mr-1 text-white cursor-pointer h-min'
            style={{ backgroundColor: color, opacity: selected ? 1 : 0.3 }}
            onClick={() => onClick?.(id)}
        >
            {label}
        </div>
    )
}

interface AddTagProps {
    onFinish: (value: string) => Promise<void> | void
    loading?: boolean
}

export const AddTag: FC<AddTagProps> = (props) => {
    const { onFinish, loading } = props
    const [editing, setEditing] = useState(false)

    const onInputed = async (e: FocusEvent<HTMLInputElement, Element>) => {
        await onFinish(e.target.value)
        setEditing(false)
    }

    const renderContent = () => {
        if (!editing) return (
            <div onClick={() => setEditing(true)}>
                + 新增
            </div>
        )

        return (
            <input
                className='bg-transparent outline-none'
                autoFocus
                onKeyUp={blurOnEnter}
                onBlur={onInputed}
                disabled={loading}
            />
        )
    }

    return (
        <div
            className='rounded px-2 mb-1 mr-1 border border-slate-600 cursor-pointer h-min'
        >
            {renderContent()}
        </div>
    )
}

interface EditTagEntryProps {
    label: string
    onClick?: () => void
}

export const EditTagEntry: FC<EditTagEntryProps> = (props) => {
    return (
        <div
            className='rounded px-2 mb-1 mr-1 border border-slate-600 cursor-pointer'
            onClick={props.onClick}
        >
            {props.label}
        </div>
    )
}