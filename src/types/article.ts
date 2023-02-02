export interface ArticleStorage {
    title: string
    content: string
    createTime: number
    updateTime: number
    /**
     * 该文章是否收藏
     */
    favorite: boolean
    /**
     * 祖先文章 id 列表
     * 如果是跟节点的话，就没有这个属性
     * 会包含当前文章的所有祖先节点
     */
    parentArticleIds: string[]
    /**
     * 相关文章 id 列表
     */
    relatedArticleIds: string[]
    /**
     * 相关 tag id 列表
     */
    tagIds: string[]
}

export interface AddArticlePostData {
    title: string
    content: string
    parentId: string
}

export type UpdateArticlePostData = Partial<AddArticlePostData> & {
    id: string
    favorite?: boolean
}

export interface DeleteArticleMutation {
    id: string
    force: boolean
}

export interface ArticleMenuItem {
    _id: string
    title: string
}

export enum TabTypes {
    Sub = 'sub',
    Related = 'related',
    Favorite = 'favorite',
}

export type ArticleMenuResp = {
    [key in TabTypes]: ArticleMenuItem[]
}

export interface ArticleContentResp {
    _id: string
    title: string
    content: string
    createTime: number
    updateTime: number
    favorite: boolean
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

export interface ArticleUpdateLinkMutation {
    selfId: string
    relatedIds: string[]
}
