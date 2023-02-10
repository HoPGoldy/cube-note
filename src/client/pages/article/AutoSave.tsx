import { useUpdateArticleMutation } from '@/client/services/article'
import { STATUS_CODE } from '@/config'
import dayjs from 'dayjs'
import { useEffect, useRef } from 'react'

/**
 * 自动保存 hook
 * 将每隔一段时间自动将内容提交到后端，并把保存结果返回出去
 */
export const useAutoSave = function (isEdit: boolean, articleId: string, setSaveBtnText: (text: string) => void) {
    // 保存详情
    const [updateArticle] = useUpdateArticleMutation()
    // 文本内容引用
    const contentRef = useRef<string | null>(null)

    useEffect(() => {
        if (!isEdit) return

        const timer = setInterval(async () => {
            const content = contentRef.current

            const resp = await updateArticle({ id: articleId, content: content || '' }).unwrap()
            if (resp.code !== STATUS_CODE.SUCCESS) {
                setSaveBtnText('自动保存失败')
                return
            }
            setSaveBtnText(`自动保存于 ${dayjs().format('HH:mm')}`)
        }, 20 * 1000)

        return () => clearInterval(timer)
    }, [articleId, isEdit])

    /**
     * 从本地读取保存的内容
     * 如果没有保存就会返回 undefined
     */
    const getLocalSaveContent = () => {
        const content = localStorage.getItem(`article-autosave-${articleId}`)
        const saveDate = localStorage.getItem(`article-autosave-date-${articleId}`)
        if (!content || !saveDate) return undefined

        return { content, saveDate: +saveDate }
    }

    /**
     * 保存编辑内容到本地
     */
    const saveToLocal = (content: string) => {
        localStorage.setItem(`article-autosave-${articleId}`, content)
        localStorage.setItem(`article-autosave-date-${articleId}`, Date.now().toString())
    }

    return { contentRef, getLocalSaveContent, saveToLocal }
}