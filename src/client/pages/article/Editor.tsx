import React, { FC, useRef } from 'react'

interface Props {
    value: string
    onChange: (value: string) => void
}

const Editor: FC<Props> = (props) => {
    // 文本输入框引用
    const textAreaRef = useRef<HTMLTextAreaElement>(null)

    return (
        <textarea
            ref={textAreaRef}
            placeholder="写点什么"
            autoFocus
            className="w-full bg-cardBackground"
            style={{ height: 'calc(100vh - 186px)', resize: 'none' }}
            value={props.value}
            onChange={e => props.onChange(e.target.value)}
        />
    )
}

export default Editor