import { useUploadMutation } from '@/client/services/file'
import { STATUS_CODE } from '@/config'
import { FileStorage } from '@/types/file'
import { Dispatch, RefObject, SetStateAction } from 'react'
import { EditorRef } from './Editor'

interface Props {
    editorRef: RefObject<EditorRef>
    setContent: Dispatch<SetStateAction<string>>
}

/**
 * 文件上传 hook
 */
export const useUpload = function (props: Props) {
    const { editorRef, setContent } = props
    const [uploadFile] = useUploadMutation()
    
    // 把上传完成的文件链接追加到文章内容里
    const addLinkToContent = (fileInfo: FileStorage[]) => {
        setContent(oldContent => {
            const { selectionStart = 0, selectionEnd = 0 } = editorRef.current?.el || {}
            const newInsertContent = fileInfo.map(f => {
                // 后缀名
                const [name, suffix ] = f.filename.split('.')
                return `\n![${name}](/api/file/${f.md5}.${suffix})\n`
            }).join('')
            const newContent = oldContent.slice(0, selectionStart) + newInsertContent + oldContent.slice(selectionEnd)
            return newContent
        })

        editorRef.current?.el?.focus()
    }

    // 执行上传文件
    const upload = async (files: File[]) => {
        const formData = new FormData()
        files.forEach(file => formData.append('file', file))
        const resp = await uploadFile(formData).unwrap()
        if (resp.code !== STATUS_CODE.SUCCESS || !resp.data) return

        addLinkToContent(resp.data)
        return resp.data
    }

    return { upload }
}