import React, { FC, useRef, useEffect, useState } from 'react'

interface Props {
    value: string
    onChange: (value: string) => void
    /**
     * 通过拖拽、粘贴形式上传了文件
     */
    onUploadFile: (files: File[]) => Promise<unknown>
}

const Editor: FC<Props> = (props) => {
    // 文本输入框引用
    const textAreaRef = useRef<HTMLTextAreaElement>(null)
    // 是否拖动文件过来了
    const [isDragFile, setIsDragFile] = useState(false)
    // 文件选择回调引用
    const onUploadFileRef = useRef(props.onUploadFile)
    onUploadFileRef.current = props.onUploadFile

    useEffect(() => {
        const el = textAreaRef.current
        if (!el) return

        const pasteCallback = (e: ClipboardEvent) => {
            if (!e.clipboardData?.files) return
            const files = Array.from(e.clipboardData.files)
            onUploadFileRef.current(files)
        }
        el.addEventListener('paste', pasteCallback)

        const dragenterCallback = () => {
            setIsDragFile(true)
        }
        el.addEventListener('dragenter', dragenterCallback)

        const dragleaveCallback = () => {
            setIsDragFile(false)
        }
        el.addEventListener('dragleave', dragleaveCallback)

        const dragdropCallback = (e: DragEvent) => {
            e.stopPropagation()
            e.preventDefault()
            setIsDragFile(false)
            if (!e.dataTransfer?.files) return
            const files = Array.from(e.dataTransfer.files)
            onUploadFileRef.current(files)
        }
        el.addEventListener('drop', dragdropCallback)

        return () => {
            el.removeEventListener('paste', pasteCallback)
            el.removeEventListener('dragenter', dragenterCallback)
            el.removeEventListener('dragleave', dragleaveCallback)
            el.removeEventListener('drop', dragdropCallback)
        }
    }, [])

    return (
        <textarea
            ref={textAreaRef}
            placeholder="写点什么"
            autoFocus
            className={'w-full ' + (isDragFile ? 'ring-2 ring-green-400' : '')}
            style={{ height: 'calc(100vh - 186px)', resize: 'none' }}
            value={props.value}
            onChange={e => props.onChange(e.target.value)}
        />
    )
}

export default Editor