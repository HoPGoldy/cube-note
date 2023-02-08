import React, { FC } from 'react'
import { Popup } from 'react-vant'

interface Props {
  value?: string
  onChange?: (value: string) => void
  visible: boolean
  onClose: () => void
}

const MARK_COLORS: string[] = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
]

export const ColorPicker: FC<Props> = (props) => {
    const { value, onChange, visible, onClose } = props

    const renderMarkColor = (color: string) => {
        return (
            <div
                key={color}
                className={
                    'w-6 h-6 rounded-full cursor-pointer m-4 hover:ring-2 hover:ring-gray-300 ' +
                    'active:ring-slate-700 dark:active:ring-slate-300 transition ' +
                    (value === color ? 'ring-2 ring-slate-700 dark:ring-slate-300 ' : '') +
                    (color === '' ? 'remove-mark-color' : '')
                }
                style={{ backgroundColor: color }}
                onClick={() => {
                    onChange?.(color)
                    onClose()
                }}
            />
        )
    }

    return (
        <Popup
            round
            className='w-[90%] md:w-1/2'
            visible={visible}
            onClose={onClose}
        >
            <div className='p-4 flex flex-row flex-wrap justify-center'>
                {MARK_COLORS.map(renderMarkColor)}
                {renderMarkColor('')}
            </div>
        </Popup>
    )
}