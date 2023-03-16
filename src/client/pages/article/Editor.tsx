/* eslint-disable react/display-name */
import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import gfm from '@bytemd/plugin-gfm'
import { Editor as MdEditor } from '@bytemd/react'
import mediumZoom from '@bytemd/plugin-medium-zoom'
import { fileUploader } from '@/client/components/FileUploaderPlugin'

const plugins = [
    gfm(),
    mediumZoom(),
    fileUploader()
    // Add more plugins here
]
interface Props {
    value: string
    onChange: (value: string) => void
    /**
     * 通过拖拽、粘贴形式上传了文件
     */
    onUploadFile: (files: File[]) => Promise<unknown>
}

export interface EditorRef {
    el: HTMLTextAreaElement | null
}

const Editor = forwardRef<EditorRef, Props>((props, ref) => {
    // 文本输入框引用
    const textAreaRef = useRef<HTMLTextAreaElement>(null)
    // 是否拖动文件过来了
    const [isDragFile, setIsDragFile] = useState(false)
    // 文件选择回调引用
    const onUploadFileRef = useRef(props.onUploadFile)
    onUploadFileRef.current = props.onUploadFile

    useImperativeHandle(ref, () => ({
        el: textAreaRef.current
    }))

    // useEffect(() => {
    //     const el = document.querySelector('.CodeMirror-code')
    //     console.log('🚀 ~ file: Editor.tsx:38 ~ useEffect ~ el:', el)
    //     // const el = textAreaRef.current
    //     if (!el) return

    //     const pasteCallback = (e: ClipboardEvent) => {
    //         if (!e.clipboardData?.files) return
    //         const files = Array.from(e.clipboardData.files)
    //         onUploadFileRef.current(files)
    //     }
    //     el.addEventListener('paste', pasteCallback)

    //     const dragenterCallback = () => {
    //         setIsDragFile(true)
    //     }
    //     el.addEventListener('dragenter', dragenterCallback)

    //     const dragleaveCallback = () => {
    //         setIsDragFile(false)
    //     }
    //     el.addEventListener('dragleave', dragleaveCallback)

    //     const dragdropCallback = (e: DragEvent) => {
    //         e.stopPropagation()
    //         e.preventDefault()
    //         setIsDragFile(false)
    //         if (!e.dataTransfer?.files) return
    //         const files = Array.from(e.dataTransfer.files)
    //         onUploadFileRef.current(files)
    //     }
    //     el.addEventListener('drop', dragdropCallback)

    //     return () => {
    //         el.removeEventListener('paste', pasteCallback)
    //         el.removeEventListener('dragenter', dragenterCallback)
    //         el.removeEventListener('dragleave', dragleaveCallback)
    //         el.removeEventListener('drop', dragdropCallback)
    //     }
    // }, [])

    return (
        // <textarea
        //     ref={textAreaRef}
        //     placeholder="写点什么"
        //     autoFocus
        //     className={'w-full ' + (isDragFile ? 'ring-2 ring-green-400' : '')}
        //     style={{ height: 'calc(100vh - 186px)', resize: 'none' }}
        //     value={props.value}
        //     onChange={e => props.onChange(e.target.value)}
        // />
        <MdEditor
            value={props.value}
            mode="split"
            plugins={plugins}
            onChange={props.onChange}
            // uploadImages={async (files: File[]) => {
            //     console.log(files)
            // }}
        />
    )
}) 

export default Editor