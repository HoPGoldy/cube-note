import React, { useMemo, useState } from 'react'
import { Editor as MdEditor } from '@bytemd/react'
import { plugins } from '@/client/components/FileUploaderPlugin'
import throttle from 'lodash/throttle'
import { useUpdateArticleMutation } from '@/client/services/article'
import { STATUS_CODE } from '@/config'
import { messageError } from '@/client/utils/message'

interface Props {
    onChange: (value: string) => void
    onAutoSave: () => void
    articleId: number
}

export const useEditor = (props: Props) => {
    // 正在编辑的文本内容
    const [content, setContent] = useState('')
    // 保存详情
    const [updateArticle] = useUpdateArticleMutation()

    // 自动保存
    const autoSave = async (id: number, content = '') => {
        const resp = await updateArticle({ id, content }).unwrap()
        if (resp.code !== STATUS_CODE.SUCCESS) {
            messageError('自动保存失败')
            localStorage.setItem('article-autosave-content', content)
            localStorage.setItem('article-autosave-id', id.toString())
            localStorage.setItem('article-autosave-date', Date.now().toString())
            return
        }

        props.onAutoSave()
    }

    // 编辑时的节流
    const onContentChangeThrottle = useMemo(() => throttle(newContent => {
        props.onChange(newContent)
        autoSave(props.articleId, newContent)
    }, 500), [props.onChange, props.articleId])

    // 编辑时触发节流
    const onContentChange = (newContent: string) => {
        setContent(newContent)
        onContentChangeThrottle(content)
    }

    const renderEditor = () => {
        return (
            <MdEditor
                value={content}
                mode="split"
                plugins={plugins}
                onChange={onContentChange}
            />
        )
    }

    return { renderEditor, setEditorContent: setContent }
}
