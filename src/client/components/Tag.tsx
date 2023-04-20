import React, { FC, useState, FocusEvent } from 'react'
import { blurOnEnter } from '../utils/input'
import { Tag as AntdTag } from 'antd'

interface Props {
    color?: string
    /** 是否被选中 */
    selected?: boolean
    /** 标签被点击 */
    onClick?: () => void
    children?: React.ReactNode
}

export const Tag: FC<Props> = (props) => {
    const { onClick, color = 'blue', selected = true, children } = props

    return (
        <AntdTag
            color={color}
            style={{ cursor: 'pointer', opacity: selected ? 1 : 0.5 }}
            onClick={onClick}
        >{children}</AntdTag>
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
            <span onClick={() => setEditing(true)}>
                + 新增
            </span>
        )

        return (
            <input
                autoFocus
                onKeyUp={blurOnEnter}
                onBlur={onInputed}
                style={{ width: '4rem' }}
                className="dark:text-neutral-200"
                disabled={loading}
            />
        )
    }

    return (
        <AntdTag style={{ cursor: 'pointer' }}>
            {renderContent()}
        </AntdTag>
    )
}

interface EditTagEntryProps {
    label: string
    onClick?: () => void
}

export const EditTagEntry: FC<EditTagEntryProps> = (props) => {
    return (
        <AntdTag
            style={{ cursor: 'pointer' }}
            onClick={props.onClick}
        >{props.label}</AntdTag>
    )
}