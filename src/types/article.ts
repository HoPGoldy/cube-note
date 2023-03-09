export interface ArticleStorage {
    id: number
    title: string
    content: string
    createUserId: number
    createTime: number
    updateTime: number
    /**
     * 祖先文章路径，用于快速查询
     * 以#分隔，如：#1#2#3
     */
    parentPath: string
}

export interface AddArticleReqData {
    title: string
    content: string
    parentId: number
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
    id: number
    force: boolean
}

export interface ArticleMenuItem {
    id: number
    title: string
}

export enum TabTypes {
    Sub = 'sub',
    Related = 'related',
    Favorite = 'favorite',
}

export interface ArticleContent {
    id: number
    title: string
    content: string
    createTime: number
    updateTime: number
    parentArticleId: number
    tagIds?: string[]
}

export interface ArticleLinkResp {
    parentArticleId: number
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
    deletedArticleIds: number[]
    parentArticleId?: number
}
