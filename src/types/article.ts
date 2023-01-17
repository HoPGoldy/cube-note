export interface ArticleStorage {
    title: string
    content: string
    createTime: number
    updateTime: number
    /**
     * 父级文章 id
     */
    parentArticleId: string
    /**
     * 下属文章 id
     */
    childrenArticleIds: string[]
    /**
     * 相关文章 id
     */
    relatedArticleIds: string[]
    /**
     * 相关 tag id
     */
    tagIds: string[]
}

export interface AddArticlePostData {
    title: string
    content: string
    parentId: string
}