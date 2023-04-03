import React, { FC, useEffect, useMemo, useState } from 'react'
import { AddTag, EditTagEntry } from '@/client/components/Tag'
import { Tag } from 'antd'
import { useAddTag, useQueryTagList } from '@/client/services/tag'
import { TagListItem } from '@/types/tag'
import Loading from '@/client/layouts/Loading'
import { useUpdateArticle } from '@/client/services/article'

interface Props {
    /**
     * 当前文章 id
     */
    articleId: number
    /**
     * 当前文章选中的标签
     */
    value: number[]
    /**
     * 是否禁用编辑
     */
    disabled?: boolean
}

const TagArea: FC<Props> = (props) => {
    const { articleId, value = [], disabled } = props
    // 新增标签
    const { mutateAsync: addTag, isLoading: isAddingTag } = useAddTag()
    // 整个标签列表
    const { data: tagListResp, isLoading: isLoadingTagList } = useQueryTagList()
    // 更新文章选中的标签列表
    const { mutateAsync: updateArticle } = useUpdateArticle()
    // 是否处于编辑状态
    const [editingTag, setEditingTag] = useState(false)

    // 当前要显示的标签列表
    const tagList = useMemo(() => {
        if (!tagListResp?.data) return []
        if (editingTag) return tagListResp.data

        // 非编辑状态下，只显示当前文章选中的标签
        return tagListResp.data.filter(tag => value.includes(tag.id))
    }, [tagListResp, editingTag, value])
    
    // 禁用时，不显示编辑按钮
    useEffect(() => {
        if (disabled) setEditingTag(false)
    }, [disabled])

    const onClickAddBtn = async (newLabel: string) => {
        if (!newLabel) return
        // 先添加标签
        const resp = await addTag({ title: newLabel, color: '#404040' })
        if (!resp?.data) return

        // 再更新文章的标签列表
        updateArticle({ id: articleId, tagIds: [...value, resp.data] })
    }

    const onClickTag = (id: number) => {
        // TODO: 跳转到搜索页
        if (!editingTag) return

        // 更新文章的标签列表
        const newSelected = value.includes(id)
            ? value.filter(v => v !== id)
            : [...value, id]

        updateArticle({ id: articleId, tagIds: newSelected })
    }

    const renderTagItem = (item: TagListItem) => {
        const selected = editingTag ? value.includes(item.id) : true
        return (
            <Tag
                key={item.id}
                color={item.color}
                style={{ cursor: 'pointer', opacity: selected ? 1 : 0.3 }}
                onClick={() => onClickTag(item.id)}
            >{item.title}</Tag>
        )
    }

    const renderTagList = () => {
        if (isLoadingTagList) return <Loading tip='标签加载中...' />
        if (!tagList) return <div>暂无标签</div>
        return tagList.map(renderTagItem)
    }

    return (
        <div style={{ marginBottom: '1rem' }}>
            {renderTagList()}
            {editingTag && (
                <AddTag onFinish={onClickAddBtn} loading={isAddingTag} />
            )}
            {!disabled && (
                <EditTagEntry
                    onClick={() => setEditingTag(!editingTag)}
                    label={editingTag ? '结束编辑' : (tagList.length > 0 ? '编辑标签' : '新增标签')}
                />
            )}
        </div>
    )
}

export default TagArea