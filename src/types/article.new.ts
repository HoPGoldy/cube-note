export interface ArticleStorage {
    id: string
    title: string
    content: string
    createTime: number
    updateTime: number
    /**
     * 祖先文章 id
     * 如果是根节点的话，就没有这个属性
     */
    parentArticleId: string
    /**
     * 相关文章 id 列表
     * 逗号分隔
     */
    relatedArticleIds: string
    /**
     * 相关 tag id 列表
     * 逗号分隔
     */
    tagIds: string
}

export interface AddArticleReqData {
    title: string
    content: string
    parentId: string
}

export interface QueryArticleReqData {
    keyword?: string
    tagIds?: string[]
    page?: number
}

export type UpdateArticleReqData = Partial<ArticleContent> & {
    id: string
    relatedArticleIds?: string[]
}

export interface DeleteArticleMutation {
    id: string
    force: boolean
}

export interface ArticleMenuItem {
    id: string
    title: string
}

export enum TabTypes {
    Sub = 'sub',
    Related = 'related',
    Favorite = 'favorite',
}

export interface ArticleContent {
    id: string
    title: string
    content: string
    createTime: number
    updateTime: number
    parentArticleId: string
    tagIds: string[]
}

export interface ArticleLinkResp {
    parentArticleId: string
    parentArticleTitle: string
    childrenArticles: ArticleMenuItem[]
}

export interface ArticleRelatedResp {
    relatedArticles: ArticleMenuItem[]
}

export interface ArticleTreeNode {
    value: string
    title: string
    children?: ArticleTreeNode[]
}

export interface ArticleDeleteResp {
    deletedArticleIds: string[]
    parentArticleId: string
}

export interface ArticleUpdateResp {
    parentArticleId: string
}
